// https://github.com/Leaflet/Leaflet.Icon.Glyph


L.Icon.Glyph = L.Icon.extend({
	shape_store: {
		// glyphAnchor is given in pixels, counting from the center of the image.
		red_ball: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 3, y: 3 },
			iconSize: [31, 41],
			iconAnchor:  [15, 41],
			popupAnchor: [1, -34],
			glyphAnchor: [0, -7]
		},
		orange_ball: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 39, y: 3 },
			iconSize: [ 31, 41],
			iconAnchor:  [ 15, 41],
			popupAnchor: [1, -34],
			glyphAnchor: [0, -7]
		},
		green_ball: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 75, y: 3 },
			iconSize: [ 31, 41],
			iconAnchor:  [ 15, 41],
			popupAnchor: [1, -34],
			glyphAnchor: [0, -7]
		},
		blue_ball: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 111, y: 3 },
			iconSize: [ 31, 41],
			iconAnchor:  [ 15, 41],
			popupAnchor: [1, -34],
			glyphAnchor: [0, -7]
		},
		purple_ball: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 147, y: 3 },
			iconSize: [ 31, 41],
			iconAnchor:  [ 15, 41],
			popupAnchor: [1, -34],
			glyphAnchor: [0, -7]
		},
		red_hball: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 4, y: 48 },
			iconSize: [28, 36],
			iconAnchor:  [14, 36],
			popupAnchor: [1, -34],
			glyphAnchor: [0, -7]
		},
		orange_hball: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 40, y: 48 },
			iconSize: [28, 36],
			iconAnchor:  [14, 36],
			popupAnchor: [1, -34],
			glyphAnchor: [0, -7]
		},
		green_hball: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 76, y: 48 },
			iconSize: [28, 36],
			iconAnchor:  [14, 36],
			popupAnchor: [1, -34],
			glyphAnchor: [0, -7]
		},
		blue_hball: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 112, y: 48 },
			iconSize: [28, 36],
			iconAnchor:  [14, 36],
			popupAnchor: [1, -34],
			glyphAnchor: [0, -7]
		},
		purple_hball: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 148, y: 48 },
			iconSize: [28, 36],
			iconAnchor:  [14, 36],
			popupAnchor: [1, -34],
			glyphAnchor: [0, -7]
		},
		red_bullet: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 2, y: 86 },
			iconSize: [45, 27],
			iconAnchor:  [23, 14],
			popupAnchor: [1, -34],
			glyphAnchor: [0, 0]
		},
		orange_bullet: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 49, y: 86 },
			iconSize: [45, 27],
			iconAnchor:  [23, 14],
			popupAnchor: [1, -34],
			glyphAnchor: [0, 0]
		},
		green_bullet: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 96, y: 86 },
			iconSize: [45, 27],
			iconAnchor:  [23, 14],
			popupAnchor: [1, -34],
			glyphAnchor: [0, 0]
		},
		blue_bullet: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 143, y: 86 },
			iconSize: [45, 27],
			iconAnchor:  [23, 14],
			popupAnchor: [1, -34],
			glyphAnchor: [0, 0]
		},
		purple_bullet: {
			iconUrl: 'lib/icons.png',
			bgPos: { x: 190, y: 86 },
			iconSize: [45, 27],
			iconAnchor:  [23, 14],
			popupAnchor: [1, -34],
			glyphAnchor: [0, 0]
		},
	},

	options: {
		className: '',
		prefix: '',
		glyph: 'home',
		glyphColor: 'white',
		glyphSize: '11px',	// in CSS units
	},

	createIcon: function () {
		var div = document.createElement('div'),
			options = this.options, shape_store = this.shape_store;
		if (! ('shape' in options)) options.shape = 'blue_ball';
		Object.keys(shape_store[options.shape]).forEach(function (k) {
			if (! (k in options)) options[k] = shape_store[options.shape][k];
		});

		if (options.glyph) {
			div.appendChild(this._createGlyph());
		}

		this._setIconStyles(div, options.className);
		return div;
	},

	_createGlyph: function() {
		var glyphClass,
		    textContent,
		    options = this.options;

		if (!options.prefix) {
			glyphClass = '';
			textContent = options.glyph;
		} else if(options.glyph.slice(0, options.prefix.length+1) === options.prefix + "-") {
			glyphClass = options.glyph;
		} else {
			glyphClass = options.prefix + "-" + options.glyph;
		}

		var span = L.DomUtil.create('span', options.prefix + ' ' + glyphClass);
		span.style.fontSize = options.glyphSize;
		span.style.color = options.glyphColor;
		span.style.width = options.iconSize[0] + 'px';
		span.style.lineHeight = options.iconSize[1] + 'px';
		span.style.textAlign = 'center';
		span.style.marginLeft = options.glyphAnchor[0] + 'px';
		span.style.marginTop = options.glyphAnchor[1] + 'px';
		span.style.pointerEvents = 'none';

		if (textContent) {
			span.innerHTML = textContent;
			span.style.display = 'inline-block';
		}

		return span;
	},

	_setIconStyles: function (div, name) {
		if (name === 'shadow') {
			return L.Icon.prototype._setIconStyles.call(this, div, name);
		}

		var options = this.options,
		    size = L.point(options['iconSize']),
		    anchor = L.point(options.iconAnchor);

		if (!anchor && size) {
			anchor = size.divideBy(2, true);
		}

		div.className = 'leaflet-marker-icon leaflet-glyph-icon ' + name;
		var src = this._getIconUrl('icon');
		if (src) {
			div.style.backgroundImage = "url('" + src + "')";
		}

		if (options.bgPos) {
			div.style.backgroundPosition = (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
		}
		if (options.bgSize) {
			div.style.backgroundSize = (options.bgSize.x) + 'px ' + (options.bgSize.y) + 'px';
		}

		if (anchor) {
			div.style.marginLeft = (-anchor.x) + 'px';
			div.style.marginTop  = (-anchor.y) + 'px';
		}

		if (size) {
			div.style.width  = size.x + 'px';
			div.style.height = size.y + 'px';
		}
	}
});

L.icon.glyph = function (options) {
	return new L.Icon.Glyph(options);
};



