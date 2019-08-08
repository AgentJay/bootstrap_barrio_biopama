jQuery(document).ready(function($) {
	var closePopupIcon = undefined;
	//alternative interesting events 'boxzoomend', 'zoomend', 'touchend'
	thisMap.on('click', getFeatureInfo);
	thisMap.on('mousemove', "regionsMask", function (e) {
		regionHover = null;
 		if (e.features.length > 0) {
			regionHover = e.features[0].properties.Group;
			$('#map-region-info').text("Region: "+ e.features[0].properties.Group);
			if(e.features[0].properties.Group == selSettings.regionID){
				thisMap.setLayoutProperty("regionHover", 'visibility', 'none');
			} else {
				thisMap.setFilter('regionHover', ['==', 'Group', e.features[0].properties.Group]);		
				thisMap.setLayoutProperty("regionHover", 'visibility', 'visible');						
			}
        } 
	});
	thisMap.on("mouseleave", "regionsMask", function() {
		regionHover = null;
		$('#map-region-info').empty();
        thisMap.setLayoutProperty("regionHover", 'visibility', 'none');
    });
	thisMap.on('mousemove', "countryMask", function (e) {
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
	thisMap.on("mouseleave", "countryMask", function() {
		$('#map-country-info').empty();
        thisMap.setLayoutProperty("countryHover", 'visibility', 'none');
    });
	thisMap.on('mousemove', "wdpaAcpMask", function (e) {
		pasCurrentlyHovered = [];
		paText = 'Protected Area: '
 		if (e.features.length > 0) {
			for (var key in e.features) {
				if(!pasCurrentlyHovered.includes(e.features[key].properties.WDPAID)){
					pasCurrentlyHovered.push(e.features[key].properties.WDPAID);
				}
				//print the 
				paText = paText + e.features[key].properties.NAME + '<br> ';
				
				//check if the currently selected PA in in the array if it's found, remove it (so we are not going to highlight the currently selected PA on hover)
				var filteredAry = pasCurrentlyHovered.filter(e => e !== selSettings.WDPAID)
				thisMap.setFilter("wdpaAcpHover", buildFilter(filteredAry, 'in', 'WDPAID'));	
				thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'visible');					

			}
			//print the names of the PAs
			$('#map-pa-info').html(paText);
        } 
	});
	thisMap.on("mouseleave", "wdpaAcpMask", function() {
		pasCurrentlyHovered = [];
		$('#map-pa-info').empty();
        thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'none');
    });
	
	var popUpContents = {};
  
	function getFeatureInfo(e){
		popUpContents = {
			region: '',
			regionID: '',
			country: '',
			countryCode: '',
			country3Code: '',
			PAs: [],
			WDPAIDs: [],
			paIUCNCats: [],
			paSize: [],
		};
		new Promise(function(resolve, reject) {
		  regionCheck(e)
		}).then(countryCheck(e))
		.then(paCheck(e))
		.then(makePopUp(e));
	}
	
	function makePopUp(e){
		if (popUpContents.regionID.length){
			var areaCheck = "areaInactive";
			if (selSettings.regionName == popUpContents.region)areaCheck = "areaActive";
			var popup = popUpSection(areaCheck, popUpContents.region, popUpContents.regionID, "region");
			var regionPopup = new mapboxgl.Popup({anchor:'right', className: 'biopamaPopup', offset: 50, closeButton: false})
				.setLngLat(e.lngLat)
				.setHTML(popup)
				.addTo(thisMap);
		} 
		
		if (popUpContents.countryCode.length){
			var areaCheck = "areaInactive";
			if (selSettings.ISO2 == popUpContents.countryCode)areaCheck = "areaActive";
			var popup = popUpSection(areaCheck, popUpContents.country, popUpContents.countryCode, "country");
			var countryPopup = new mapboxgl.Popup({anchor:'bottom', className: 'biopamaPopup', offset: 50, closeButton: false})
				.setLngLat(e.lngLat)
				.setHTML(popup)
				.addTo(thisMap);
		} 

		var numberOfPas = "singlePA";
		var paPopupContent = '';
		if (popUpContents.PAs.length){
			if (popUpContents.PAs.length == 1){
				checkPA(popUpContents.WDPAIDs[0], 0)
			} else {
				numberOfPas = "multiPAs"
				for (var key in popUpContents.PAs) {
					checkPA(popUpContents.WDPAIDs[key], key)
				}
			}
			var paPopup = new mapboxgl.Popup({anchor:'left', className: 'biopamaPopup '+numberOfPas, offset: 50, closeButton: false})
				.setLngLat(e.lngLat)
				.setHTML(paPopupContent)
				.addTo(thisMap);
		}
		function checkPA(paID, paKey){
			var areaCheck = "areaInactive";
			if (paID == selSettings.WDPAID)areaCheck = "areaActive";
			paPopupContent = paPopupContent + popUpSection(areaCheck, popUpContents.PAs[paKey], popUpContents.WDPAIDs[paKey], "pa");
		}
		
		// create a HTML element for the centre
		var el = document.createElement('div');
		el.className = 'mapCloseMarker';
		el.innerHTML = '<i class="fas fa-times"></i>';
		if (closePopupIcon !== undefined){
			closePopupIcon.remove();
		}
		
		closePopupIcon = new mapboxgl.Marker(el)
			.setLngLat(e.lngLat)
			.addTo(thisMap);	
			
		$( "a.cardGoTo" ).tooltip({
			trigger:"hover",
			html: true,
			placement: "top",
			title:"Open in a new window",
			container: 'body',
			delay: 100,
		});
		$( "div.cardSelect" ).tooltip({
			trigger:"hover",
			html: true,
			placement: "top",
			title:"Select this area",
			container: 'body',
			delay: 100,
		});
		$( "a.cardSummary" ).tooltip({
			trigger:"hover",
			html: true,
			placement: "top",
			title:"View Summary",
			container: 'body',
			delay: 100,
		});
		$( "div.mapCloseMarker" ).click(function(e) {
			e.stopPropagation();
			closeMapCards();
		});
		$('.cardTooltip').on('show.bs.tooltip', function () {
			$('.tooltip').remove();
		})
		$( "div.region div.cardSelect" ).click(function(e) {
			selSettings.regionName = popUpContents.region;
			selSettings.regionID = popUpContents.regionID;
			console.log(selSettings)
			updateRegion(selSettings.regionID);
			closeMapCards();
		});
		$( "div.country div.cardSelect" ).click(function(e) {
			selSettings.ISO2 = popUpContents.countryCode;
			selSettings.regionID = popUpContents.regionID;
			//if (selSettings.regionID !== popUpContents.regionID) regionChanged = 1;
			updateCountry();
			closeMapCards();
		});
		$( "div.pa div.cardSelect" ).click(function(e) {
			selSettings.WDPAID = $(this).attr('id');
			selSettings.paName = $(this).closest(".card").find(".area-subheading").text().trim();
			selSettings.ISO3 = popUpContents.country3Code;
			updatePa();
			closeMapCards();
		});
		$( "div.region a.cardSummary" ).click(function(e) {
			var regionURL = '/region/'+popUpContents.regionID +'/summary';
			regionURL = regionURL.toLowerCase();
			new Promise(function(resolve, reject) {
			  buildBreadcrumbCard(regionURL);
			}).then(poulateRegionCard());
		});
		$( "div.country a.cardSummary" ).click(function(e) {
			//e.stopPropagation();
			selSettings.ISO2 = popUpContents.countryCode;
			selSettings.ISO3 = popUpContents.country3Code;
			var countryURL = '/breadcrumb-country-summary/'+popUpContents.countryCode;
			countryURL = countryURL.toLowerCase();
			new Promise(function(resolve, reject) {
			  buildBreadcrumbCard(countryURL);
			}).then(poulateCountryCard());
		});
		$( "div.pa a.cardSummary" ).click(function(e) {
			var wdpaID = $(this).attr('id')
			selSettings.WDPAID = wdpaID;
			var paURL = '/breadcrumb-pa-summary/'+wdpaID;
			paURL = paURL.toLowerCase();
			new Promise(function(resolve, reject) {
			  buildBreadcrumbCard(paURL);
			}).then(poulatePaCard());
		});
		$( "div.card.region" ).hover(function(e) {
			thisMap.setFilter('regionHover', ['==', 'Group', popUpContents.region]);		
			thisMap.setLayoutProperty("regionHover", 'visibility', 'visible');	
		});
		$( "div.card.country" ).hover(function(e) {
			thisMap.setFilter('countryHover', ['==', 'iso3', popUpContents.country3Code]);		
			thisMap.setLayoutProperty("countryHover", 'visibility', 'visible');	
		});
		$( "div.card.pa" ).hover(function(e) {
			var wdpaID = parseInt($(this).attr('id'), 10);
			thisMap.setFilter('wdpaAcpHover', ['==', 'WDPAID', wdpaID]);		
			thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'visible');	
		});
		function closeMapCards(){
			if (countryPopup !== undefined){
				regionPopup.remove();
				countryPopup.remove();
			}
			if (paPopup !== undefined)paPopup.remove();
			closePopupIcon.remove();
			$('.tooltip').remove();
		}
		function popUpSection(activeStatus, cardTitle, spatialID, spatialScope){
			var tempCard = '<div class="card homepageMapCard '+ activeStatus +' ' + spatialScope + '" id="'+spatialID+'">'+
				'<div class="card-header card-header-'+ spatialScope +'">'+ spatialScope + '</div>'+
				'<div class="card-body homepageMapCardBody cardSelect" id="'+spatialID+'">'+
					'<div class="row">'+
						'<div class="col-12">'+
							'<h4 class="area-subheading">' + cardTitle + '</h4>'+
						'</div>'+
					'</div>'+
				'</div>'+
				'<div class="area-icons">'+
					'<a href="#" class="cardIcon cardTooltip cardSummary" id="'+spatialID+'"><i class="fas fa-info"></i></a>'+
					'<a href="/'+spatialScope+'/'+spatialID+'" class="cardIcon cardTooltip cardGoTo" target="_blank"><i class="fas fa-arrow-right"></i></a>'+
				'</div>'+
			'</div>';
			return tempCard;
		}
	}
	
	function regionCheck(e){
		var region = getMapRegion(e.point);
		//console.log(region);
		if (typeof region !== 'undefined') {
			popUpContents.region = region.properties.Group;
			switch(popUpContents.region) {
				case "Eastern Africa":
					popUpContents.regionID = "eastern_africa";
					//console.log(popUpContents.regionID);
					break;
				case "Central Africa":
					popUpContents.regionID = "central_africa";
					break;
				case "Western Africa":
					popUpContents.regionID = "western_africa";
					break;
				case "Southern Africa":
					popUpContents.regionID = "southern_africa";
					break;
				default:
					popUpContents.regionID = popUpContents.region;
					break;
				}
		} 
		return;
	}
	function countryCheck(e){
		var country = getMapCountry(e.point);
		if (typeof country !== 'undefined') {
			popUpContents.country = country.properties.name_iso31;
			popUpContents.countryCode = country.properties.iso2; //For the Country Page
			popUpContents.country3Code = country.properties.iso3; //For PA feature matching
		}
		return;
	}
/* 	function paCheck(e){
		var PAs = getMapPAs(e.point);
		if (typeof PAs !== 'undefined') {
			if (PAs.length == 1){	
				selSettings.paName = PAs[0].properties.NAME;
				selSettings.WDPAID = PAs[0].properties.WDPAID;
				//updatePa();
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
	} */
	function paCheck(e){
		var PAs = getMapPAs(e.point);
		if (typeof PAs !== 'undefined') {
			for (var key in PAs) {
				popUpContents.PAs.push(PAs[key].properties.NAME);
				popUpContents.WDPAIDs.push(PAs[key].properties.WDPAID);
				popUpContents.paIUCNCats.push(PAs[key].properties.IUCN_CAT);
				popUpContents.paSize.push(PAs[key].properties.GIS_AREA);
				if (PAs[key].properties.WDPAID == selSettings.WDPAID){
					
				}
			}		
		}
		return;
	}
});

//returns the first country object
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

var homepageMapZoomOptions = {
	padding: {top: 100, bottom:10, left: 350, right: 10}
};

function zoomToRegion(region){
  if(region === 'central_africa'){
	  //-20.917969,-21.779905,34.277344,28.149503
	  //<bounding><westbc>1.8683898449</westbc><eastbc>36.1896789074</eastbc><northbc>24.8886363352</northbc><southbc>-16.0012446593</southbc></bounding>
    thisMap.fitBounds([[1.8683898449,24.8886363352], [36.1896789074,-16.0012446593]], homepageMapZoomOptions);
  } else if (region === 'eastern_africa'){
	  //5.976563,-35.960223,53.789062,18.729502
	  //<bounding><westbc>20.3034484386</westbc><eastbc>54.6247375011</eastbc><northbc>26.6692628716</northbc><southbc>-14.0916051203</southbc></bounding>
    thisMap.fitBounds([[20.3034484386,26.6692628716], [54.6247375011,-14.0916051203]], homepageMapZoomOptions);
  } else if (region === 'western_africa'){
	  //5.976563,-35.960223,53.789062,18.729502
	//  -30.52,0.35,18.08,32.1
    thisMap.fitBounds([[-28.1462585926,31.1678846111], [20.4572570324,-0.7446243056]], homepageMapZoomOptions);
  } else if (region === 'southern_africa'){
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