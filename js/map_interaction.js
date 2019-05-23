
function updatePa() {
	paChanged = 0;
	
	thisMap.setFilter('wdpaAcpSelected', ['==', 'WDPAID', selSettings.WDPAID]);
	thisMap.setLayoutProperty("wdpaAcpSelected", 'visibility', 'visible');
	thisMap.setPaintProperty('wdpaAcpSelected', 'line-width', 10);
	setTimeout(function(){
		thisMap.setPaintProperty('wdpaAcpSelected', 'line-width', 2);
	}, 300);
	//if there's a chart 
	if (jQuery("#indicator-chart-country:visible").length){
		highlightMapFeature();
	}
	console.log(selSettings.WDPAID)
	var relatedFeatures = thisMap.querySourceFeatures("BIOPAMA_Poly",{
		sourceLayer:mapPaLayer,
		filter: ['==', 'WDPAID', selSettings.WDPAID]
	});
	//Here we update all of our global settings by getting them from the EEZ/Country layer
	selSettings.paName = relatedFeatures[0].properties.NAME;

	if (selSettings.ISO3 !== relatedFeatures[0].properties.ISO3){
		selSettings.ISO3 = relatedFeatures[0].properties.ISO3;
		updateCountry('iso3', false, false);
		
	}
	updateBreadPA();
	updateAddress();
}

function updateCountry(chartValue = 'iso2', zoomTo = true, clearPA = true) {
	countryChanged = 0;
	if (zoomTo == true) {
		zoomToCountry(selSettings.ISO2);
		updateAddress();
	}
	
	//If we are moving to a new country the currently selected PA can't follow us there, so we remove it
	if((clearPA == true) && (selSettings.WDPAID > 0)) removePA();
	
	var filter;
	if (chartValue == 'iso3'){
			filter = selSettings.ISO3;
	} else if (chartValue == 'num'){
		filter = selSettings.NUM;
	} else {
		filter = selSettings.ISO2;
	}
	//Our Protected areas layer does not have the ISO2 country codes, it only has ISO3 codes.
	//The mapbox geocoder only has ISO2 codes (in lower case)...
	//We use our country layer, which has both, as a lookup table
	var relatedFeatures = thisMap.querySourceFeatures("BIOPAMA_Poly",{
		sourceLayer:mapCountryLayer,
		filter: ['==', chartValue, filter]
	});
	//Here we update all of our global settings by getting them from the EEZ/Country layer
	selSettings.ISO2 = relatedFeatures[0].properties.iso2;
	selSettings.ISO3 = relatedFeatures[0].properties.iso3;
	selSettings.NUM = relatedFeatures[0].properties.un_m49;
	if (selSettings.regionID !== relatedFeatures[0].properties.Group){
		selSettings.regionID = relatedFeatures[0].properties.Group;
		updateRegion(selSettings.regionID, false);
	}
	
	if (selSettings.countryName !== relatedFeatures[0].properties.name_iso31){
		selSettings.countryName = relatedFeatures[0].properties.name_iso31;
		updateBreadCountry();
	}
	thisMap.setFilter("wdpaAcpPolyLabels", [ "all", ["in", "Point", 0], ['in', 'ISO3', selSettings.ISO3] ]);
	thisMap.setFilter("wdpaAcpPointLabels", [ "all", ["in", "Point", 1], ['in', 'ISO3', selSettings.ISO3] ]);
	thisMap.setFilter('countryFill', [ "all", ['==', 'Group', selSettings.regionID], ['!=', 'iso3', selSettings.ISO3] ]);
	thisMap.setLayoutProperty("countrySelected", 'visibility', 'visible');
	thisMap.setFilter('countrySelected', ['==', 'iso3', selSettings.ISO3]);
	thisMap.setFilter('wdpaAcpFillHighlighted', ['==', 'ISO3', selSettings.ISO3]);
	thisMap.setFilter('wdpaAcpFill', ['!=', 'ISO3', selSettings.ISO3]);
	jQuery('.mapboxgl-ctrl-layer-fill').show();
	thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'visible');
	jQuery('.mapboxgl-ctrl-z-country').show();
}
function updateRegion(region = selSettings.regionID, countryUpdate = true) {
	regionChanged = 0;
	if((selSettings.ISO2 != null) && (countryUpdate == true)){
		removeCountry();
	}
	selSettings.regionID = region;

	selSettings.regionName = selSettings.regionID;

	thisMap.setFilter('countryFill', ['==', 'Group', region]);
	thisMap.setFilter('regionsFill', ['!=', 'Group', region]);
	//thisMap.setPaintProperty("regionsFill", "fill-opacity", ["match", ["get", "Group"], [region], 0, 0.6]);
	if (countryUpdate == true) {
		zoomToRegion(region);
		updateAddress();
	}
	thisMap.setLayoutProperty("countryFill", 'visibility', 'visible');
	updateBreadRegion();
}
