jQuery(document).ready(function($) {
	thisMap.on('click', getFeatureInfo);
	
	function getFeatureInfo(e){
		var regionSelected = regionCheck(e);
		var CountrySelected = countryCheck(e);
		var pasSelected = paCheck(e);
		var regionText = '';
		var countryText = '';
		var pasText = '';

		if (typeof regionSelected !== 'undefined' ){
			regionText = "<div class='pop-region'>" + regionSelected + "</div>";
		}
		if (typeof CountrySelected !== 'undefined' ){
			countryText = "<div class='pop-country'>" + CountrySelected + "</div>";
		}
		if (typeof pasSelected !== 'undefined' ){
			pasText = "<div class='pop-pa'>" + pasSelected + "</div>";
		}
		
		var paPopupContent = "<div class='pop-wrapper'>" +
				regionText +
				countryText +
				pasText +
				"</div>";
		if (paPopupContent.length > 63){
			new mapboxgl.Popup()
			.setLngLat(e.lngLat)
			.setHTML(paPopupContent)
			.addTo(thisMap);
		}
		
	}
	function regionCheck(e){
		var region = getMapRegion(e.point);
		if (typeof region !== 'undefined') {
			var regionSelected = 'disabled';
			if (selSettings.regionID != region.properties.Group){
				regionSelected = 'enabled'
			}
			var regionLink = "<a class='btn btn-primary btn-sm "+regionSelected+"' href='/region/"+region.properties.Group+"'>" + region.properties.Name + "</a><a class='btn btn-secondary btn-sm' href='/region/"+region.properties.Group+"'><i class='fas fa-external-link-alt'></i></a>";	
			return regionLink;
		} 
	}
	function countryCheck(e){
		var country = getMapCountry(e.point);
		if (typeof country !== 'undefined') {
			var countrySelected = 'disabled';
			if (selSettings.iso2 != country.properties.iso2){
				countrySelected = 'enabled';
			}
			var countryLink = "<a class='btn btn-primary btn-sm "+countrySelected+"' href='/country/"+country.properties.iso2+"'>" + country.properties.original_n + "</a><a class='btn btn-secondary btn-sm' href='/country/"+country.properties.iso2+"'><i class='fas fa-external-link-alt'></i></a>";
			return countryLink;
		}
	}
	function paCheck(e){
		var PAs = getMapPAs(e.point);
		if (typeof PAs !== 'undefined') {
			var paLinks = "";
			for (var key in PAs) {
			  paLinks = paLinks + "<a href='/pa/"+PAs[key].properties.WDPAID+"'>" + PAs[key].properties.NAME + "</a>";
			}
			return paLinks;
		}
	}
});

var homepageMapZoomOptions = {
	padding: {top: 20, bottom:20, left: 20, right: 20}
};
/* (function ($, Drupal) {
	$( ".view-id-menu_level_1_policies_:visible" ).trigger('RefreshView')
})(jQuery, Drupal); */
function zoomToRegion(region){
  var lowRegion = region.toLowerCase();
  if(lowRegion === 'cw_africa'){
	selSettings.regionID = 'CW_Africa';
    thisMap.fitBounds([[-20.917969,-21.779905], [34.277344,28.149503]], homepageMapZoomOptions);
  } else if (lowRegion === 'es_africa'){
	selSettings.regionID = 'ES_Africa';
    thisMap.fitBounds([[5.976563,-35.960223], [53.789062,18.729502]], homepageMapZoomOptions);
  } else if (lowRegion === 'pacific'){
	selSettings.regionID = 'Pacific';
    thisMap.fitBounds([[123.75,-24.846565], [216.914063,18.312811]], homepageMapZoomOptions);
  } else if (lowRegion === 'caribbean') {
	selSettings.regionID = 'Caribbean';
	thisMap.fitBounds([[-93.691406,-1.581830], [-51.240234,28.844674]], homepageMapZoomOptions);
  } else {
	  return;
  }
}

function zoomToCountry(iso2){
  var result;
  if(iso2 === 'FJ'){
    thisMap.fitBounds([[166.61,-26.39], [192.01,-9.62]], homepageMapZoomOptions);
  } else if (iso2 === 'TV'){
    thisMap.fitBounds([[168.58,-13.60], [191.48,-3.88]], homepageMapZoomOptions);
  } else if (iso2 === 'KI'){
    thisMap.fitBounds([[-201.57,-15.70], [-136.18,10.31]], homepageMapZoomOptions);
  } else {
    jQuery.ajax({
      url: DOPAgetCountryExtent+iso2,
      dataType: 'json',
      success: function(d) {

        thisMap.fitBounds(jQuery.parseJSON(d.records[0].extent), homepageMapZoomOptions);
      },
      error: function() {
        console.log("Something is wrong with the REST servce for country bounds")
      }
    });
  }
}

function zoomToPA(wdpaid){
	selSettings.WDPAID = wdpaid;
    jQuery.ajax({
      url: DOPAgetWdpaExtent+wdpaid,
      dataType: 'json',
      success: function(d) {
        thisMap.fitBounds(jQuery.parseJSON(d.records[0].extent), homepageMapZoomOptions);
		selSettings.paName = d.records[0].name;
		if (d.records[0].iso2 != selSettings.ISO2){
			selSettings.ISO2 = d.records[0].iso2;
		}
      },
      error: function() {
        console.log("Something is wrong with the REST servce for PA bounds")
      }
    });
}

//returns the first region object
function getMapRegion(point){
	var feature = thisMap.queryRenderedFeatures(point, {
		layers:["regionsFill"],
	});
	//as long as we have something in the feature query 
	if (typeof feature[0] !== 'undefined'){
		return feature[0];
	} 
}

//returns the first country object
function getMapCountry(point){
	var feature = thisMap.queryRenderedFeatures(point, {
		layers:["countryFill"],
	});
	//as long as we have something in the feature query 
	if (typeof feature[0] !== 'undefined'){
		return feature[0];
	}
}

//returns a list of PA objects
function getMapPAs(point){
	var paFeatures = thisMap.queryRenderedFeatures(point, {
		layers:["wdpaAcpFillHighlighted"]
	});
	if (typeof paFeatures[0] !== 'undefined'){
		return paFeatures;
	}
}