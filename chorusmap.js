/* global $, L, console, document, JSONEditor */

// https://github.com/jdorn/json-editor
// https://github.com/leaflet-extras/leaflet-providers

// http://enable-cors.org/
// https://stackoverflow.com/questions/11281895/jquery-ajax-and-getjson-requests-hitting-access-control-allow-origin-issues

$(document).ready(init0);

function init0() {
    $.getJSON('config.json', init);
}

var G = {};

function init(config) {
    G.editor = new JSONEditor($('#config')[0], config);
    G.theMap = L.map('themap').setView([23.5, 120.5], 7);
    G.baseLayer = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(G.theMap);
    G.gjLayers = {};

    setTitle();
    reloadSources();
    G.editor.watch('root.title', setTitle);
    G.editor.watch('root.sources', reloadSources);

}

function setTitle() {
    var title = G.editor.getEditor('root.title').getValue();
    $('title').html(title);
    $('h1').html(title);
}

function reloadSources() {
    // $.getJSON('data/ex1.geojson', addGeojsonLayer);
    var srcOld = G.editor.getValue().sources;
    var srcNew = G.editor.getEditor('root.sources').getValue();
    for (var i=0; i<srcNew.length; ++i) {
	var sn = srcNew[i];
	if (! sn.url) { continue; }
	var found = $.grep(srcOld, function(so) { return sn.url == so.url; });
	if (found) {
	    if (found[0].icon==sn.icon && found[0].color==sn.color) {
		continue;
	    }
	    console.log('removing layer ', sn.url);
	    // G.theMap.removeLayer(G.gjLayers[sn.url]);
	}
	// https://stackoverflow.com/questions/26699377/how-to-add-additional-argument-to-getjson-callback-for-non-anonymous-function
        $.getJSON(sn.url, addGeojsonLayer.bind({
	    'config': sn
	}));
    }
    console.log('now we have these layers:');
    G.theMap.eachLayer(function (layer) {
	console.log(layer);
    });
}

function addGeojsonLayer(data) {
    // http://leafletjs.com/examples/geojson.html
    console.log('loading layer ' + this.config.url);
    var marker = L.AwesomeMarkers.icon({
        'icon': this.config.icon,
        'markerColor': this.config.color
    });

    var st = {
	pointToLayer: function (f, latlng) {
	    return L.marker(latlng, { 'icon':marker });
	}
    };
    G.gjLayers[this.config.url] = L.geoJson(null, st).addTo(G.theMap);
    G.gjLayers[this.config.url].addData(data);
}

