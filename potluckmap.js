/* global $, L, console, document, JSONEditor, setOps, omnivore, osmtogeojson */

// https://github.com/jdorn/json-editor
// https://github.com/leaflet-extras/leaflet-providers

// http://enable-cors.org/
// https://stackoverflow.com/questions/11281895/jquery-ajax-and-getjson-requests-hitting-access-control-allow-origin-issues

var G = {};

$(document).ready(function () {
    $.getJSON('config.json', init);
});

function init(config) {
    G.editor = new JSONEditor($('#config')[0], config);
    // var tb = G.editor.getEditor('root.sources');
    // $(tb.container).addClass('source_table');

    G.theMap = L.map('themap', {
	contextmenu: true,
	contextmenuWidth: 140,
    });
    rebuildMenu();
    switchView(0);
    switchProvider(config.startval.tile_provider);
    G.layerGroups = {};

    setTitle();
    reload('all');
    G.editor.watch('root.title', setTitle);
    G.editor.watch('root.tile_provider', switchProvider);

    G.toasterSettings = {
	// timeout : 2000,
	toaster: {
	    css: {
		left : '10px',
		top : '10px'
	    }
	}
    };
    console.log(G);
}

function genToast(p, m, s) {
    // http://www.jqueryscript.net/other/jQuery-Bootstrap-Based-Toast-Notification-Plugin-toaster.html
    var settings = {};
    // https://api.jquery.com/jquery.extend/
    $.extend(true, settings, G.toasterSettings);
    if (settings) { $.extend(true, settings, s); }
    $.toaster({
	priority : p,
	message : m,
	settings: settings
    });
}

function rebuildMenu() {
    var menuList = '<li><a onclick="rememberHere()" href="#">remember here</a></li>\n<li class="divider"></li>\n';
    menuList += G.editor.getEditor('root.views').getValue().map(function (v, i) {
	return '<li><a onclick="switchView(' + i + ')" href="#">' + v.name + '</a></li>';
    }).join('\n');
    $('#view_menu').html(menuList);
    G.viewIndex = 0;	// current active view
}

function switchView(i) {
    var node = G.editor.getEditor('root.views.' + i.toString());
//    $(node.container).addClass('editor_active');
    var view = node.getValue();
    G.theMap.setView([view.lat, view.lng], view.zoom);
    $('#view_menu li:nth-child(' + (G.viewIndex+3) + ')').removeClass('active');
    G.viewIndex = i;
    $('#view_menu li:nth-child(' + (G.viewIndex+3) + ')').addClass('active');
}

function switchProvider() {
    if ('baseLayer' in G && G.baseLayer) {
	G.theMap.removeLayer(G.baseLayer);
    }
    var tp = G.editor.getEditor('root.tile_provider').getValue();
    G.baseLayer = L.tileLayer.provider(tp).addTo(G.theMap);
}

function rememberHere() {
    var path = 'root.views.' + G.viewIndex;
    var activeView = G.editor.getEditor(path);
    var name = G.editor.getEditor(path + '.name').getValue();
    var c = G.theMap.getCenter();
    activeView.setValue({
	name: name,
	zoom: G.theMap.getZoom(),
	lng: c.lng,
	lat: c.lat
    });
    genToast('success', 'new position for ' + name + ' is remembered', { timeout : 2000 } );
/*
    views.setValue(views.getValue().push({
	"name": "new view",
	"zoom": G.theMap.getZoom(),
	"lng": c.lng,
	"lat": c.lat
    }));
*/
}

function setTitle() {
    var title = G.editor.getEditor('root.title').getValue();
    $('title').html(title);
    $('h1').html(title);
}

function reload(which) {
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
	toChange = setOps.intersection(oldURLs, newURLs).filter(function (url) {
	    Object.keys(G.layerGroups[url].xtconfig).forEach(function (k) {
		if (G.layerGroups[url].xtconfig[k] != srcNew[url][k]) {
		    return true;
		}
	    });
	    return false;
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
    });
    toAdd.forEach(function (x) {
	// https://stackoverflow.com/questions/26699377/how-to-add-additional-argument-to-getjson-callback-for-non-anonymous-function
        $.get(x, addLayerGroup.bind({ 'xtconfig': srcNew[x] }), 'text');
	// difference between jQuery.getjson() and jQuery.get()
	// is more than automatic JSON.parse().
	// It's easier to call jQuery.get() for all types of data.
	// see https://github.com/ckhung/javascriptCanReadLocalFiles
    });
    toChange.forEach(function (x) {
	G.layerGroups[x].xtconfig = srcNew[x];
	updateAllMarkers(G.layerGroups[x]);
    });
}

function addLayerGroup(data) {
    // http://leafletjs.com/examples/geojson.html
    var cfg = this.xtconfig;
    console.log('adding layer ' + cfg.url);
    if (cfg.format == 'by-ext') {
	cfg.format = cfg.url.match(/\.(\w+)$/)[1];
    }
    var LG = layerGroupFromData(data, cfg.format);
    if (LG) {
	// we don't need deep copy here, do we?
	LG.xtconfig = cfg;
	G.layerGroups[cfg.url] = LG;
	LG.addTo(G.theMap);
	updateAllMarkers(LG);
	genToast('success', 'Layer [' + LG.prettyPrint() + '] was successfully added', { timeout : 2000 } );
	console.log('Done reading ' + LG.prettyPrint() +
	    '. (Now we have ' + Object.keys(G.theMap._layers).length +
	    ' layers)'
	);
    } else {
	genToast('warning', 'failed to read ' + cfg.url, { timeout : 99999 } );
    }
}

function layerGroupFromData(data, fmt) {
    var LG;
    if (fmt == 'gpx') {
	LG = omnivore.gpx.parse(data);
    } else if (fmt == 'csv') {
	LG = omnivore.csv.parse(data);
    } else if (fmt == 'kml') {
	LG = omnivore.kml.parse(data);
    } else if (fmt == 'geojson') {
	data = JSON.parse(data);
	if ('features' in data) { data = data.features; }
	LG = L.geoJson(data);
    } else if (fmt == 'osm json') {
	LG = L.geoJson(osmtogeojson(JSON.parse(data)));
	// move subfields of .tags (e.g. .name) one level up,
	// so as to be compatible with markers generated by
	// omnivore.*.parse() or the default L.geojson()
	LG.getLayers().forEach(function (x) {
	    var p = x.feature.properties;
	    Object.keys(p.tags).forEach(function (t) {
		p[t] = p.tags[t];
	    });
	    delete p.tags;
	});
    } else {
	console.log('unknown format ' + fmt);
	LG = null;
    }
    return LG;
}

function refreshLayerGroup() {
}

function updateAllMarkers(LG) {
    // https://github.com/ckhung/Leaflet.Icon.Glyph "the shape version"
    var icon = L.icon.glyph({
        shape: LG.xtconfig.shape || 'green_ball',
        prefix: LG.xtconfig.glyph_set,
        glyph: LG.xtconfig.glyph || 'star'
    });
    LG.getLayers().forEach(function (x) {
	x.setIcon(icon);
	x.tooltip = L.tooltip({
	    target: x,
	    map: G.theMap,
	    html: x.printTags(),
	    padding: '4px 8px'
	});
	if ('Azimuth' in x.feature.properties) {
	    x.setRotationOrigin('center center');
	    x.setRotationAngle(x.feature.properties.Azimuth-90);
	}
    });
}

// mostly for debugging, except L.Marker.prototype.printTags

L.Marker.prototype.printTags = function () {
    var p = this.feature.properties;
    var s = '';
    Object.keys(p).forEach(function (x) {
	if (['desc', 'relations', 'meta'].indexOf(x) < 0 && p[x]) {
	    s += '<strong>' + x + '</strong>: ' + p[x] + '<br />';
	}
    });
    return s;
};


// add the prettyPrint() capability to several "Layer" classes
// goole "javascript prototype" for how to.
// also please 'grep L.Class.extend leaflet-src.js'
L.Marker.prototype.prettyPrint = function () {
    var p = this.feature.properties;
    return 'M[' + ('name' in p ? p.name : '?') + ']';
};

L.TileLayer.prototype.prettyPrint = function () {
    return 'T[' + this._url + ']';
};

L.LayerGroup.prototype.prettyPrint = function () {
    var s = '';
    var subL = this._layers;
    Object.keys(subL).forEach(function (x) {
	s += subL[x].prettyPrint() + '、';
    } );
    return 'G[' + shortName(this.xtconfig.url) + '] contains ' + s;
};

/* skeleton of original, non-OOP version
function prettyPrint(layer) {
    if ('_url' in layer) {
	return layer.prettyPrint();
    } else if ('_latlng' in layer) {
	return layer.prettyPrint();
    } else if ('_layers' in layer) {
	return layer.prettyPrint();
    } else {
	return '? unknown type of layer';
    }
}
*/

function shortName(url) {
    var m = url.match(/\/([^\/]*?)\.(\w+)$/);
    if (m) { return m[1]; }
    // https://stackoverflow.com/a/747845
    m = decodeURIComponent(url).match(/overpass.*?(\w+)\[(.*?)\]/);
    if (m) { return m[1] + '[' + m[2] + ']'; }
    return '?';
}

