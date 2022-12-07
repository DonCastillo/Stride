import $ from "jquery";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from '@turf/turf';
import Timer from 'easytimer.js';
import moment from 'moment';
mapboxgl.accessToken =
	"pk.eyJ1IjoiZG9uY2FzdGlsbG8iLCJhIjoiY2p6cTN2eDhwMHdqZjNvanNhMGk0cTRhaCJ9.rfa3wF7Pz3VRhpyENHGCpQ";

// map vars
var currLat = 0;
var currLong = 0;
var initLat = 0;
var initLong = 0;
var zoom = 17;
var map;
var initMarker;
var currMarker;
var distance = 0;
var unit = 'M';
var geoOpts = {
	enableHighAccuracy: true,
};

// ped vars
var prevMagnitude = 0;
var stepCount = 0;
var threshold = 6;
var flag = 0;

// timer
var timer = new Timer();

var customCordovaApp = {
	f7: null,

	getDistance: function () {
		let line = turf.lineString([[initLong, initLat], [currLong, currLat]]);
		distance = turf.length(line, {units: 'meters'});
		distance = parseFloat(distance.toFixed(1));
		// console.log('distance: ', distance);
		if (distance > 999) {
			$('#distance-travelled').text((distance / 1000).toFixed(1));
			$('#distance-unit').text('KM');
		} else {
			$('#distance-travelled').text((distance).toFixed(1));
			$('#distance-unit').text('M');
		}
	},

	updateMap: function () {
		map.flyTo({ center: [currLong, currLat], speed: 0.2, curve: 1 });
		currMarker.setLngLat([currLong, currLat]).addTo(map);
		customCordovaApp.getDistance();
	},

	initMap: function () {
		map = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/mapbox/streets-v12?optimize=true",
			center: [initLong, initLat],
			zoom: zoom,
		});

		initMarker = new mapboxgl.Marker({color: 'gray'}).setLngLat([initLong, initLat]).addTo(map);
		currMarker = new mapboxgl.Marker({}).setLngLat([initLong, initLat]).addTo(map);
	},

	initGeolocation: function () {
		var currentGeoSuccess = function (position) {
			initLat = position.coords.latitude;
			initLong = position.coords.longitude;
			// enable start measuring
            customCordovaApp.initMap();
		};

		var currentGeoError = function (error) {
			// display error message
			console.log("current geo error: ", error.message);
			alert("Geolocation disabled.");
		};

		var watchGeoSuccess = function (position) {
			currLat = position.coords.latitude;
			currLong = position.coords.longitude;
		};

		var watchGeoError = function (error) {
			console.log("watch geo error: ", error.message);
			alert("Geolocation update disabled.");
		};

		navigator.geolocation.getCurrentPosition(
			currentGeoSuccess,
			currentGeoError,
			geoOpts
		);

		navigator.geolocation.watchPosition(
			watchGeoSuccess,
			watchGeoError,
			geoOpts
		);
	},

	initPedometer: function () {
		window.addEventListener(
			"devicemotion",
			(event) => {
				const { x, y, z } = event.acceleration;
				let curMagnitude = Math.sqrt(x * x + y * y + z * z);
				let magnitudeDelta = curMagnitude + prevMagnitude / 2;
				prevMagnitude = curMagnitude;

				if (magnitudeDelta > threshold && flag == 0) {
					stepCount++;
					flag = 1;
				} else if (magnitudeDelta > threshold && flag == 1) {
					// don't count
				} else {
				}

				if (magnitudeDelta < threshold && flag == 1) {
					flag = 0;
				}

				if (stepCount < 0) {
					stepCount = 0;
				}

				$("#step-count-top").text((parseInt(stepCount/2)));
				$("#step-count-bottom").text((parseInt(stepCount/2)));

				console.log("step count: ", stepCount/2);
			}
		);
	},

	startTimer: function () {
		timer.addEventListener('secondTenthsUpdated', function(e) {
			$('#elapsed-time').html(timer.getTimeValues().toString(['hours', 'minutes', 'seconds', 'secondTenths']));
		});
		timer.start({precision: 'secondTenths'});
	},

	resetTimer: function () {
		timer.stop();
		timer.removeEventListener('secondTenthsUpdated');
	},

	init: function (f7) {
		console.log("init customcordova app");
		customCordovaApp.f7 = f7;

		// device ready
		document.addEventListener("deviceready", () => {
			try {
				customCordovaApp.initGeolocation();
			} catch (e) {
				console.log(e);
			}
		});

		// document ready
		$(document).ready(function() {
			let mapUpdater;

			$('#start-measuring').on('click', function() {
				console.log('start measuring  fdfdf...')
				$('#start-measuring').hide();
				$('#stop-measuring').show();

				mapUpdater = setInterval(customCordovaApp.updateMap, 2000);
				customCordovaApp.initPedometer();
				customCordovaApp.startTimer();
			});
			
			$('#stop-measuring').on('click', function() {
				console.log('stop measuring...')

				$('#stop-measuring').hide();
				$('#start-measuring').show();
				customCordovaApp.resetTimer();
				clearInterval(mapUpdater);
				window.removeEventListener('devicemotion');

				// record last reading
				$('#last-reading #lr-date').text(moment().format('MM/DD/YY'));
				$('#last-reading #lr-dist').text($('#distance-travelled').text() + ' ' + $('#distance-unit').text());
				$('#last-reading #lr-time').text($('#elapsed-time').text());
				$('#last-reading #lr-steps').text($('#step-count-top').text() + ' steps');
				$('#last-reading').show();


				prevMagnitude = 0;
				stepCount = 0;
				flag = 0;
				currLat = 0;
				currLong = 0;
				initLat = 0;
				initLong = 0;
				distance = 0;

				$('#distance-travelled').text(0);
				$('#distance-unit').text('M');
				$('#elapsed-time').text('00:00:00:0');
				$('#step-count-top').text(0);
				$('#step-count-bottom').text(0);
			});

		});


	},
};

export default customCordovaApp;
