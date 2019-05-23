jQuery(document).ready(function($) {
	//alternative interesting events 'boxzoomend', 'zoomend', 'touchend'
	thisMap.on('click', getFeatureInfo);
	thisMap.on('mousemove', "regionsFill", function (e) {
		regionHover = null;
 		if (e.features.length > 0) {
			regionHover = e.features[0].properties.Group;
			$('#map-region-info').text("Region: "+ e.features[0].properties.Name);
			if(e.features[0].properties.Group == selSettings.regionID){
				thisMap.setLayoutProperty("regionHover", 'visibility', 'none');
			} else {
				thisMap.setFilter('regionHover', ['==', 'Group', e.features[0].properties.Group]);		
				thisMap.setLayoutProperty("regionHover", 'visibility', 'visible');						
			}
        } 
	});
	thisMap.on("mouseleave", "regionsFill", function() {
		regionHover = null;
		$('#map-region-info').empty();
        thisMap.setLayoutProperty("regionHover", 'visibility', 'none');
    });
	thisMap.on('mousemove', "countryFill", function (e) {
		countryHover2 = null;
		countryHover3 = null;
		countryHoverNum = null;
 		if (e.features.length > 0) {
			countryHover2 = e.features[0].properties.iso2;
			countryHover3 = e.features[0].properties.iso3;
			countryHoverNum = e.features[0].properties.un_m49;
			$('#map-country-info').text("Country: "+ e.features[0].properties.original_n);
			if(e.features[0].properties.iso2 == selSettings.ISO2){
				thisMap.setLayoutProperty("countryHover", 'visibility', 'none');
			} else {
				thisMap.setFilter('countryHover', ['==', 'iso3', e.features[0].properties.iso3]);		
				thisMap.setLayoutProperty("countryHover", 'visibility', 'visible');						
			}
        } 
	});
	thisMap.on("mouseleave", "countryFill", function() {
		countryHover2 = null;
		countryHover3 = null;
		countryHoverNum = null;
		$('#map-country-info').empty();
        thisMap.setLayoutProperty("countryHover", 'visibility', 'none');
    });
	thisMap.on('mousemove', "wdpaAcpFillHighlighted", function (e) {
		wdpaAcpHover = [];
		paText = 'Protected Area: '
 		if (e.features.length > 0) {
			for (var key in e.features) {
				if(!wdpaAcpHover.includes(e.features[key].properties.WDPAID)){
					wdpaAcpHover.push(e.features[key].properties.WDPAID);
				}
				//print the 
				paText = paText + e.features[key].properties.NAME + '<br> ';
				
				//check if the currently selected PA in in the array if it's found, remove it (so we are not going to highlight the currently selected PA on hover)
				var filteredAry = wdpaAcpHover.filter(e => e !== selSettings.WDPAID)
				
				//if we are hovering over a PA in an unselected country, do nothing...
				if(e.features[key].properties.ISO3 !== selSettings.ISO3){
					thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'none');
				} else {
					thisMap.setFilter("wdpaAcpHover", buildFilter(filteredAry, 'in', 'WDPAID'));	
					thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'visible');					
				}
			}
			//print the names of the PAs
			$('#map-pa-info').html(paText);
        } 
	});
	thisMap.on("mouseleave", "wdpaAcpFillHighlighted", function() {
		wdpaAcpHover = [];
		$('#map-pa-info').empty();
        thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'none');
    });
  
	function getFeatureInfo(e){
		regionCheck(e);
		countryCheck(e);
		paCheck(e);
	}
	function regionCheck(e){
		var region = getMapRegion(e.point);
		if (typeof region !== 'undefined') {
			if (selSettings.regionID != region.properties.Group){
				selSettings.regionID = region.properties.Group;
				updateRegion();
			}
		} 
	}
	function countryCheck(e){
		var country = getMapCountry(e.point);
		if (typeof country !== 'undefined') {
			if (selSettings.ISO2 != country.properties.iso2){
				selSettings.ISO2 = country.properties.iso2;
				updateCountry();
			}
		}
	}
	function paCheck(e){
		var PAs = getMapPAs(e.point);
		if (typeof PAs !== 'undefined') {
			if (PAs.length == 1){
				selSettings.paName = PAs[0].properties.NAME;
				selSettings.WDPAID = PAs[0].properties.WDPAID;
				updatePa();
			} else {
				var paLinks = "";
				for (var key in PAs) {
				  var sel = '';
				  if (PAs[key].properties.WDPAID == selSettings.WDPAID){
					  sel = "checked='Checked'";
				  }
				  paLinks = paLinks + 
				  "<div class='card'>" + 
					"<div class='card-header'>" +
						"<div class='pop-pa-name'>" + PAs[key].properties.NAME + "</div>" +
						"<div class='pop-pa-iucn'>(IUCN Cat: " + PAs[key].properties.IUCN_CAT + ")</div>"+
					"</div>" +
					"<div class='card-body pop-pa-wrapper'>"+
						"<span class='col-sm-9 pa-select'>Select this PA</span><input "+sel+" class='col-sm-1 form-control' type='checkbox'/>" +
						"<div class='pop-paid hidden'>" + PAs[key].properties.WDPAID + "</div>" +
					"</div>" +
				  "</div>";
				}
				paPopupContent = "<div class='pop-wrapper'>" +
				"<div class='pop-country'>" + selSettings.countryName + "</div>" +
				paLinks +
				"</div>";
				new mapboxgl.Popup()
					.setLngLat(e.lngLat)
					.setHTML(paPopupContent)
					.addTo(thisMap);	
			}		
		}
	}
	$('div#map-container').on('click', '.pop-pa-wrapper', function(e) {
	  var popWDPAID = parseInt($(this).closest(".card").find(".pop-paid").text().trim(), 10);
	  var popWDPAname = $(this).closest(".card").find(".pop-pa-name").text().trim();
	  $(".pop-wrapper .form-control").removeAttr('Checked'); 
	  $(this).closest(".card").find(".form-control").attr('Checked','Checked'); 
	  
	  if (selSettings.paName !== popWDPAname){
        selSettings.paName = popWDPAname;
		selSettings.WDPAID = popWDPAID;
        paChanged = 1;
		zoomToPA(selSettings.WDPAID);
      }
	});
	$('div#map-container').on('mouseenter', '.card', function(e) {
		var popWDPAID = parseInt($(this).find(".pop-paid").text().trim(), 10);
		thisMap.setFilter('wdpaAcpHover', ['==', 'WDPAID', popWDPAID]);
		thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'visible');
	});
	$('div#map-container').on('mouseleave', '.card', function(e) {
		if (selSettings.WDPAID > 0){
			thisMap.setFilter('wdpaAcpHover', ['==', 'WDPAID', selSettings.WDPAID]);
		} else {
			thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'none');
		}
	});
	$('div#map-container').on('click', 'button.pop-pa-summary-link', function(e) {
	  var popWDPAID = parseInt($(this).closest(".card").find(".pop-paid").text().trim(), 10);
	  var popWDPAname = $(this).closest(".card").find(".pop-pa-name").text().trim();
	  $(".pop-wrapper .form-control").removeAttr('Checked'); 
	  $(this).closest(".card").find(".form-control").attr('Checked','Checked'); 
	  if (selSettings.paName !== popWDPAname){
        selSettings.paName = popWDPAname;
		selSettings.WDPAID = popWDPAID;
		paChanged = 1;
		zoomToPA(selSettings.WDPAID);
      }
 	  var paURL = '/pa/'+selSettings.WDPAID;
	  var restURL = DOPAgetWdpaExtent+selSettings.WDPAID;
	  var modalTitle = 'Protected Area summary for ' + selSettings.paName;
	  buildModalWithMap(paURL, restURL, modalTitle);
	});
	
});

//returns the first country object
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

var homepageMapZoomOptions = {
	padding: {top: 100, bottom:10, left: 350, right: 10}
};

function zoomToRegion(region){
  if(region === 'Central Africa'){
	  //-20.917969,-21.779905,34.277344,28.149503
	  //<bounding><westbc>1.8683898449</westbc><eastbc>36.1896789074</eastbc><northbc>24.8886363352</northbc><southbc>-16.0012446593</southbc></bounding>
    thisMap.fitBounds([[1.8683898449,24.8886363352], [36.1896789074,-16.0012446593]], homepageMapZoomOptions);
  } else if (region === 'Eastern Africa'){
	  //5.976563,-35.960223,53.789062,18.729502
	  //<bounding><westbc>20.3034484386</westbc><eastbc>54.6247375011</eastbc><northbc>26.6692628716</northbc><southbc>-14.0916051203</southbc></bounding>
    thisMap.fitBounds([[20.3034484386,26.6692628716], [54.6247375011,-14.0916051203]], homepageMapZoomOptions);
  } else if (region === 'Western Africa'){
	  //5.976563,-35.960223,53.789062,18.729502
	//  -30.52,0.35,18.08,32.1
    thisMap.fitBounds([[-28.1462585926,31.1678846111], [20.4572570324,-0.7446243056]], homepageMapZoomOptions);
  } else if (region === 'Southern Africa'){
	  //<bounding><westbc>6.5265929699</westbc><eastbc>61.0187804699</eastbc><northbc>-5.3073515284</northbc><southbc>-47.2924889494</southbc></bounding>
	  //123.750000,-24.846565,216.914063,18.312811
    thisMap.fitBounds([[6.5265929699,-5.3073515284], [61.0187804699,-47.2924889494]], homepageMapZoomOptions);
  } else if (region === 'Pacific'){
	  //123.750000,-24.846565,216.914063,18.312811
    thisMap.fitBounds([[123.75,-24.846565], [216.914063,18.312811]], homepageMapZoomOptions);
  } else if (region === 'Caribbean') {
	  //-93.691406,-1.581830,-51.240234,28.844674
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