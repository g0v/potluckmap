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
    G.layerGroups = {};

    G.toolbar = {};
    G.toolbar.hello = L.ToolbarAction.extend({
	options: {
	    toolbarIcon: {
		html: '&#9873;',
		tooltip: 'reload sources'
	    }
	},
	addHooks: function () {
	    reloadSources();
	}
    });
    G.toolbar._ = new L.Toolbar.Control({
	actions: [G.toolbar.hello]
    }).addTo(G.theMap);

    setTitle();
    reloadSources();
    G.editor.watch('root.title', setTitle);
}

function setTitle() {
    var title = G.editor.getEditor('root.title').getValue();
    $('title').html(title);
    $('h1').html(title);
}

function reloadSources() {
    // $.getJSON('data/ex1.geojson', addLayerGroup);
    var srcNew = {};
    G.editor.getEditor('root.sources').getValue().forEach(function (x) {
	srcNew[x.url] = x;
    });
    var oldURLs = Object.keys(G.layerGroups);
    var newURLs = Object.keys(srcNew);

    var toRemove = setOps.complement(oldURLs, newURLs);
    var toAdd = setOps.complement(newURLs, oldURLs);
    var toChange = setOps.intersection(oldURLs, newURLs).filter(function (x) {
	return G.layerGroups[x].config.color != srcNew[x].color ||
	    G.layerGroups[x].config.icon != srcNew[x].icon;
    });
console.log('toRemove, toAdd, toChange:');
console.log(toRemove);
console.log(toAdd);
console.log(toChange);
    toRemove.forEach(function (x) {
	G.theMap.removeLayer(G.layerGroups[x].LG);
	delete G.layerGroups[x];
	// G.theMap.removeLayer(G.layerGroups[sn.url]);
	printLayers();
    });
    toAdd.forEach(function (x) {
	// https://stackoverflow.com/questions/26699377/how-to-add-additional-argument-to-getjson-callback-for-non-anonymous-function
        $.getJSON(x, addLayerGroup.bind({
	    'config': srcNew[x]
	}));
    });
    toChange.forEach(function (x) {
	G.layerGroups[x].config = srcNew[x];
	changeMarker(G.layerGroups[x].LG, G.layerGroups[x].config);
    });
}

function addLayerGroup(data) {
    // http://leafletjs.com/examples/geojson.html
    console.log('adding layer ' + this.config.url);
    G.layerGroups[this.config.url] = { 'config': this.config };
    var marker = L.AwesomeMarkers.icon({
        'icon': this.config.icon || 'bookmark',
        'markerColor': this.config.color || 'blue'
    });

    var st = {
	pointToLayer: function (f, latlng) {
	    return L.marker(latlng, { 'icon': marker });
	}
    };

    G.layerGroups[this.config.url] = {
	'config': JSON.parse(JSON.stringify(this.config)),
	'LG': L.geoJson(data, st).addTo(G.theMap)
    }
    printLayers();
}

function changeMarker(LG, config) {
    var marker = L.AwesomeMarkers.icon({
        'icon': config.icon || 'bookmark',
        'markerColor': config.color || 'blue'
    });
    LG.getLayers().forEach(function (x) {
	x.setIcon(marker);
    });
}

function printLayers() {
    console.log('now we have these layers:');
    G.theMap.eachLayer(function (layer) {
	console.log(layer);
    });
}
