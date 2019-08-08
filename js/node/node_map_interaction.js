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
			regionText = "<div class='node-pop-region'>" + regionSelected + "</div>";
		}
		if (typeof CountrySelected !== 'undefined' ){
			countryText = "<div class='node-pop-country'>" + CountrySelected + "</div>";
		}
		if (typeof pasSelected !== 'undefined' ){
			pasText = "<div class='node-pop-pa'>Protected Areas:<br>" + pasSelected + "</div>";
		}
		
		var paPopupContent = "<div class='node-pop-wrapper'>" +
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
		var regionURL = '';
		console.log(region)
		if (typeof region !== 'undefined') {
			switch(region.properties.Group) {
				case "Eastern Africa":
					regionURL = "eastern_africa";
					//console.log(popUpContents.regionID);
					break;
				case "Central Africa":
					regionURL = "central_africa";
					break;
				case "Western Africa":
					regionURL = "western_africa";
					break;
				case "Southern Africa":
					regionURL = "southern_africa";
					break;
				default:
					regionURL = selSettings.regionName;
					break;
				}
			var regionSelected = 'disabled';
			if (selSettings.regionID != region.properties.Group){
				regionSelected = 'enabled'
			}
			var regionLink = "Region: <a class=' "+regionSelected+"' href='/region/"+regionURL+"'>" + region.properties.Group + "</a>";	
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
			var countryLink = "Country: <a class=' "+countrySelected+"' href='/country/"+country.properties.iso2+"'>" + country.properties.original_n + "</a>";
			return countryLink;
		}
	}
	function paCheck(e){
		var PAs = getMapPAs(e.point);
		if (typeof PAs !== 'undefined') {
			var paLinks = "";
			for (var key in PAs) {
			  paLinks = paLinks + "<a href='/pa/"+PAs[key].properties.WDPAID+"'>" + PAs[key].properties.NAME + "</a><br>";
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
  if(region === 'central_africa'){
	selSettings.regionID, selSettings.regionName = 'Central Africa';
    thisMap.fitBounds([[1.8683898449,24.8886363352], [36.1896789074,-16.0012446593]], homepageMapZoomOptions);
  } else if (region === 'eastern_africa'){
	selSettings.regionID, selSettings.regionName = 'Eastern Africa';
    thisMap.fitBounds([[20.3034484386,26.6692628716], [54.6247375011,-14.0916051203]], homepageMapZoomOptions);
  } else if (region === 'western_africa'){
	selSettings.regionID, selSettings.regionName = 'Western Africa';
    thisMap.fitBounds([[-28.1462585926,31.1678846111], [20.4572570324,-0.7446243056]], homepageMapZoomOptions);
  } else if (region === 'southern_africa'){
	selSettings.regionID, selSettings.regionName = 'Southern Africa';
    thisMap.fitBounds([[6.5265929699,-5.3073515284], [61.0187804699,-47.2924889494]], homepageMapZoomOptions);
  } else if (region === 'pacific'){
	selSettings.regionID, selSettings.regionName = 'Pacific';
    thisMap.fitBounds([[123.75,-24.846565], [216.914063,18.312811]], homepageMapZoomOptions);
  } else if (region === 'caribbean') {
	selSettings.regionID, selSettings.regionName = 'Caribbean';
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
		layers:["regionsMask"],
	});
	//as long as we have something in the feature query 
	if (typeof feature[0] !== 'undefined'){
		return feature[0];
	} 
}

//returns the first country object
function getMapCountry(point){
	var feature = thisMap.queryRenderedFeatures(point, {
		layers:["countryMask"],
	});
	//as long as we have something in the feature query 
	if (typeof feature[0] !== 'undefined'){
		return feature[0];
	}
}

//returns a list of PA objects
function getMapPAs(point){
	var paFeatures = thisMap.queryRenderedFeatures(point, {
		layers:["wdpaAcpMask"]
	});
	if (typeof paFeatures[0] !== 'undefined'){
		return paFeatures;
	}
}