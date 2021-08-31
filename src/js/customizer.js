import { h, Fragment, render, Component } from "preact";
import $ from "./lib/qsa";
import stateSheet from "states.sheet.json";
import strings from "strings.sheet.json";
import options from "customizer_options.sheet.json";
import Sidechain from "@nprapps/sidechain";

class Customizer extends Component {
  constructor() {
    super();
    this.state = {
      mode: "state",
      selectedState: "CA",
      selectedOffice: "",
      races: [],
      raceID: null,
      dark: false,
      showPresident: false,
      onlyPresident: false,
      inline: false
    }

    this.selectStatePage = this.selectStatePage.bind(this);
    this.selectStateOffice = this.selectStateOffice.bind(this);
    this.loadStateRaces = this.loadStateRaces.bind(this);
    this.selectRace = this.selectRace.bind(this);
  }

  componentDidMount() {
    this.loadStateRaces(this.state.selectedState);
  }

  selectStatePage(e) {
    this.setState({
      selectedState: e.target.value,
      selectedOffice: null,
      races: []
    });
    this.loadStateRaces(e.target.value);
  }

  selectStateOffice(e) {
    this.setState({ selectedOffice: e.target.value })
  }

  selectRace(e) {
    this.setState({ raceID: e.target.value })
  }

  setFlag(flag, value) {
    this.setState({ [flag]: value });
  }

  async loadStateRaces(state) {
    this.setState({ selectedState: state, races: [], raceID: null });
    var response = await fetch(`./data/states/${state}.json`);
    var json = await response.json();
    this.setState({ races: json.results });
  }

  embeds(src, id) {
    return (<>
      <h2>Embeds</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; grid-gap: 8px">
        <div>
          <h3>Pym</h3>
          <textarea rows="6" style="width:100%">
          {`<p
            data-pym-loader
            data-child-src="${src}"
            id="${id}">
              Loading...
          </p>
          <script src="https://pym.nprapps.org/npr-pym-loader.v2.min.js"></script>`.replace(/\s{2,}|\n/g, " ")}
          </textarea>
        </div>
        <div>
          <h3>Sidechain</h3>
          <textarea rows="6" style="width:100%">
          {`<side-chain src="${src}"></side-chain>
          <script src="https://apps.npr.org/elections20-interactive/sidechain.js"></script>`.replace(/\s{2,}|\n/g, " ")}
          </textarea>
        </div>
      </div>
    </>);
  }

  board(free, props, state) {
    var { url } = free;
    var src = url + `#/${state.mode}`;
    return (<>
      {this.embeds(src, `responsive-embed-election-${state.selectedState}-${state.mode}`)}
      <h2>Preview</h2>
      <side-chain
        key={state.raceID}
        src={src}
      />
    </>);
  }

  statePage(free, props, state) {
    var { url, offices, postals } = free;
    var src = `${url}#/states/${state.selectedState}/${state.selectedOffice || ''}`;
    return (<>
      <div class="state-select">
        <select value={state.selectedState} onInput={this.selectStatePage}>
          {postals.map(s => <option value={s}>{stateSheet[s].name}</option>)}
        </select>
        <select value={state.selectedOffice} onInput={this.selectStateOffice}>
          <option value="">Select a race</option>
          {offices.map(([data, label]) => (
            <option value={data}>{label}</option>
          ))}
        </select>
      </div>
      {this.embeds(src, `responsive-embed-election-${state.selectedState}-${state.selectedOffice || "X"}`)}
      <h2>Preview</h2>
      <side-chain 
        key={state.selectedState} 
        src={src} />
    </>);
  }

  county(free, props, state) {
    var { url, offices, postals } = free;
    var [opts] = options.filter(o => o.state == state.selectedState && o.tag == state.mode);
    var displayOffices = opts ? offices.filter(o => opts.races.includes(o[0])) : offices;
    var [race] = state.races.filter(r => r.office == state.selectedOffice);
    var raceId = race ? race.id : '';
    var src = `${url}#/states/${state.selectedState}/counties/${raceId}`;

    return (<>
      <div class="state-select">

        <select value={state.selectedState} onInput={this.selectStatePage}>
          {postals.map(s => <option value={s}>{stateSheet[s].name}</option>)}
        </select>
        <select value={state.selectedOffice} onInput={this.selectStateOffice}>
        <option value="">Select a race</option>
          {displayOffices.map(([data, label]) => (
            <option value={data}>{label}</option>
          ))}
        </select>
      </div>
      {race && <>
        {this.embeds(src, `responsive-embed-election-${state.selectedState}-${race.id}`)}
        <h2>Preview</h2>
        <side-chain
          key={raceId}
          src={src}
        />
      </>}
    </>);
  }

  race(free, props, state) {
    var { url, postals } = free;
    var src = "";
    if (state.raceID) {
      var assembly = new URL(url + "./embed.html");
      assembly.searchParams.set("file", `states/${state.selectedState}`);
      assembly.searchParams.set("race", state.raceID);
      src = assembly.toString();
    }
    return (<>
      <div class="state-select">
        <select value={state.selectedState} onInput={e => this.loadStateRaces(e.target.value)}>
          {postals.map(s => <option value={s}>{stateSheet[s].name}</option>)}
        </select>
        <select value={state.selectedRace} onInput={this.selectRace}>
          <option value="">Select a race</option>
          {state.races.map(r => <option value={r.id}>
            {`${strings["office-" + r.office]} ${r.seat ? r.seat : ""}`}
          </option>)}
        </select>
      </div>
      {state.raceID && <>
        {this.embeds(src, `responsive-embed-election-${state.selectedState}-${state.raceID}`)}
        <h2>Preview</h2>
        <side-chain
          key={state.raceID}
          src={src}
        />
      </>}
    </>);
  }

  render(props, state) {
    var postals = Object.keys(stateSheet).filter(s => !stateSheet[s].district);
    var modes = [
      ["state", "State page"],
      ["county", "County page"],
      ["race", "Individual race"],
    ];

    var offices = [
      ["G", "Governor"],
      ["I", "Ballot initiatives"]
    ];

    var url = new URL(".", window.location.href).toString();

    var { selectedState, mode } = this.state;

    var freeVariables = { url, offices, modes, postals };

    var modePartials = {
      "state": "statePage",
      "race": "race",
      "county": "county"
    };

    var route = modePartials[mode] || "board";

    return (<>
      <div class="mode-select">
      {modes.map(([data, label]) => (<>
        <input
          type="radio"
          name="mode"
          onInput={() => this.setState({ mode: data, selectedOffice: '' })}
          id={`mode-${data}`}
          checked={data == state.mode}
        />
        <label for={`mode-${data}`}>{label}</label>
      </>))}
      </div>
      {this[route](freeVariables, props, state)}
    </>)
  }
}

render(<Customizer />, $.one("main"));