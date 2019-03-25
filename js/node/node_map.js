function mapPostLoadOptions() {
	if ((selSettings.ISO2 !== null) && (jQuery(".view-breadcrumb-country-summary:visible").length)){
		countryChanged = 1;
		zoomToCountry(selSettings.ISO2);
		//thisMap.setLayoutProperty("regionsFill", 'visibility', 'none');
		//thisMap.setFilter('countryFill', ['!=', 'iso3', selSettings.ISO3]);
		//thisMap.setLayoutProperty("countryFill", 'visibility', 'visible');
	}
	if ((selSettings.WDPAID !== null) && (jQuery(".view-breadcrumb-protected-area-summary:visible").length)){
		//thisMap.setLayoutProperty("regionsFill", 'visibility', 'none');
		//thisMap.setLayoutProperty("countryFill", 'visibility', 'none');
		paChanged = 1;
		zoomToPA(selSettings.WDPAID);
	}
	if ((selSettings.regionID !== null) && (jQuery(".view-breadcrumb-region-summary:visible").length)){
		thisMap.setLayoutProperty("countryFill", 'visibility', 'visible');
		thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'visible');
		//thisMap.setFilter('regionsFill', ['!=', 'iso3', selSettings.ISO3]);
		thisMap.setFilter('wdpaAcpFillHighlighted', null);
		thisMap.setPaintProperty("wdpaAcpFillHighlighted", "fill-opacity", 0.01);
		thisMap.setFilter('countryFill', null);
		thisMap.setPaintProperty("countryFill", "fill-opacity", 0.01);
		regionChanged = 1;
		zoomToRegion(selSettings.regionID);
		jQuery( ".region-solutions-hide" ).removeClass("region-solutions-hide");
	}
	class mapSatControl {
		onAdd(thisMap) {
			this._map = thisMap;
			this._container = document.createElement('div');
			this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
			this._container.innerHTML = "<button class='mapboxgl-ctrl-icon mapboxgl-ctrl-sat' title='Toggle Satellite base layer' id='satellite-layer' type='button'><i class='fab fa-grav'></i></button>";
			return this._container;
		}
		onRemove() {
			this._container.parentNode.removeChild(this._container);
			this._map = undefined;
		}
	}
	
	mapSat = new mapSatControl();
	
	thisMap.addControl(new mapboxgl.FullscreenControl());
	thisMap.addControl(new mapboxgl.NavigationControl());
	thisMap.addControl(mapLoader, 'top-left');	
	thisMap.addControl(mapSat, 'top-right');
	jQuery('.mapboxgl-ctrl.ajax-loader').toggle(false);
/* 	thisMap["dragPan"].disable();
	thisMap["scrollZoom"].disable();
	thisMap["boxZoom"].disable();
	thisMap["dragRotate"].disable();
	thisMap["keyboard"].disable();
	thisMap["doubleClickZoom"].disable();
	thisMap["touchZoomRotate"].disable(); */
	jQuery('#satellite-layer').bind("click", function(){
		if (jQuery( "#satellite-layer" ).hasClass( "sat-on" )) {
			jQuery('#satellite-layer').removeClass( "sat-on" );
			thisMap.setLayoutProperty('satellite', 'visibility', 'none');
		} else {
			jQuery('#satellite-layer').addClass( "sat-on" );
			thisMap.setLayoutProperty('satellite', 'visibility', 'visible');
		}
	});
}

function updatePaInfo(){
	console.log("Yea");
}