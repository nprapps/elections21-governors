import { h, Component, Fragment } from "preact";
import gopher from "../gopher.js";
import CountyMap from "../countyMap";
import ResultsTableCounty from "../resultsTableCounty";
import { CountyDataViz } from "../countyDataViz";
import { DateFormatter, getFootnote } from "../util";

export default class CountyResults extends Component {
  constructor(props) {
    super();

    this.state = {
      activeView: props.view,
      data: [],
      state: props.state,
      raceid: props.raceid,
    };
    this.onCountyData = this.onCountyData.bind(this);
    this.onData = this.onData.bind(this);
  }

  onCountyData(json) {
    var updated = Math.max(...json.results.map(r => r.updated));
    var event = new CustomEvent("updatedtime", {
      detail: updated,
      bubbles: true,
    });
    this.base.dispatchEvent(event);
    var office = json.results[0].office;
    this.setState({ data: json.results, office });
  }

  onData(json) {
    var results = json.results.filter(r => r.id == this.props.raceid);

    this.setState({ order: results[0].candidates });
  }

  async componentDidMount() {
    gopher.watch(
      `./data/counties/${this.props.state}-${this.props.raceid}.json`,
      this.onCountyData
    );
    gopher.watch(`./data/states/${this.props.state}.json`, this.onData);
  }

  componentWillUnmount() {
    gopher.unwatch(
      `./data/counties/${this.props.state}-${this.props.raceid}.json`,
      this.onCountyData
    );
    gopher.unwatch(`./data/states/${this.props.state}.json`, this.onData);
  }

  shouldComponentUpdate(newProps, newState) {
    if (
      this.props.state != newProps.state ||
      this.props.raceid != newProps.raceid
    ) {
      this.setState({
        data: null,
        order: null,
        state: newProps.state,
        raceid: newProps.raceid,
      });
      gopher.unwatch(
        `./data/counties/${this.props.state}-${this.props.raceid}.json`,
        this.onCountyData
      );
      gopher.unwatch(`./data/states/${this.props.state}.json`, this.onData);

      this.props = newProps;
      gopher.watch(
        `./data/counties/${newProps.state}-${newProps.raceid}.json`,
        this.onCountyData
      );
      gopher.watch(`./data/states/${newProps.state}.json`, this.onData);
      
    }
  }

  render() {
    if (!this.state.data.length || !this.state.order) {
      return "";
    }

    // Don't show data viz for special elections as they may have two candidates
    // of the same party running against each other.
    var dataViz;
    // if (!this.props.isSpecial) {
    //   dataViz = (
    //     <CountyDataViz
    //       data={this.state.data}
    //       order={this.state.order.slice(0, 2)}
    //       state={this.state.state.toUpperCase()}
    //     />
    //   );
    // }

    return (
      <div class="results-elements county">
        <h3><span class="embed-text">{this.state.data[0].seat} <br/></span>Results By County</h3>
        <CountyMap
          state={this.state.state.toUpperCase()}
          data={this.state.data}
          sortOrder={this.state.order}
          isSpecial={this.props.isSpecial}
          key={`${this.props.state}-${this.props.raceid}`}
        />
        {dataViz}
        <ResultsTableCounty
          state={this.state.state.toUpperCase()}
          data={this.state.data}
          sortOrder={this.state.order}
          key={`${this.props.state}-${this.props.raceid}`}
        />
        <div class="embed-text">{getFootnote(this.state.data[0].updated, false, true)}</div>
      </div>
    );
  }
}
