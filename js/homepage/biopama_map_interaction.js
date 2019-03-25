
jQuery(document).ready(function($) {
	//alternative interesting events 'boxzoomend', 'zoomend', 'touchend'
	thisMap.on('click', getFeatureInfo);
	thisMap.on('mousemove', "regionsFill", function (e) {
 		if (e.features.length > 0) {
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
		$('#map-region-info').text("Region: NA");
        thisMap.setLayoutProperty("regionHover", 'visibility', 'none');
    });
	thisMap.on('mousemove', "countryFill", function (e) {
 		if (e.features.length > 0) {
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
		$('#map-country-info').text("Country: NA");
        thisMap.setLayoutProperty("countryHover", 'visibility', 'none');
    });
	thisMap.on('mousemove', "wdpaAcpFillHighlighted", function (e) {
		wdpaAcpHover = [];
		paText = 'Protected Area: '
 		if (e.features.length > 0) {
			for (var key in e.features) {
				if(! wdpaAcpHover.includes(e.features[key].properties.WDPAID)){
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
			if (jQuery("#indicator-chart-country:visible").length){
				highlightPA();
			}
			if (jQuery("#indicator-chart-pa:visible").length){
				//should we do something while the PA card is open and the user is hovering over other PA's?
			}
			//print the names of the PAs
			$('#map-pa-info').html(paText);
        } 
	});
	thisMap.on("mouseleave", "wdpaAcpFillHighlighted", function() {
		wdpaAcpHover = [];
		$('#map-pa-info').text("Protected Area: NA");
        thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'none');
		if (jQuery("#indicator-chart").length){
			highlightPA();
		}
    });
	thisMap.on('mousemove', "1nd1l4y3r", function (e) {
		wdpaAcpHover = [];
		paText = 'Protected Area: '
 		if (e.features.length > 0) {
			for (var key in e.features) {
				if(! wdpaAcpHover.includes(e.features[key].properties.WDPAID)){
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
			if (jQuery(".indicator-chart:visible").length){
				highlightPA();
			}
			//print the names of the PAs
			$('#map-pa-info').html(paText);
        } 
	});
	thisMap.on("mouseleave", "1nd1l4y3r", function() {
		wdpaAcpHover = [];
		$('#map-pa-info').text("Protected Area: NA");
        thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'none');
		if (jQuery(".indicator-chart:visible").length){
			highlightPA();
		}
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
				countryChanged = 1;
				checkCountryChanged();
			}
		}
	}
	function paCheck(e){
		var PAs = getMapPAs(e.point);
		if (typeof PAs !== 'undefined') {
			console.log("so far...")
			//console.log(PAs);
			var paLinks = "";
			for (var key in PAs) {
			  var sel = '';
			  if (PAs[key].properties.WDPA_PID == selSettings.WDPAID){
				  sel = "checked='Checked'";
			  }
			  paLinks = paLinks + 
			  "<div class='card'>" + 
				"<div class='card-header'>" +
					"<div class='pop-pa-name'>" + PAs[key].properties.NAME + "</div>" +
					"<div class='pop-pa-iucn'>(IUCN Cat: " + PAs[key].properties.IUCN_CAT + ")</div>"+
				"</div>" +
				"<div class='card-body pop-pa-wrapper'>"+
					"<button class='col-sm-2 btn btn-info pop-pa-summary-link'><i class='fas fa-info'></i></button><span class='col-sm-9 pa-select'>Select this PA</span><input "+sel+" class='col-sm-1 form-control' type='checkbox'/>" +
					"<div class='pop-paid hidden'>" + PAs[key].properties.WDPA_PID + "</div>" +
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
	$('div#map-container').on('click', '.pop-pa-wrapper', function(e) {
	  var popWDPAID = parseInt($(this).closest(".card").find(".pop-paid").text().trim(), 10);
	  var popWDPAname = $(this).closest(".card").find(".pop-pa-name").text().trim();
	  $(".pop-wrapper .form-control").removeAttr('Checked'); 
	  $(this).closest(".card").find(".form-control").attr('Checked','Checked'); 
	  
	  if (selSettings.paName !== popWDPAname){
        selSettings.paName = popWDPAname;
		selSettings.WDPAID = popWDPAID;
        paChanged();
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
		paChanged();
      }
 	  var paURL = '/pa/'+selSettings.WDPAID;
	  var restURL = DOPAgetWdpaExtent+selSettings.WDPAID;
	  var modalTitle = 'Protected Area summary for ' + selSettings.paName;
	  buildModalWithMap(paURL, restURL, modalTitle);
	});
	
});

function zoomToRegion(region){
  if(region === 'CW_Africa'){
	  //-20.917969,-21.779905,34.277344,28.149503
    thisMap.fitBounds([[-20.917969,-21.779905], [34.277344,28.149503]], {
        padding: {top: 100, bottom:10, left: 350, right: 10}
    });
  } else if (region === 'ES_Africa'){
	  //5.976563,-35.960223,53.789062,18.729502
    thisMap.fitBounds([[5.976563,-35.960223], [53.789062,18.729502]], {
        padding: {top: 100, bottom:10, left: 350, right: 10}
    });
  } else if (region === 'Pacific'){
	  //123.750000,-24.846565,216.914063,18.312811
    thisMap.fitBounds([[123.75,-24.846565], [216.914063,18.312811]], {
        padding: {top: 100, bottom:10, left: 350, right: 10}
    });
  } else if (region === 'Caribbean') {
	  //-93.691406,-1.581830,-51.240234,28.844674
	thisMap.fitBounds([[-93.691406,-1.581830], [-51.240234,28.844674]], {
        padding: {top: 100, bottom:10, left: 350, right: 10}
    });
  } else {
	  return;
  }
}

function zoomToCountry(iso2){
  var result;
  if(iso2 === 'FJ'){
    thisMap.fitBounds([[166.61,-26.39], [192.01,-9.62]], {
          padding: {top: 100, bottom:10, left: 350, right: 10}
        });
  } else if (iso2 === 'TV'){
    thisMap.fitBounds([[168.58,-13.60], [191.48,-3.88]], {
          padding: {top: 100, bottom:10, left: 350, right: 10}
        });
  } else if (iso2 === 'KI'){
    thisMap.fitBounds([[-201.57,-15.70], [-136.18,10.31]], {
          padding: {top: 100, bottom:10, left: 350, right: 10}
        });
  } else {
    jQuery.ajax({
      url: DOPAgetCountryExtent+iso2,
      dataType: 'json',
      success: function(d) {

        thisMap.fitBounds(jQuery.parseJSON(d.records[0].extent), {
          padding: {top: 100, bottom:10, left: 350, right: 10}
        });
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
        thisMap.fitBounds(jQuery.parseJSON(d.records[0].extent), {
			padding: {top: 100, bottom:10, left: 350, right: 10}
        });
		selSettings.paName = d.records[0].name;
		if (d.records[0].iso2 != selSettings.ISO2){
			selSettings.ISO2 = d.records[0].iso2;
			countryChanged = 1;
		}
		paChanged();
      },
      error: function() {
        console.log("Something is wrong with the REST servce for PA bounds")
      }
    });
}

function checkCountryChanged(mapValue = 'iso2') {
	if (countryChanged == 1){
		updateCountry(mapValue);
		//Now we paint all the Protected areas in the selected country based on their IUCN category
		zoomToCountry(selSettings.ISO2);
	}
}
function paChanged() {
	updateBreadPA();
	thisMap.setFilter('wdpaAcpSelected', ['==', 'WDPAID', selSettings.WDPAID]);
	thisMap.setLayoutProperty("wdpaAcpSelected", 'visibility', 'visible');
	thisMap.setPaintProperty('wdpaAcpSelected', 'line-width', 10);
	setTimeout(function(){
		thisMap.setPaintProperty('wdpaAcpSelected', 'line-width', 2);
	}, 300);
	//if there's a chart 
	if (jQuery("#indicator-chart-country:visible").length){
		highlightPA();
	}
}

function updateCountry(chartValue = 'iso2') {
	countryChanged = 0;
	//If we are moving to a new country the currently selected PA can't follow us there, so we remove it
	if(selSettings.WDPAID > 0){
		removePA();
	}
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
	var relatedFeatures = thisMap.querySourceFeatures("countrySource",{
		sourceLayer:mapCountryLayer,
		filter: ['==', chartValue, filter]
	});
	//console.log(relatedFeatures)
	//Here we update all of our global settings by getting them from the EEZ/Country layer
	selSettings.ISO2 = relatedFeatures[0].properties.iso2;
	selSettings.ISO3 = relatedFeatures[0].properties.iso3;
	selSettings.NUM = relatedFeatures[0].properties.un_m49;
	if (selSettings.regionID !== relatedFeatures[0].properties.Group){
		selSettings.regionID = relatedFeatures[0].properties.Group;
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
function updateRegion(region = selSettings.regionID) {
	if(selSettings.ISO2 != null){
		removeCountry();
	}
	selSettings.regionID = region;

	switch(selSettings.regionID) {
	case "ES_Africa":
		selSettings.regionName = "East/South Africa";
		break;
	case "CW_Africa":
		selSettings.regionName = "Central/West Africa";
		break;
	default:
		selSettings.regionName = selSettings.regionID;
		break;
	}
	thisMap.setFilter('countryFill', ['==', 'Group', region]);
	thisMap.setFilter('regionsFill', ['!=', 'Group', region]);
	//thisMap.setPaintProperty("regionsFill", "fill-opacity", ["match", ["get", "Group"], [region], 0, 0.6]);
	zoomToRegion(region);
	thisMap.setLayoutProperty("countryFill", 'visibility', 'visible');
	updateBreadRegion();
}
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