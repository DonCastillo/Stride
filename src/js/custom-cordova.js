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

        var geoSuccess = function (position) {
            console.log('position', position)
            const lat = position.coords.latitude;
            const long = position.coords.longitude;

            // initialize map object
            map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/doncastillo/clb0kfrb7003g15mid0eff3kb',
                center: [long, lat],
                zoom: zoom
            });

            marker = new mapboxgl.Marker()
                        .setLngLat([long, lat])
                        .addTo(map);

            console.log('map: ', map)
            

            // $('#coordinates').append(`<p>${position.coords.latitude}, ${position.coords.longitude}</p>`)
        } 

        var geoError = function (error) {
            console.log('error: ', error.message);
        }

        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOpts);
        // navigator.geolocation.watchPosition(geoSuccess, geoError, geoOpts);


    },
    init: function (f7) {
        customCordovaApp.f7 = f7;

        customCordovaApp.geolocation();
    }
}

export default customCordovaApp;