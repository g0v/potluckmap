/* global $, L, console, document */

window.onload = init;

function init() {
    var theMap = L.map('themap');
    theMap.setView([24.0648, 120.7058], 15);
    var baseLayer = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(theMap);
}

