function mapPostLoadOptions() {
/* 	if (selSettings.ISO2 !== null){
		countryChanged = 1;
		zoomToCountry(selSettings.ISO2);
	} */
	var height = getWindowHeight();
	resizeMap(height);
	thisMap.addControl(new mapboxgl.FullscreenControl());
	thisMap.addControl(new mapboxgl.NavigationControl());
	thisMap.addControl(mapLoader, 'top-left');	
	thisMap.addControl(mapGeneric, 'top-right');
	thisMap.addControl(mapZoom, 'top-right');		
	thisMap.addControl(paFill, 'top-right');	
	thisMap.addControl(mapInfo, 'bottom-right');		
	thisMap.addControl(mapLegend, 'bottom-right');
	thisMap.setMinZoom(1.4);
	thisMap.setMaxZoom(8);
	jQuery('.mapboxgl-ctrl.ajax-loader').toggle(false);
	
	jQuery('#satellite-layer').bind("click", function(){
		if (jQuery( "#satellite-layer" ).hasClass( "sat-on" )) {
			jQuery('#satellite-layer').removeClass( "sat-on" );
			thisMap.setLayoutProperty('satellite', 'visibility', 'none');
		} else {
			jQuery('#satellite-layer').addClass( "sat-on" );
			thisMap.setLayoutProperty('satellite', 'visibility', 'visible');
		}
	});
	jQuery('#emm-news').bind("click", function(){
		if (jQuery( "#emm-news" ).hasClass( "sat-on" )) {
			jQuery('#emm-news').removeClass( "sat-on" );
			removeEMMNews();
		} else {
			jQuery('#emm-news').addClass( "sat-on" );
			addEMMNews();
			tour.init();
			tour.restart(true);
		}
	});
	jQuery('#layer-fill-toggle').bind("click", function(){
		if (jQuery( "#layer-fill-toggle" ).hasClass( "fill-off" )) {
			jQuery('#layer-fill-toggle').removeClass( "fill-off" );
			//'fill-color': 'rgba(255, 152, 0, 0.5)',
			if (thisMap.getLayer("wdpaAcpFillHighlighted")) thisMap.setPaintProperty("wdpaAcpFillHighlighted", 'fill-color', 'rgba(255, 152, 0, 0.5)');
			if (thisMap.getLayer("1nd1l4y3r")) thisMap.setPaintProperty("1nd1l4y3r", 'fill-color', paintProp);
			
		} else {
			jQuery('#layer-fill-toggle').addClass( "fill-off" );
			if (thisMap.getLayer("wdpaAcpFillHighlighted")) thisMap.setPaintProperty("wdpaAcpFillHighlighted", 'fill-color', 'rgba(0, 0, 0, 0)');
			if (thisMap.getLayer("1nd1l4y3r")) thisMap.setPaintProperty("1nd1l4y3r", 'fill-color', 'rgba(0, 0, 0, 0)');
		}
	});
	
	jQuery('.mapboxgl-ctrl-z-global').bind("click", function(){
		thisMap.flyTo({
			center: [0, -6.66],
			zoom: 1.5
		});
	});
	jQuery('.mapboxgl-ctrl-z-region').bind("click", function(){
		zoomToRegion(selSettings.regionID);
	});
	jQuery('.mapboxgl-ctrl-z-country').bind("click", function(){
		zoomToCountry(selSettings.ISO2);
	});
	jQuery('.mapboxgl-ctrl-z-pa').bind("click", function(){
		zoomToPA(selSettings.WDPAID);
	});
	//enableSplashScreen();
	var splashCheck = jQuery.jStorage.get("splashScreenIgnore", "not set");
	if (splashCheck !== "stopShowingMe"){
		showTheSplashScreen()
	}

}
function addEMMNews(){
	var emmGeoJson = {
		"type": "FeatureCollection",
		"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
	};

	jQuery.ajax({
		url: "/news/news.rss",
		dataType: 'xml',
		success: function(d) {
			var emmArticles = [];
			jQuery(d).find("item").each(function(){
				var emmTitle = jQuery(this).find("title").text();
				var emmLink = jQuery(this).find("link").text();
				var emmGUID = jQuery(this).find("guid").text();
				var emmDate = jQuery(this).find("pubDate").text();
				var emmDescription = jQuery(this).find("description").text();
				var emmPoint = jQuery(this).find("georss\\:point").text();
				//take only the results that have points
				if (emmPoint.length > 2){
					var emmLoc = emmPoint.split(" ");
					var emmXcoord = parseInt(emmLoc[1]);
					var emmYcoord = parseInt(emmLoc[0]);
					emmCoords = [emmXcoord, emmYcoord, 0];
					var emmArticle = { "type": "Feature", "properties": { "id": emmGUID, "title": emmTitle, "link": emmLink, "description": emmDescription, "date": emmDate }, "geometry": { "type": "Point", "coordinates": emmCoords } }
					//console.log(emmArticle);
					emmArticles.push(emmArticle)
				}
			});
			emmGeoJson.features = emmArticles;
			thisMap.addSource("emm-news", {
				type: "geojson",
				data: emmGeoJson,
				cluster: true,
				clusterMaxZoom: 10,
				clusterRadius: 30
			});
			thisMap.addLayer({
				id: "clusters",
				type: "circle",
				source: "emm-news",
				filter: ["has", "point_count"],
				paint: {
					// Use step expressions (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
					// with three steps to implement three types of circles:
					//   * Blue, 20px circles when point count is less than 100
					//   * Yellow, 30px circles when point count is between 100 and 750
					//   * Pink, 40px circles when point count is greater than or equal to 750
					"circle-color": [
						"step",
						["get", "point_count"],
						"#51bbd6",
						5,
						"#f1f075",
						10,
						"#f28cb1"
					],
					"circle-radius": [
						"step",
						["get", "point_count"],
						10,
						5,
						15,
						10,
						20
					]
				}
			});

			thisMap.addLayer({
				id: "cluster-count",
				type: "symbol",
				source: "emm-news",
				filter: ["has", "point_count"],
				layout: {
					"text-field": "{point_count_abbreviated}",
					"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
					"text-size": 12
				}
			});

			thisMap.addLayer({
				id: "unclustered-point",
				type: "circle",
				source: "emm-news",
				filter: ["!", ["has", "point_count"]],
				paint: {
					"circle-color": "#11b4da",
					"circle-radius": 6,
					"circle-stroke-width": 1,
					"circle-stroke-color": "#fff"
				}
			});

			// inspect a cluster on click
			thisMap.on('click', 'clusters', function (e) {
				var features = thisMap.queryRenderedFeatures(e.point, { layers: ['clusters'] });
				var clusterId = features[0].properties.cluster_id;
				thisMap.getSource('emm-news').getClusterExpansionZoom(clusterId, function (err, zoom) {
					if (err)
						return;
					var curZoom = thisMap.getZoom();
					
					if (curZoom == zoom){
						console.log(features)
					} else {
						thisMap.easeTo({
							center: features[0].geometry.coordinates,
							zoom: zoom + 1
						});
					}
				});
			});
			thisMap.on('click', 'unclustered-point', function (e) {
				console.log(e.features)
				var popText = '';
				var coordinates = e.features[0].geometry.coordinates.slice();
				for (var key in e.features) {
				popText = popText + "<div class='card pop-news-card'>" + 
					"<div class='card-header'>" +
						"<div class='pop-news-title'>" + e.features[key].properties.title + "</div>" +
						"<div class='pop-news-date'>" + e.features[key].properties.date + "</div>" +
					"</div>" +
					"<div class='card-body'>"+
						"<span class='col-sm-12 pop-news-desc'>" + e.features[key].properties.description + "</span>" +
						"<span class='col-sm-12 pa-news-link'><a href='" + e.features[key].properties.link + "' target='_blank' class='btn btn-info' role='button'>Read More</a></span>" +
					"</div>" +
				  "</div>";
				}

				// Ensure that if the map is zoomed out such that multiple
				// copies of the feature are visible, the popup appears
				// over the copy being pointed to.
				while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
					coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
				}

				new mapboxgl.Popup()
					.setLngLat(coordinates)
					.setHTML(popText)
					.addTo(thisMap);
			});

			thisMap.on('mouseenter', 'clusters', function () {
				thisMap.getCanvas().style.cursor = 'pointer';
			});
			thisMap.on('mouseleave', 'clusters', function () {
				thisMap.getCanvas().style.cursor = '';
			});
			thisMap.on('mouseenter', 'unclustered-point', function () {
				thisMap.getCanvas().style.cursor = 'pointer';
			});
			thisMap.on('mouseleave', 'unclustered-point', function () {
				thisMap.getCanvas().style.cursor = '';
			});
			
		},
		error: function() {
			console.log("No news")
		}
	});	

}

function removeEMMNews(){
	thisMap.removeLayer("unclustered-point");
	thisMap.removeLayer("cluster-count");
	thisMap.removeLayer("clusters");
	thisMap.removeSource("emm-news");	
}
function showTheSplashScreen(){
	var splashURL = '/node/18220';
	Drupal.ajax({ 
		url: splashURL,
		success: function(response) {			
		var $splashDialogContents
		for (var key in response) {
			// skip loop if the property is from prototype
			if (!response.hasOwnProperty(key)) continue;
			var obj = response[key];
			for (var prop in obj) {
				// skip loop if the property is from prototype
				if(!obj.hasOwnProperty(prop)) continue;
				if(prop == "data"){
					$splashDialogContents = jQuery('<div>' + response[key].data + 
					'<div class="splash-button-wrapper">'+
						'<button type="button" class="splash-button splash-ok btn btn-success" onclick="splashClose();return false;">OK</button>'+
						'<button type="button" class="splash-button splash-disable btn btn-info" onclick="disableSplashScreen();return false;">Stop showing this message*</button>'+
						'<div class="splash-button-footer">*Prevents this message from showing up next time you visit the site. This message can be enabled in the help section.</div>'+
					'</div></div>').appendTo('body');
				}
			}
		}

		var splashDialog = Drupal.dialog($splashDialogContents, {title: 'Welcome to the new BIOPAMA RIS', dialogClass: "splash-dialog", width: "80%", height: "80%"});
		splashDialog.showModal();
		}
	}).execute();  
}

function disableSplashScreen(){
	jQuery.jStorage.set("splashScreenIgnore", "stopShowingMe");
	splashClose();
}

function splashClose(){
	jQuery( ".splash-dialog .ui-dialog-titlebar-close" ).trigger( "click" );
}

jQuery(document).ready(function($) {
	
	$('.indicator-title-wrapper').ready(function($) {
		$('div#block-mapmenuscope').on( 'click', '.indicator-title-wrapper > .field-content', function() {
			
			$(".activeSelection" ).removeClass( "activeSelection" );
			$(this).closest('.indicator-row').addClass( "activeSelection" );
			$("<div id='mini-loader-wrapper'><div id='mini-loader'></div></div>").insertBefore(".activeSelection");
			//var indicatorTitle = $(this).find(".field--name-title").text().replace(/\s/g, "-").trim().toLowerCase();
			var nodeID = $(this).closest(".indicator-row").find(".views-field-nid").text().trim();
			currentIndicatorNodeURL = '/node/'+nodeID;
			showIndicatorCard(currentIndicatorNodeURL)
		});
	});
});
function showIndicatorCard(indicatorURL){
	Drupal.ajax({ 
	  url: indicatorURL,
	  success: function(response) {			
		var $countryDialogContents
		for (var key in response) {
			// skip loop if the property is from prototype
			if (!response.hasOwnProperty(key)) continue;
			var obj = response[key];
			for (var prop in obj) {
				// skip loop if the property is from prototype
				if(!obj.hasOwnProperty(prop)) continue;
				//console.log(prop + " = " + obj[prop]);
				if(prop == "data"){
					//console.log(prop + " = " + obj[prop]);
					jQuery('#block-indicatorcard').show();
					$countryDialogContents = jQuery('<div>' + response[key].data + '</div>').appendTo('body');
				}
			}
		}
		jQuery('#block-indicatorcard').empty();
		$countryDialogContents.appendTo('#block-indicatorcard');
		Drupal.attachBehaviors(jQuery("#block-indicatorcard").get(0));
	  }
	}).execute();
}

function getRestResults(){
	firstChartRun = 1;
	var dataCountry = 1;
	//delete any errors that might be up, if they persist, they will be re-added
	jQuery( ".rest-error" ).empty();
	//if the chosen indicator has countries attached to it we highlight them, and mask the ones not included.
	//console.log(selSettings.selIndicatorCountries);
	if (selData.info.countries != ''){
		thisMap.setFilter("CountriesBadMask", buildFilter(selData.info.countries, '!in', 'iso3'));
		thisMap.setFilter("CountriesGoodMask", buildFilter(selData.info.countries, 'in', 'iso3'));
		thisMap.setLayoutProperty("CountriesGoodMask", 'visibility', 'visible');
		thisMap.setLayoutProperty("CountriesBadMask", 'visibility', 'visible');
	}
	if (selData.data.countries.length > 0){
		if (selData.data.countries.indexOf(selSettings.ISO3) > -1){
			// a country or countries have been set and the current country is in the set
			dataCountry = 1;
		} else {
			//a country or countries have been set and the currently selected country is not one of them
			dataCountry = 0;
		}
	}
	if (dataCountry == 1){
		//we get the indicator name as a class
		var indicator = selData.info.name;
		//we pass the class to our generate url function to keep the finished product 
		var indicatorURL = generateRestURL();
		console.log(indicatorURL)
		//console.log(selData.chart.RESTdataContext) 
		jQuery.ajax({
			url: indicatorURL,
			dataType: 'json',
			success: function(d) {
				//console.log(d);
		  if (d.hasOwnProperty("records")){ //from a JRC REST Service
			selData.chart.RESTResults = d.records;
			if (d.metadata.recordCount == 0) {
			  //we create a card, but tell it that the response was empty (error 2)
			  getChart(2);
			} else {
			  //the 0 means there was no error
			  getChart(0);
			}
		  }
		  else if (d.hasOwnProperty(selData.chart.RESTdataContext)){
			selData.chart.RESTResults = d[selData.chart.RESTdataContext];
			console.log("1");
			getChart(0);
		  } else {
			selData.chart.RESTResults = d;
			console.log("2");
			getChart(0);
		  }
			},
			error: function() {
				console.log("ERROR")
				//we create a card, but tell it that there was a general error (error 1)
				//todo - expand error codes to tell user what went wrong.
				getChart(1);
			}
		});
	} else {
		//we run the get chart function, only to show the user that a different country must be selected
		getChart(3);
	}
}

function generateRestURL(){
	//we get the url from the hidden fields in the indicator menu
	var indicatorURL = selData.chart.RESTurl
	//our URL should contain some tokens as placeholders. So here we switch those out with the real values
	indicatorURL = indicatorURL.replace("NUM", selSettings.NUM)
	.replace("ISO2", selSettings.ISO2)
	.replace("ISO3", selSettings.ISO3)
	.replace("WDPAID", selSettings.WDPAID)
	.replace("REGION", selSettings.regionID);	
	return indicatorURL;
}
