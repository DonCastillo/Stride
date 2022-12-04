import $ from "jquery";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from '@turf/turf';
mapboxgl.accessToken =
	"pk.eyJ1IjoiZG9uY2FzdGlsbG8iLCJhIjoiY2p6cTN2eDhwMHdqZjNvanNhMGk0cTRhaCJ9.rfa3wF7Pz3VRhpyENHGCpQ";

$(document).on("page:init", '.page[data-name="home"]', function (e) {});

var customCordovaApp = {
	f7: null,
	geolocation: function () {
		console.log("initializing geolocation");
		console.log("jquery: ", $);

        var currLat = 0;
        var currLong = 0;
        var initLat = 0;
        var initLong = 0;
        var zoom = 17;
        var map;
        var initMarker;
        var currMarker;
        var distance = 0;

		var directionHistory = []; // contains history of coordinates as updated by the watchPosition
		var geoOpts = {
			enableHighAccuracy: true,
		};
		var times = 0;

		var initMap = function () {
			map = new mapboxgl.Map({
				container: "map",
				style: "mapbox://styles/mapbox/streets-v12?optimize=true",
				center: [initLong, initLat],
				zoom: zoom,
			});

			initMarker = new mapboxgl.Marker({color: 'gray'}).setLngLat([initLong, initLat]).addTo(map);
			currMarker = new mapboxgl.Marker({}).setLngLat([currLong, currLat]).addTo(map);
            getDistance();

			console.log("page init");

			map.on("load", () => {
			    console.log("mad loaded");
			    setInterval(updateMap, 2000);
			});
		};


		var updateMap = function () {
			console.log("updating map");
            console.log('start date: ', initMarker.getLngLat())
            console.log('end date: ', currMarker.getLngLat())
			map.flyTo({ center: [currLong, currLat], speed: 0.2, curve: 1 });
			currMarker.setLngLat([currLong, currLat]).addTo(map);
            getDistance();
		};

        var getDistance = function () {
            let line = turf.lineString([[initLong, initLat], [currLong, currLat]]);
            distance = turf.length(line, {units: 'meters'});
            distance = distance.toFixed(2);
            $('#distance-travelled').text(distance);
        }

		var getGeoJSON = function () {
			console.log("get geojson");
			return JSON.stringify({
				type: "Feature",
				properties: {},
				geometry: {
					type: "LineString",
					coordinates: directionHistory,
				},
			});
		};

		var currentGeoSuccess = function (position) {
			initLat = position.coords.latitude;
			initLong = position.coords.longitude;
            initMap();

		};

		var currentGeoError = function (error) {
			console.log("current geo error: ", error.message);
			// cannot render map
		};

		var watchGeoSuccess = function (position) {
			currLat = position.coords.latitude;
			currLong = position.coords.longitude;
			// updateMap();
		};

		var watchGeoError = function (error) {
			console.log("watch geo error: ", error.message);
			// cannot update location
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
	pedometer: function () {
		let prevMagnitude = 0;
		let stepCount = 0;
		let threshold = 6;
		let flag = 0;

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

				$("#step-count-top").text(stepCount/2);
				$("#step-count-bottom").text(stepCount/2);

				console.log("step count: ", stepCount/2);
			},
			true
		);
	},
	init: function (f7) {
		console.log("init customcordova app");
		customCordovaApp.f7 = f7;

		document.addEventListener("deviceready", () => {
			try {
				customCordovaApp.geolocation();
				customCordovaApp.pedometer();
			} catch (e) {
				console.log(e);
			}
		});
	},
};

export default customCordovaApp;
