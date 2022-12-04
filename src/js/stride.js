import $ from 'jquery';
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';
// mapboxgl.accessToken = 'pk.eyJ1IjoiZG9uY2FzdGlsbG8iLCJhIjoiY2p6cTN2eDhwMHdqZjNvanNhMGk0cTRhaCJ9.rfa3wF7Pz3VRhpyENHGCpQ';
$(document).ready(function () {
    
    $('#start-measuring').on('click', function() {
        console.log('start measuring...')
        $('#start-measuring').hide();
        $('#stop-measuring').show();
    });
    
    $('#stop-measuring').on('click', function() {
        console.log('stop measuring...')
        $('#stop-measuring').hide();
        $('#start-measuring').show();
    });

});