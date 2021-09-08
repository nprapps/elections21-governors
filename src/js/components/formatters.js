import { h } from "preact";
import strings from "strings.sheet.json";

var apMonths = [
  "Jan.",
  "Feb.",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
];

export function DateFormatter(props) {
  var dateString = "...";

  if (props) {
    var date = props.value ? new Date(props.value) : new Date(props);
    var hours = date.getHours();
    if (!isNaN(hours)) {
      var suffix = hours < 12 ? "AM" : "PM";
      if (!hours) {
        hours = 12;
      } else if (hours > 12) {
        hours -= 12;
      }
      var minutes = date.getMinutes().toString().padStart(2, "0");
      var month = apMonths[date.getMonth()];
      var day = date.getDate();
      var year = date.getFullYear();
      dateString = `${hours}:${minutes} ${suffix} on ${month} ${day}, ${year}`;
    }
  }
  return <span class="formatted-date">{dateString}</span>;
}

/*
  Text formatting functions, collected in a single object
  Use `chain(a, b, c)` to combine formatters as `c(b(a(value)))`
*/
export var formatters = {
  titleCase: v => v.replace(/(\b\w)/g, s => s.toUpperCase()),
  percent: v => Math.round(v * 100) + "%",
  comma: v => (v * 1).toLocaleString(),
  decimal: v => (v * 1).toFixed(1),
  dollars: v => "$" + v,
  chain: function (formats) {
    return value => formats.reduce((v, fn) => fn(v), value);
  },
  percentDecimal: v => (v * 100).toFixed(1) + "%",
  percentFull: v => v.toFixed(1) + "%",
  voteMargin: function (result) {
    var prefix = getPartyPrefix(result.party);

    return prefix + " +" + Math.round(result.margin * 100);
  },
};

export function getPartyPrefix(party) {
  let prefix;
  if (party === "Dem") {
    prefix = "D";
  } else if (party === "GOP") {
    prefix = "R";
  } else if (party == "Other") {
    prefix = "O";
  } else if (party == "Yes") {
    prefix = "Y";
  } else if (party == "No") {
    prefix = "N";
  } else {
    prefix = "I";
  }
  return prefix;
}

export function getParty(party) {
  if (["Dem", "GOP", "Other", "No", "Yes"].includes(party)) {
    return party;
  }
  // if (party == "NPP") {
  //   return "No affiliation"
  // }
  return "Ind";
}

/*
  Display-friendly formatting for reporting numbers (don't round to 0/100%)
*/
export function reportingPercentage(pct) {
  if (pct > 0 && pct < 0.005) {
    return "<1";
  } else if (pct > 0.995 && pct < 1) {
    return ">99";
  } else {
    return Math.round(pct * 100);
  }
}

export function getFootnote(time, state, county) {
  var stateNote = (
    <span>
      <em>% in</em> for statewide races represents expected vote, an Associated
      Press estimate of the share of total ballots cast in an election that have
      been counted.{" "}
      <a href="https://www.ap.org/en-us/topics/politics/elections/counting-the-vote">
        Read more about how EEVP is calculated.
      </a>{" "}
    </span>
  );
  var countyNote = county ? (
    <span>
      <em>% in</em> for county-level results represents percent of precincts
      reporting.
    </span>
  ) : (
    ""
  );
  var countySource = county ? (
    <span>
      {" "}
      Demographic, income and population data from the Census Bureau. COVID-19
      case data from{" "}
      <a href="https://github.com/CSSEGISandData/COVID-19">
        Center for Systems Science and Engineering at Johns Hopkins University
      </a>{" "}
      as of Sep. 6th. {strings["margins_footnote"]}
    </span>
  ) : (
    ""
  );
  return (
    <div class="source">
      <div class="note">
        Note:{" "}
        <a
          href="https://www.npr.org/2020/10/29/928863973/heres-how-npr-reports-election-results"
          target="_blank">
          Read more about how AP calls races.
        </a>{" "}
        {stateNote} {countyNote}
      </div>
      Source: AP (as of <DateFormatter value={time} />
      ).
      {countySource}
    </div>
  );
}
