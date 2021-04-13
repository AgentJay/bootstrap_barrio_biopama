function updateRegion(region = selSettings.regionID, countryUpdate = true) {
	regionChanged = 0;
	if((selSettings.ISO2 !== null) && (countryUpdate === true)){
		removeCountry();
	}
	zoomToRegion(region);
	thisMap.setLayoutProperty("regionSelected", 'visibility', 'visible');
	thisMap.setFilter('regionSelected', ['==', 'Group', "Caribbean"]);
	updateAddress();
	updateBreadRegion();
}

function updateCountry(chartValue = 'iso2', zoomTo = true, clearPA = true) {
	countryChanged = 0;
	if (zoomTo === true) {
		zoomToCountry(selSettings.ISO2);
		updateAddress();
	}
	
	//If we are moving to a new country the currently selected PA can't follow us there, so we remove it
	if((clearPA === true) && (selSettings.WDPAID > 0)){ removePA(); }
	
	//Our Protected areas layer does not have the ISO2 country codes, it only has ISO3 codes.
	//The mapbox geocoder only has ISO2 codes (in lower case)...
	//We use our country layer, which has both, as a lookup table
	var relatedFeatures = thisMap.querySourceFeatures("BIOPAMA_Poly",{
		sourceLayer:mapCountryLayer,
		filter: ['==', 'iso2', selSettings.ISO2]
	});
	//Here we update all of our global settings by getting them from the EEZ/Country layer
	selSettings.ISO2 = relatedFeatures[0].properties.iso2;
	selSettings.ISO3 = relatedFeatures[0].properties.iso3;
	selSettings.NUM = relatedFeatures[0].properties.un_m49;
	if (selSettings.regionName !== relatedFeatures[0].properties.Group){
		selSettings.regionName = relatedFeatures[0].properties.Group;
		updateRegion(selSettings.regionName, false);
	}
	
	if (selSettings.countryName !== relatedFeatures[0].properties.name_iso31){
		selSettings.countryName = relatedFeatures[0].properties.name_iso31;
		updateBreadCountry();
	}
	thisMap.setFilter("wdpaAcpPolyLabels", [ "all", ["in", "Point", 0], ['in', 'ISO3', selSettings.ISO3] ]);
	thisMap.setFilter("wdpaAcpPointLabels", [ "all", ["in", "Point", 1], ['in', 'ISO3', selSettings.ISO3] ]);
	thisMap.setFilter('countryFill', [ "all", ['==', 'Group', selSettings.regionName], ['!=', 'iso3', selSettings.ISO3] ]);
	thisMap.setLayoutProperty("countrySelected", 'visibility', 'visible');
	thisMap.setFilter('countrySelected', ['==', 'iso3', selSettings.ISO3]);
	thisMap.setFilter('wdpaAcpFillHighlighted', ['==', 'ISO3', selSettings.ISO3]);
	thisMap.setFilter('wdpaAcpFill', ['!=', 'ISO3', selSettings.ISO3]);
	jQuery('.mapboxgl-ctrl-layer-fill').show();
	thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'visible');
	jQuery('.mapboxgl-ctrl-z-country').show();
}
function updatePa() {
	paChanged = 0;
	thisMap.setLayoutProperty("wdpaAcpSelected", 'visibility', 'visible');
	thisMap.setFilter('wdpaAcpSelected', ['==', 'WDPAID', selSettings.WDPAID]);
	thisMap.setPaintProperty('wdpaAcpSelected', 'line-width', 10);
	setTimeout(function(){
		thisMap.setPaintProperty('wdpaAcpSelected', 'line-width', 2);
	}, 300);
	//if there's a chart 
	if (jQuery("#indicator-chart-country:visible").length){
		highlightMapFeature();
	}

	updateCountry('iso3', false, false);

	updateBreadPA();
	udateAddress();
}
