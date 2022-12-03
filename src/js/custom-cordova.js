import $ from 'jquery';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
mapboxgl.accessToken = 'pk.eyJ1IjoiZG9uY2FzdGlsbG8iLCJhIjoiY2p6cTN2eDhwMHdqZjNvanNhMGk0cTRhaCJ9.rfa3wF7Pz3VRhpyENHGCpQ'

var customCordovaApp = {
    f7: null,
    geolocation: function () {

        console.log('initializing geolocation')
        console.log('jquery: ', $)

        var lat = 0, long = 0, zoom = 17, map, marker;
        var geoOpts = {
            enableHighAccuracy: true,
        }


        var initMap = function() {

            // initialize map object
            map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [long, lat],
                zoom: zoom
            });

            // set initial marker location
            marker = new mapboxgl.Marker().setLngLat([long, lat]).addTo(map);                         
        }

        var updateMap = function() {
            map.setCenter([long, lat]);
            marker.setLngLat([long, lat]).addTo(map);
        }


        var currentGeoSuccess = function (position) {
            lat = position.coords.latitude;
            long = position.coords.longitude;
            initMap();
        } 

        var currentGeoError = function (error) {
            console.log('error: ', error.message);
            // cannot render map
        }

        var watchGeoSuccess = function (position) {
            console.log('getting watch postion');
            // console.log('position: ', position)
            lat = position.coords.latitude;
            long = position.coords.longitude;
            initMap();
        }

        var watchGeoError = function (error) {
            console.log('error: ', error.message);
            // cannot update location
        }

        navigator.geolocation.getCurrentPosition(currentGeoSuccess, currentGeoError, geoOpts);
        navigator.geolocation.watchPosition(watchGeoSuccess, watchGeoError, geoOpts);


    },
    pedometer: function () {
        let prevMagnitude = 0;
        let stepCount = 0;
        let threshold = 6;
        let flag = 0;

        window.addEventListener('devicemotion', event => {
            const {x, y, z} = event.acceleration;
            let curMagnitude = Math.sqrt(x * x  + y * y + z * z);
            let magnitudeDelta = curMagnitude + prevMagnitude / 2;
            prevMagnitude = curMagnitude;

            if (magnitudeDelta > threshold && flag == 0) {
                stepCount++;
                flag = 1;
            } else if(magnitudeDelta > threshold && flag == 1) {
                // don't count
            } else{

            }
            
            if(magnitudeDelta < threshold && flag == 1){
                flag = 0;
            }

            if(stepCount < 0) {
                stepCount = 0;
            }

            $('#step-count-top').text(stepCount);
            $('#step-count-bottom').text(stepCount);

            console.log('step count: ', stepCount);

        }, true)
    },
    init: function (f7) {
        console.log('init customcordova app')
        customCordovaApp.f7 = f7;

        document.addEventListener('deviceready', () => {
            console.log('init geolocation')
            customCordovaApp.geolocation();

            console.log('init pedo')
            customCordovaApp.pedometer();
        });

    }
}

export default customCordovaApp;