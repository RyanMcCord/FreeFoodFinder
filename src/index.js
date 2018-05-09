import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import firebase from 'firebase';

var config = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: ""
};
firebase.initializeApp(config);
var database = firebase.database();
var databaseRef = database.ref("Events");
var Events = [];

// strDate as a tuple: d/m/y
function toTimestamp(strDate){
   var datum = Date.parse(strDate);
   return datum/1000;
}

function checkLocationMatch(eventObj, locationType) {
  var locationMatch = false;
  if (eventObj.locationCategory === locationType ||
      locationType === "any"
  ) {
    locationMatch = true;
  } else {
    locationMatch = false;
  }
  return locationMatch;
}

function checkEventTypeMatch(eventObj, eventType) {
  console.log("row type: " + eventObj.eventType);
  console.log("chosen type: " + eventType);
  return (eventType === "Any" || eventObj.eventType === eventType);
}

function getTodayPlusTime(years, months, days) {
  var today = new Date();
  var date = new Date(today.getFullYear() + years, today.getMonth() + months, today.getDate() + days);
  var dd = date.getDate();
  var mm = date.getMonth()+1; //January is 0!
  var yyyy = date.getFullYear();

  if(dd<10) {
    dd = '0'+dd
  }

  if(mm<10) {
    mm = '0'+mm
  }

  date = mm + '/' + dd + '/' + yyyy;
  return date;
}

function getDateRange(timeType) {
  var startDate = getTodayPlusTime(0, 0, 0);
  var endDate = "";
  switch (timeType) {
    case "alltime":
      endDate = getTodayPlusTime(1, 0, 0);
      break;
    case "today":
      endDate = startDate;
      break;
    case "thisweek":
      endDate = getTodayPlusTime(0, 0, 7);
      break;
    case "thismonth":
      endDate = getTodayPlusTime(0, 1, 0);
      break;
    default:
      console.log("INVALID TIME TYPE: " + timeType);
      endDate = getTodayPlusTime(1, 0, 0);
      break;
  }
  return [startDate, endDate];
}

class Selector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: props.props.view,
    };
  }

  render() {
    console.log("render Selector")
    return(
      <form>
        <div className="viewSelect">
          <label>
            <input type="radio" value="list" checked={this.props.props.view==='list'} onChange={this.props.changeView}/>
            <div className="selectorBG"></div>
            <span className="label">list</span>
          </label>
          <label>
            <input type="radio" value="map" checked={this.props.props.view==='map'} onChange={this.props.changeView}/>
            <div className="selectorBG"></div>
            <span className="label">map</span>
          </label>
        </div>
      </form>
    );
  }
}

class Filters extends React.Component {
  render() {
    console.log("render Filters")
    return(
      <div className="filters">
        <form>
          <div className="filter">
            <span>Location: </span>
            <select value={this.props.locationCategory} onChange={this.props.changeLocation} name="location">
              <option value="any">Any</option>
              <option value="Central">Central</option>
              <option value="North">North</option>
            </select>
          </div>
        </form>
        <form>
          <div className="filter">
            <span>Event Type: </span>
            <select value={this.props.eventCategory} onChange={this.props.changeEvent} name="location">
              <option value="Any">Any</option>
              <option value="Careers / Jobs">Careers / Jobs</option>
              <option value="Ceremony / Service">Ceremony / Service</option>
              <option value="Community Service">Community Service</option>
              <option value="Conference / Symposium">Conference / Symposium</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Health / Wellness">Health / Wellness</option>
              <option value="Lecture / Discussion">Lecture / Discussion</option>
              <option value="Other">Other</option>
              <option value="Performance">Performance</option>
              <option value="Presentation">Presentation</option>
              <option value="Reception / Open House">Reception / Open House</option>
              <option value="Social / Informal Gathering">Social / Informal Gathering</option>
              <option value="Workshop / Seminar">Workshop / Seminar</option>
            </select>
          </div>
        </form>
        <form onSubmit={this.handleSubmit}>
          <div className="filter">
            <span>When: </span>
            <select value={this.props.dateRange} onChange={this.props.changeDate} name="when">
              <option value="alltime">All Time</option>
              <option value="today">Today</option>
              <option value="thisweek">This Week</option>
              <option value="thismonth">This Month</option>
            </select>
          </div>
        </form>
      </div>
    );
  }
}


class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        locationCategory:  props.props.locationCategory,
        eventCateogry : props.props.eventCategory,
        dateRange: props.props.dateRange,
    };
  };
  render() {
    console.log("render ListView")
    return(
      <div className="listView">
        <ul>
          {this.props.props.events.map(i => {
              return (
                <li>
                  <div className="eventItem">
                    <span className="listEventName">
                      {i["eventName"]}
                    </span>
                    <span className="listLocation">
                      {i["location"]}
                    </span>
                    <br />
                    <span className="listEventType">
                      {"Category: " + i["eventType"]}
                    </span>
                    <span className="listDate">
                      {i["date"]}
                    </span>
                    <br />
                    <span className="listBuilding">
                      {i["buildingLocation"] !== "null" ? i["buildingLocation"] : "No Building Provided"}
                    </span>
                    <br />
                    <span className="listAddress">
                      {i["address"] !== "null" ? i["address"] : "No Address Provided"}
                    </span>
                    <br />
                    <br />
                    <span className="listDescription">
                      {i["summary"].substring(0, 400) + "..."}
                    </span>
                    <br />
                    <span className="listTime">
                      {i["time"]}
                    </span>
                    <br/>
                    <a className="listWebsite" href={i["website"]}>
                      {i["website"]}
                    </a>
                    <span className="listDate">
                      {i["dateLong"]}
                    </span>
                    <br/>
                  </div>
                </li>
              );
          })}
        </ul>
      </div>
    );
  }
}

const style = {
  top: '0px',
  bottom: '0px',
  width: '100%'
}

export class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        locationCategory:  props.props.locationCategory,
        dateRange: props.props.dateRange,
        showingInfoWindow: true,
        activeMarker: {},
        selectedPlace: {}
    };
    this.onMarkerClick = this.onMarkerClick.bind(this);
  }

  onMarkerClick(props, marker, e) {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
  }
  render() {
    console.log("render MapContainer")
    return (
      <Map
          google={this.props.google}
          style={style}
          initialCenter={{
            lat: 42.2808,
            lng: -83.7430
          }}
          zoom={15}>
          {this.props.props.events.map(i => {
              return (
                <Marker
                  key={i["id"]}
                  title={i["eventName"]}
                  name={i["eventName"]}
                  website={i["website"]}
                  location={i["location"]}
                  date={i["dateShort"]}
                  time={i["time"]}
                  building={i["buildingLocation"] !== "null" ? i["buildingLocation"] : "No Building Provided"}
                  address={i["address"] !== "null" ? i["address"] : "No Address Provided"}
                  eventType={i["eventType"]}
                  position={{lat: i["latitude"], lng: i["longitude"]}}
                  onClick={this.onMarkerClick} />
              );
          })}
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}>
            <div>
              <span className="listEventName">
                {this.state.selectedPlace.name}
              </span>
              <span className="listLocation">
                {this.state.selectedPlace.location}
              </span>
              <br />
              <span className="listEventType">
                {"Category: " + this.state.selectedPlace.eventType}
              </span>
              <br />
              <span className="listBuilding">
                {this.state.selectedPlace.building !== "null" ? this.state.selectedPlace.building : "No Building Provided"}
              </span>
              <br />
              <span className="listAddress">
                {this.state.selectedPlace.address !== "null" ? this.state.selectedPlace.address : "No Address Provided"}
              </span>
              <br />
              <span className="listDate">
                {this.state.selectedPlace.date}
              </span>
              <span className="listTime">
                {this.state.selectedPlace.time}
              </span>
              <br/>
              <a className="listWebsite" href={this.state.selectedPlace.website}>
                {this.state.selectedPlace.website}
              </a>
              <br/>
            </div>
          </InfoWindow>
      </Map>
    );
  }
}

class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "list",
      locationCategory: "any",
      eventCategory: "Any",
      dateRange: "alltime",
      events: []
    };

    this.handleChangeView = this.handleChangeView.bind(this);
    this.handleChangeLocation = this.handleChangeLocation.bind(this);
    this.handleChangeEvent = this.handleChangeEvent.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.updateEventList = this.updateEventList.bind(this)
  }

  componentDidMount() {
    this.updateEventList("any", "Any", "alltime");
  }

  handleChangeView(event) {
    this.setState({view: event.target.value});
  }

  handleChangeLocation(event) {
    console.log(event.target.value + " chosen");
    this.setState({locationCategory: event.target.value});
    this.updateEventList(event.target.value, this.state.eventCategory, this.state.dateRange);
  };

  handleChangeEvent(event) {
    console.log(event.target.value + " chosen");
    this.setState({eventCategory: event.target.value});
    this.updateEventList(this.state.locationCategory, event.target.value, this.state.dateRange);
  };

  handleChangeDate(event) {
    console.log(event.target.value + " chosen");
    this.setState({dateRange: event.target.value})
    this.updateEventList(this.state.locationCategory, this.state.eventCategory, event.target.value);
  };

  //

  updateEventList(locationType, eventType, timeType) {
    var startEndDates = getDateRange(timeType);
    var startTimestamp = toTimestamp(startEndDates[0]);
    var endTimestamp = toTimestamp(startEndDates[1]);
    // console.log(timeType);
    // console.log(startEndDates);
    var feed = [];
    var snapshotCount = 0;
    var query = databaseRef.orderByChild("timestamp")
      .startAt(startTimestamp)
      .endAt(endTimestamp)
      .on("value", function(snapshot) {
      snapshot.forEach(function (child) {

        snapshotCount += 1;

        var eventObj = child.val();

        var locationMatches = checkLocationMatch(eventObj, locationType);
        var eventTypeMatches = checkEventTypeMatch(eventObj, eventType);
        if (locationMatches && eventTypeMatches) {
          feed.push(child.val());
        }
      })

      Events = feed;
      this.setState({events: Events})

      var eventsByLocation = {};
      for (var i = 0; i < Events.length; ++i) {
        var latLong = [Events[i]["latitude"], Events[i]["longitude"]];
        if (eventsByLocation[latLong] === undefined){
          eventsByLocation[latLong] = [];
        }
        eventsByLocation[latLong].push(Events[i]);
      }
      this.setState({eventsByLoc: eventsByLocation})

      console.log("Events Updated");
    }.bind(this));
  }

  render() {
    console.log("render Page")
    if (this.state.view === "list") {
      return (
        <div>
          <Selector props={this.state} changeView={this.handleChangeView}/>
          <Filters props={this.state} changeLocation={this.handleChangeLocation} changeEvent={this.handleChangeEvent} changeDate={this.handleChangeDate}/>
          <ListView props={this.state}/>
        </div>
      )
    } else {
      return (
        <div>
          <Selector props={this.state} changeView={this.handleChangeView}/>
          <Filters props={this.state} changeLocation={this.handleChangeLocation} changeEvent={this.handleChangeEvent} changeDate={this.handleChangeDate}/>
          <div className="infoView">
            <MapContainer props={this.state} google={window.google}/>
          </div>
        </div>
      )
    }
  }
}

class FreeFoodFinder extends React.Component {
  render() {
    return (
      <div className="mainPage">
        <Page />
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: ""
})(MapContainer)

ReactDOM.render(
  <FreeFoodFinder />,
  document.getElementById('root')
);


//<MapContainer google={window.google} />