$(document).ready(function () {
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
	console.log("Finished Ready");
	// EXAMPLE USE OF FUNCTIONS
	// var feed = getEventsInDateRange("4/15/2018", "5/1/2018");
	// var feed = getAllEvents();
	// console.log(feed);


	// strDate as a tuple: d/m/y
	function toTimestamp(strDate){
	   var datum = Date.parse(strDate);
	   return datum/1000;
	}

	function getMenuValues() {
		campusTypeMenu = document.getElementsByName("location")[0];
		campusTypeSelected = campusTypeMenu.options[campusTypeMenu.selectedIndex].value;
		
		foodTypeMenu = document.getElementsByName("foodtype")[0];
		foodTypeSelected = foodTypeMenu.options[foodTypeMenu.selectedIndex].value;
		
		timeTypeMenu = document.getElementsByName("when")[0];
		timeTypeSelected = timeTypeMenu.options[timeTypeMenu.selectedIndex].value;
		
		console.log(campusTypeSelected);
		console.log(foodTypeSelected);
		console.log(timeTypeSelected);
	}

	function checkLocationMatch(eventObj) {
		if (eventObj.locationCategory == campusTypeSelected ||
				eventObj.locationCategory == "null" ||
				campusTypeSelected == "any"
		) {
			locationMatch = true;
		} else {
			locationMatch = false;
		}
		return locationMatch;
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

	function getDateRange() {
		startDate = getTodayPlusTime(0, 0, 0);
		endDate = "";
		// all time
		if (timeTypeSelected == "alltime") {
			endDate = getTodayPlusTime(1, 0, 0);
		} else if (timeTypeSelected == "today") {
			endDate = startDate;
		} else if (timeTypeSelected == "thisweek") {
			endDate = getTodayPlusTime(0, 0, 7);
		} else if (timeTypeSelected == "thismonth") {
			endDate = getTodayPlusTime(0, 1, 0);
		} else {
			endDate = getTodayPlusTime(1, 0, 0);
		}
		console.log(startDate);
		console.log(endDate);
		return [startDate, endDate];
	}

	export function foo() {
		alert('test');
	}

	function getUpdatedEventList() {
		
		getMenuValues();
		var dateRange = getDateRange();
		
		var startTimestamp = toTimestamp(dateRange[0]);
		var endTimestamp = toTimestamp(dateRange[1]);
		
		var ref = database.ref("Events");
		var feed = [];
		var query = ref.orderByChild("timestamp")
			.startAt(startTimestamp)
			.endAt(endTimestamp)
			.on("value", function(snapshot) {
			snapshot.forEach(function (child) {
				var eventObj = child.val();
				
				var locationMatches = checkLocationMatch(eventObj);
				if (locationMatch) {
					feed.push(child.val());
				}
			})
		});
		// console.log(feed);
		return feed;
	}

	function getAllEvents() {
		var feed = getEventsInDateRange("1/1/1980", "12/12/2030");
		return feed;
	}
	getUpdatedEventList();
	console.log("Document Ready");
});