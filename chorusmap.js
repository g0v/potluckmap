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
    G.toolbar.reloadChanged = L.ToolbarAction.extend({
	options: {
	    toolbarIcon: {
		html: '&curvearrowright;',
		tooltip: 'reload changed'
	    }
	},
	addHooks: function () {
	    reload('changed');
	}
    });
    G.toolbar.reloadAll = L.ToolbarAction.extend({
	options: {
	    toolbarIcon: {
		html: '&circlearrowright;',
		tooltip: 'reload all'
	    }
	},
	addHooks: function () {
	    reload('all');
	}
    });
    G.toolbar._ = new L.Toolbar.Control({
	actions: [G.toolbar.reloadChanged, G.toolbar.reloadAll]
    }).addTo(G.theMap);

    setTitle();
    reload('all');
    G.editor.watch('root.title', setTitle);
}

function setTitle() {
    var title = G.editor.getEditor('root.title').getValue();
    $('title').html(title);
    $('h1').html(title);
}

function reload(which) {
    // $.getJSON('data/ex1.geojson', addLayerGroup);
    which = which || 'changed';
    var srcNew = {};
    G.editor.getEditor('root.sources').getValue().forEach(function (x) {
	srcNew[x.url] = x;
    });
    var oldURLs = Object.keys(G.layerGroups);
    var newURLs = Object.keys(srcNew);

    var toRemove, toAdd, toChange;
    if (which == 'changed') {
	toRemove = setOps.complement(oldURLs, newURLs);
	toAdd = setOps.complement(newURLs, oldURLs);
	toChange = setOps.intersection(oldURLs, newURLs).filter(function (x) {
	    return G.layerGroups[x].xtconfig.color != srcNew[x].color ||
		G.layerGroups[x].xtconfig.icon != srcNew[x].icon;
	});
    } else {
	toRemove = oldURLs;
	toAdd = newURLs;
	toChange = [];
    }
console.log('toRemove, toAdd, toChange:', toRemove, toAdd, toChange);
    toRemove.forEach(function (x) {
	G.theMap.removeLayer(G.layerGroups[x]);
	delete G.layerGroups[x];
	// G.theMap.removeLayer(G.layerGroups[sn.url]);
	printLayers();
    });
    toAdd.forEach(function (x) {
	// https://stackoverflow.com/questions/26699377/how-to-add-additional-argument-to-getjson-callback-for-non-anonymous-function
        $.getJSON(x, addLayerGroup.bind({
	    'xtconfig': srcNew[x]
	}));
    });
    toChange.forEach(function (x) {
	G.layerGroups[x].xtconfig = srcNew[x];
	changeMarker(G.layerGroups[x]);
    });
}

function addLayerGroup(data) {
    // http://leafletjs.com/examples/geojson.html
    console.log('adding layer ' + this.xtconfig.url);
    var marker = L.AwesomeMarkers.icon({
        'icon': this.xtconfig.icon || 'bookmark',
        'markerColor': this.xtconfig.color || 'blue'
    });
    var st = {
	pointToLayer: function (f, latlng) {
	    return L.marker(latlng, { 'icon': marker });
	}
    };
    G.layerGroups[this.xtconfig.url] = L.geoJson(data, st).addTo(G.theMap);
    G.layerGroups[this.xtconfig.url].xtconfig = JSON.parse(JSON.stringify(this.xtconfig));
    printLayers();
}

function changeMarker(LG) {
    var marker = L.AwesomeMarkers.icon({
        'icon': LG.xtconfig.icon || 'bookmark',
        'markerColor': LG.xtconfig.color || 'blue'
    });
    LG.getLayers().forEach(function (x) {
	x.setIcon(marker);
    });
}

function printLayers() {
    console.log('[[ now we have these layers: ]]');
    G.theMap.eachLayer(function (layer) {
	console.log('L:' + prettyPrint(layer), layer);
    });
}

// for debugging
function prettyPrint(layer) {
    if ('_url' in layer) {
	return 'Tile: ' + layer._url;
    } else if ('_latlng' in layer) {
	return 'Marker: ' + layer.feature.properties.name;
    } else if ('_layers' in layer) {
	var s = '';
	Object.keys(layer._layers).forEach(function (x) {
	    s += '、' + prettyPrint(layer._layers[x]);
	} );
	return 'Group: ' + shortName(layer.xtconfig.url) + ' contains ' + s;
    } else if ('_toolbar_type' in layer) {
	return 'Toolbar';
    } else {
	return '? unknown type of layer';
    }
}

function shortName(url) {
    return url.match(/\/([^\/]*?)\.(\w+)$/)[1];
}

