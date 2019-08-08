jQuery(document).ready(function($) {

	//mapboxgl.accessToken = 'pk.eyJ1IjoiamFtZXNkYXZ5IiwiYSI6ImNpenRuMmZ6OTAxMngzM25wNG81b2MwMTUifQ.A2YdXu17spFF-gl6yvHXaw';
	mapboxgl.accessToken = 'pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg';
	var map = new mapboxgl.Map({
		container: mapContainer,
		style: 'mapbox://styles/jamesdavy/cjw25laqe0y311dqulwkvnfoc', //Andrews default new RIS v2 style based on North Star
		attributionControl: true,
		renderWorldCopies: true,
		center: [0, -6.66],
        zoom: 1.5,
		minZoom: 1.4,
		maxZoom: 12,
		attributionControl: false,
	}).addControl(new mapboxgl.AttributionControl({
        customAttribution: "UNEP-WCMC and IUCN (2019), <br>\n Protected Planet: The World Database on Protected Areas (WDPA),<br>\n May 2019, Cambridge, UK: UNEP-WCMC and IUCN.",
		compact: true
    }));
	thisMap = map;
	
	map.addControl(new mapboxgl.ScaleControl({
		maxWidth: 150,
		unit: 'metric'
	}));
  
	class mapGenericControl {
		onAdd(map) {
			this._map = map;
			this._container = document.createElement('div');
			this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
			this._container.innerHTML = "<button class='mapboxgl-ctrl-icon mapboxgl-ctrl-iD' type='button' id='id-editor-link' title='Open Open Street Map (OSM) iD editor' href='#' onclick='idEditor();return false;'><i class='fas fa-pencil-alt'></i></button>"+
        "<button class='mapboxgl-ctrl-icon mapboxgl-ctrl-sat' title='Toggle Satellite base layer' id='satellite-layer' type='button'><i class='fab fa-grav'></i></button>" +
		"<button class='mapboxgl-ctrl-icon mapboxgl-ctrl-news' title='Toggle News' id='emm-news' type='button'><i class='far fa-newspaper'></i></button>";/* +
        "<button class='mapboxgl-ctrl-icon mapboxgl-ctrl-flickr' id='flickr-images' type='button'><i class='far fa-images'></i></button>"; */
			return this._container;
		}
		onRemove() {
			this._container.parentNode.removeChild(this._container);
			this._map = undefined;
		}
	}
	
	class paFillControl {
		onAdd(map) {
			this._map = map;
			this._container = document.createElement('div');
			this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-layer-fill';
			this._container.innerHTML = "<button class='mapboxgl-ctrl-icon' type='button' id='layer-fill-toggle' title='Toggle fill for selected polygons'><i class='fas fa-fill-drip'></i></button>";
			return this._container;
		}
		onRemove() {
			this._container.parentNode.removeChild(this._container);
			this._map = undefined;
		}
	}
	class mapZoomControl {
		onAdd(map) {
			this._map = map;
			this._container = document.createElement('div');
			this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group map-zoom-group';
			this._container.innerHTML = "<button class='mapboxgl-ctrl-icon mapboxgl-ctrl-z-global' type='button' title='Zoom to global extent'> </button>"+
        "<button class='mapboxgl-ctrl-icon mapboxgl-ctrl-z-region' type='button' title='Zoom to regional extent' style='display: none;'> </button>"+
        "<button class='mapboxgl-ctrl-icon mapboxgl-ctrl-z-country' type='button' title='Zoom to country extent' style='display: none;'> </button>"+
		"<button class='mapboxgl-ctrl-icon mapboxgl-ctrl-z-pa' type='button' title='Zoom to protected area extent' style='display: none;'> </button>";
			return this._container;
		}
		onRemove() {
			this._container.parentNode.removeChild(this._container);
			this._map = undefined;
		}
	}
	class mapLoaderControl {
		onAdd(map) {
			this._map = map;
			this._container = document.createElement('div');
			this._container.className = 'mapboxgl-ctrl ajax-loader ajax-load';
			this._container.innerHTML = "<div id='map-loader-wrapper'>"+
        "<div id='map-loader'></div>"+
        "</div>";
			return this._container;
		}
		onRemove() {
			this._container.parentNode.removeChild(this._container);
			this._map = undefined;
		}
	}
 	class mapCountrywdpaAcpHover {
		onAdd(map) {
			this._map = map;
			this._container = document.createElement('div');
			this._container.className = 'mapboxgl-ctrl map-country-pa-info-wrapper';
			this._container.innerHTML = "<div id='map-region-info'></div><div id='map-country-info'></div><div id='map-pa-info'></div><div id='map-indicator-info'></div>";
			return this._container;
		}

		onRemove() {
			this._container.parentNode.removeChild(this._container);
			this._map = undefined;
		}
	} 
	class mapLegendBox {
		onAdd(map) {
			this._map = map;
			this._container = document.createElement('div');
			this._container.className = 'mapboxgl-ctrl';
			this._container.innerHTML = "<div id='map-legend' style='background: #fff; padding: 5px;'><div id='wms-map-legend' ></div><div id='custom-map-legend' ></div><div style='display: none;' id='custom-map-legend-nan'>"+
			"<div class='legend-unit' style='display: flex; padding: 5px;'>"+
			"<div class='legend-color' style='background: repeating-linear-gradient(315deg,#DC143C,#DC143C 4px,#ccc 4px,#ccc 8px); width:20px; height:20px;'></div>"+
			"<div class='legend-text'>&nbsp;NaN = No Data</div></div>"+
			"</div></div>";
			return this._container;
		}
		onRemove() {
			this._container.parentNode.removeChild(this._container);
			this._map = undefined;
		}
	} 

	mapLoader = new mapLoaderControl();
	mapGeneric = new mapZoomControl();
	mapZoom = new mapGenericControl();
	paFill = new paFillControl();
	mapInfo = new mapCountrywdpaAcpHover();
	mapLegend = new mapLegendBox();
/* 	map.addControl(mapLoader, 'top-left');	
	map.addControl(mapGeneric, 'top-right');
	map.addControl(mapZoom, 'top-right');		
	map.addControl(paFill, 'top-right');	
	map.addControl(mapInfo, 'bottom-right');		
	map.addControl(mapLegend, 'bottom-right'); */
	$('input').each(function(i){
	  if(this.id){
		this.id = this.id+i;
		$(this).closest('form').addClass(this.id);
	  }
	});

	map.on('moveend', function (e) {
		//this flag can only be true in this case if the Protected Area has been changed to one in a different country from the search
		if (countryChanged == 1){	
			updateCountry();
		}
		if (paChanged == 1){	
			updatePa();
		}
		if (regionChanged == 1){	
			updateRegion();
		}
		var currentBounds = map.getBounds()
		 $('input[data-drupal-selector=edit-top]').val(currentBounds._ne.lat);
		 $('input[data-drupal-selector=edit-bottom]').val(currentBounds._sw.lat);
		 $('input[data-drupal-selector=edit-left]').val(currentBounds._ne.lng);
		 $('input[data-drupal-selector=edit-right]').val(currentBounds._sw.lng);
		 $('input[data-drupal-selector=edit-iso2]').val(selSettings.ISO2);
		 $('div[data-drupal-selector=edit-actions]').find('input[type=submit]').click();
	});
	
	map.on('load', function () {
		
		//$('.mapboxgl-ctrl-layer-fill').hide();
		//var satSwitch = document.getElementById;
		
		
		var hoverStyle = {
				"line-color": "#8fc04f",
				"line-width": 3,
			};
		var selectableStyle = {
				'fill-color': 'rgb(255, 152, 0)',
				'fill-outline-color': 'rgb(255, 152, 0)',
				"fill-opacity": 0.3
			};
		var selectedStyle = {
				"line-color": "#679b95",
				"line-width": 3
			};

		map.addSource("BIOPAMA_Poly", {
			"type": 'vector',
			"tiles": ["https://tiles.biopama.org/BIOPAMA_poly_2/{z}/{x}/{y}.pbf"],
			"minZoom": 0,
			"maxZoom": 12,
		});
		map.addSource("BIOPAMA_Point", {
			"type": 'vector',
			"tiles": ["https://tiles.biopama.org/BIOPAMA_point_2/{z}/{x}/{y}.pbf"],
			"minZoom": 0,
			"maxZoom": 12,
		});
		/* 
		We have 3 Major Layer types:
		Region
		Country
		Protected Area
		
		Each of the 3 Layers has 2 sources - Polygon and Point
		The Polygon Source is to show the area and the Borders using 3 layers:
		Fill (poly), Selected (line), Hover (fill)
		The point source is for labels and as the name implies, points. Each type of layer can be viewed as a point instead.
		
		Each layer is declared below in the order (Misc., Region, Country, PA, Labels)
		*/
		
		//this is the GAUL country borders for the ACP countries 
		map.addLayer({
			"id": "gaulACP",
			"type": "line",
			"source": "BIOPAMA_Poly",
			"source-layer": mapGAULLayer,
			"maxzoom": 6,
            "paint": {"line-color": "#aaa",
				"line-width": 1,}
		}, 'state-label-lg');
		//EEZ for ACP countries
		map.addLayer({
			"id": "BIOPAMA",
			"type": "fill",
			"source": "BIOPAMA_Poly",
			"source-layer": mapEEZLayer,
			"maxzoom": 6,
            "paint": {"fill-color": "hsl(224, 39%, 73%)", "fill-opacity": 0.3}
		}, 'state-label-lg');
		map.addLayer({
			"id": "regionMask",
			"type": "fill",
			"source": "BIOPAMA_Poly",
			"source-layer": mapSubRegionLayer,
			"paint": {
				'fill-color': '#fff',
				"fill-opacity": 0.01,
			}
		}, 'state-label-lg');
		map.addLayer({
			"id": "regionsMask",
			"type": "fill",
			"source": "BIOPAMA_Poly",
			"source-layer": mapSubRegionLayer,
			"paint": {
				'fill-color': '#fff',
				'fill-outline-color': '#fff',
				"fill-opacity": 0.01,
			}
		}, 'state-label-lg');
/* 		map.addLayer({
			"id": "regions",
			"type": "fill",
			"source": "BIOPAMA_Poly",
			"source-layer": mapSubRegionLayer,
            "maxzoom": 4,
            "layout": {},
            "paint": {
                "fill-color": "#fff",
                "fill-opacity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0,
                    1,
                    4,
                    0
                ]
            }
		}, 'state-label-lg'); */
		map.addLayer({
			"id": "regionsBorder",
			"type": "line",
			"source": "BIOPAMA_Poly",
			"source-layer": mapSubRegionLayer,
            "paint": {
                "line-color": "#75b329",
                "line-width": ["interpolate", ["linear"], ["zoom"], 0, 4, 5, 1]
            }
		}, 'state-label-lg');
		map.addLayer({
			"id": "regionHover",
			"type": "line",
			"source": "BIOPAMA_Poly",
			"source-layer": mapSubRegionLayer,
			"layout": {
				"visibility": "none",
			},
			"paint": {
				"line-color": regionColor,
				"line-width": 4,
			}
		}, 'state-label-lg');
		map.addLayer({
			"id": "regionLabels",
			"type": "symbol",
			"source": "BIOPAMA_Point",
			"source-layer": mapSubRegionPointLayer,
			"maxzoom": 4,
            "layout": {
                "text-field": ["to-string", ["get", "Group"]],
                "text-font": [
                    "Arial Unicode MS Regular"
                ],
                "text-size": 22,
                "text-ignore-placement": true
            },
            "paint": {
                "text-color": "#a25b28",
                "text-halo-width": 3,
                "text-halo-color": "#fff",
                "text-halo-blur": 4
            }
		}, 'country-label-sm');
		map.addLayer({
			"id": "regionSelected",
			"type": "line",
			"source": "BIOPAMA_Poly",
			"source-layer": mapSubRegionLayer,
			"layout": {
				"visibility": "none",
			},
            "paint": {
                "line-color": regionColor,
                "line-dasharray": [3, 1],
				"line-width": 3,
            }
		}, 'state-label-lg');
/* 		map.addLayer({
			"id": "regionPoint",
			"type": "circle",
			"source": mapRegionPointSource,
			"source-layer": mapRegionPointLayer,
			"layout": {
				"visibility": "none"
			},
            "paint": {
				"circle-radius": 5,
				"circle-color": "#000",
				"circle-opacity": 0.8
            }
		}, 'state-label-lg'); */
		map.addLayer({
			"id": "countryMask",
			"type": "fill",
			"source": "BIOPAMA_Poly",
			"source-layer": mapCountryLayer,
			"paint": {
				'fill-color': '#fff',
				"fill-opacity": 0.01,
			}
		}, 'state-label-lg');
		map.addLayer({
			"id": "countryFill",
			"type": "fill",
			"layout": {
				"visibility": "none"
			},
			"source": "BIOPAMA_Poly",
			"source-layer": mapCountryLayer,
			"paint": {
				'fill-color': '#fff',
				'fill-outline-color': '#fff',
				"fill-opacity": 0.6,
			}
		}, 'state-label-lg');
		map.addLayer({
			"id": "countryHover",
			"type": "line",
			"source": "BIOPAMA_Poly",
			"source-layer": mapCountryLayer,
			"layout": {
				"visibility": "none",
			},
			"paint": {
				"line-color": countryColor,
				"line-width": 2,
			}
		}, 'state-label-lg');
		map.addLayer({
			"id": "countrySelected",
			"type": "line",
			"source": "BIOPAMA_Poly",
			"source-layer": mapCountryLayer,
			"layout": {
				"visibility": "none"
			},
			"paint": {
				"line-color": countryColor,
				"line-width": 3
			}
		}, 'state-label-lg');
		map.addLayer({
			"id": "wdpaAcpMask",
			"type": "fill",
			"source": "BIOPAMA_Poly",
			"source-layer": mapPaLayer,
			"minzoom": 3,
			"paint": {
				'fill-color': '#fff',
				"fill-opacity": 0.01
			}
		}, 'state-label-lg');
		map.addLayer({
			"id": "wdpaAcpFill",
			"type": "fill",
			"source": "BIOPAMA_Poly",
			"source-layer": mapPaLayer,
			"minzoom": 3,
            "paint": {
                "fill-color": [
                    "match",
                    ["get", "MARINE"],
                    ["1"],
                    "hsla(173, 21%, 51%, 0.2)",
                    "hsla(87, 47%, 53%, 0.2)"
                ],
                "fill-opacity": [
                    "interpolate",
                    ["exponential", 1],
                    ["zoom"],
                    3,
                    0.3,
                    5,
                    0.5,
                    6,
                    1
                ]
            }
		}, 'state-label-lg');
		map.addLayer({
			"id": "wdpaAcpFillHighlighted",
			"type": "fill",
			"source": "BIOPAMA_Poly",
			"source-layer": mapPaLayer,
			"layout": {
				"visibility": "none"
			},
			'paint': {
				'fill-color': paColor,
				'fill-outline-color': paColor,
				"fill-opacity": 0.6
			}
		}, 'state-label-lg');
		map.addLayer({
			"id": "wdpaAcpHover",
			"type": "line",
			"source": "BIOPAMA_Poly",
			"source-layer": mapPaLayer,
			"layout": {
				"visibility": "none"
			},
			"paint": {
				"line-color": "#8fc04f",
				"line-width": 3,
			}
		}, 'state-label-lg');
		
		map.addLayer({
			"id": "wdpaAcpSelected",
			"type": "line",
			"source": "BIOPAMA_Poly",
			"source-layer": mapPaLayer,
			"layout": {
				"visibility": "none"
			},
			"paint": {
				"line-color": "#679b95",
				"line-width": 2,
			},
			"transition": {
			  "duration": 300,
			  "delay": 0
			}
		}, 'state-label-lg');
		map.addLayer({
			"id": "wdpaAcpPoint",
			"type": "circle",
			"source": "BIOPAMA_Point",
			"source-layer": mapPaPointLayer,
			"filter": ["match", ["get", "Point"], [1], true, false],
			"minzoom": 5,
            "paint": {
                "circle-color": [
                    "match",
                    ["get", "MARINE"],
                    ["1"],
                    "hsla(173, 21%, 51%, 0.2)",
                    "hsla(87, 47%, 53%, 0.2)"
                ]
            }
		}, 'state-label-lg');
/* 		map.addLayer({
			"id": "regionLabels",
			"type": "symbol",
			"source": mapRegionPointSource,
			"source-layer": mapRegionPointLayer,
			"maxZoom": 4,
            "filter": ["==", "$type", "Point"],
            "layout": {
                "text-field": "{Name}",
                "text-size": 16,
                "text-padding": 3
            },
            "paint": {
                "text-color": "hsla(213, 49%, 13%, 0.95)",
                "text-halo-color": "hsla(0, 0%, 100%, .9)",
                "text-halo-width": 2,
                "text-halo-blur": 2
            }
		}, 'country-label-sm'); */
		//we seperate polygon and point layers to have an offset for the points, allowing the user to still see the point and the label at thte same time.
		map.addLayer({
			"id": "wdpaAcpPolyLabels",
			"type": "symbol",
			"source": "BIOPAMA_Point",
			"source-layer": mapPaLabelsLayer,
			"minzoom": 5,
            "layout": {
                "text-field": ["to-string", ["get", "NAME"]],
                "text-size": 12,
                "text-font": [
                    "Arial Unicode MS Regular",
                    "Arial Unicode MS Regular"
                ]
            },
            "paint": {
                "text-halo-width": 2,
                "text-halo-blur": 2,
                "text-halo-color": "hsl(0, 0%, 100%)",
                "text-opacity": 1
            }
		}, 'country-label-sm');
		map.addLayer({
			"id": "wdpaAcpPointLabels",
			"type": "symbol",
			"source": "BIOPAMA_Point",
			"source-layer": mapPaPointLayer,
			"minzoom": 5,
            "layout": {
                "text-field": "{NAME}",
                "text-size": 12,
                "text-padding": 3,
				"text-offset": [0,-1]
            },
            "paint": {
                "text-color": "hsla(213, 49%, 13%, 0.95)",
                "text-halo-color": "hsla(0, 0%, 100%, .9)",
                "text-halo-width": 2,
                "text-halo-blur": 2
            }
		}, 'country-label-sm');
		
		//add the selected Country Layer
		
		//add the Country masks layer for indicators
		map.addLayer({
			"id": "CountriesBadMask",
			"type": "line",
			"source": "BIOPAMA_Poly",
			"source-layer": mapCountryLayer,
			"layout": {
				"visibility": "none"
			},
			'paint': {
				"line-color": "rgba(255,255,255, 0.1)",
				"line-width": 3
			}
		}, 'state-label-lg');
		map.addLayer({
			"id": "CountriesGoodMask",
			"type": "line",
			"source": "BIOPAMA_Poly",
			"source-layer": mapCountryLayer,
			"layout": {
				"visibility": "none"
			},
			'paint': {
				"line-color": "#8FBF4B",
				"line-width": 3
			}
		}, 'state-label-lg');
		map.addLayer({
		  id: 'satellite',
		  source: {"type": "raster",  "url": "mapbox://mapbox.satellite", "tileSize": 256},
		  type: "raster",
		  "layout": {
					"visibility": "none"
				}
		}, 'road-rail-platform');
		$('body').toggleClass('loaded').delay( 500 ).queue(function() {
		  $('.mapboxgl-ctrl.ajax-loader').toggle(false);
		  mapPostLoadOptions();
		  //$('#take-a-tour').popover("show");
		  //$('.popover').attr('id', 'tourTip');
		  $( this ).dequeue();
		}).delay( 3000 ).queue(function() {
		  //$('#take-a-tour').popover("hide");
		  //$( this ).dequeue();

		});
	});
});
