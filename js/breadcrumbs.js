var breadColor = "#90c14f";

jQuery(document).ready(function($) {
	$( ".region-we-mega-menu" ).ready(function() {
		$('.region-we-mega-menu').show();
	});
	$( "#block-mainnavigation" ).ready(function() {
		var menu = $('div.bread-menu-content');
		$('.bread-menu-icon').on('click', function() {
			//$(this).closest("div.bread-parent-wrapper").next().show();
			$(this).addClass("active-bread");
		});
		
		$(document).mouseup(function (e) {
			if ((!menu.is(e.target)) && (menu.has(e.target).length === 0)) {
				menu.hide();
				$(".active-bread").removeClass('active-bread');
			}
			if ((!$('#bread-content-wrapper').is(e.target)) && ($('#bread-content-wrapper').has(e.target).length === 0)) {
				$('#bread-content-wrapper').empty().hide();
			}
			if ((!$('.search-wrapper').is(e.target)) && ($('.search-wrapper').has(e.target).length === 0) && (!$('#bread-search-results-wrapper').is(e.target)) && ($('#bread-search-results-wrapper').has(e.target).length === 0)) {
				if ($(".search-text-wrapper:visible").length){
					$('#bread-search-results-wrapper').hide("fast");
				}
			}
		});
		
		$('.search-wrapper').on('click', function() {
			if (!$(".search-text-wrapper:visible").length){
				$('#bread-search-results-wrapper').show("fast");
				$( ".search-text" ).focus();
			}
		});
		$('.bread-trail-region').on('click', function(e) {
			if (!$(e.target).hasClass('fa-times')){
				$(this).find(".bread-menu-icon").addClass("active-bread");
				if(selSettings.regionID !== null){
					var regionURL = '/region/'+selSettings.regionID +'/summary';
					regionURL = regionURL.toLowerCase();
					new Promise(function(resolve, reject) {
					  buildBreadcrumbCard(regionURL);
					}).then(poulateRegionCard());
				} else {
					$('<div>No Region Selected.</div>').appendTo('#bread-content-wrapper');
				}				
			}
		});
		$('.bread-trail-country').on('click', function(e) {
			if (!$(e.target).hasClass('fa-times')){
				$(this).find(".bread-menu-icon").addClass("active-bread");
				if(selSettings.ISO2 !== null){
					var countryURL = '/breadcrumb-country-summary/'+selSettings.ISO2;
					countryURL = countryURL.toLowerCase();
					new Promise(function(resolve, reject) {
					  buildBreadcrumbCard(countryURL);
					}).then(poulateCountryCard());
				} else {
					$('<div>No Country Selected.</div>').appendTo('#bread-content-wrapper');
				}
			}
		});
		$('.bread-trail-pa').on('click', function(e) {
			if (!$(e.target).hasClass('fa-times')){
				$(this).find(".bread-menu-icon").addClass("active-bread");
				if(selSettings.WDPAID !== null){
					var paURL = '/breadcrumb-pa-summary/'+selSettings.WDPAID;
					paURL = paURL.toLowerCase();
					new Promise(function(resolve, reject) {
					  buildBreadcrumbCard(paURL);
					}).then(poulatePaCard());
					
					;
				} else {
					$('<div>No Protected Area Selected.</div>').appendTo('#bread-content-wrapper');
				}
			}
		});
	});
	
	Drupal.behaviors.indicatorSearch = {
		attach: function (context, settings) {
			//attach the function that opens the indicator
			$("article.indicator-search-item", context).on('click', function(e) {
				//I remove any deault activities just in case. FAC has event handlers attaced still, even thought they shoulnd't do anything without links <a> (removed above). 
				e.preventDefault();
				var nodeID = e.currentTarget.attributes[0].nodeValue; 
				var indicatorURL = '/node/'+nodeID;
				Drupal.ajax({
				  url: indicatorURL,
				  success: function(response) {			
					var $dataContents
					for (var key in response) {
						if (!response.hasOwnProperty(key)) continue;
						var obj = response[key];
						for (var prop in obj) {
							if(!obj.hasOwnProperty(prop)) continue;
							if(prop == "data"){
								$dataContents = $('<div>' + response[key].data + '</div>').appendTo('body');
							}
						}
					}
					$('#block-indicatorcard').show().empty();
					$dataContents.appendTo('#block-indicatorcard');
				  }
				}).execute();

			});	
			$("article.country-search-item", context).on('click', function(e) {
				e.preventDefault();
				var iso2 = $("div.country-iso", e.currentTarget).text().trim();
				selSettings.ISO2 = iso2;
				countryChanged = 1;
				zoomToCountry(iso2);
			});	
			$("article.pa-search-item", context).on('click', function(e) {
				e.preventDefault();
				var wdpaid = parseInt($("div.pop-pa-wdpaid", e.currentTarget).text().trim(), 10);
				if (selSettings.WDPAID != wdpaid){
					selSettings.WDPAID = wdpaid;
					paChanged = 1;
					zoomToPA(wdpaid);
				}
			});	
		}
	};
});

function buildBreadcrumbCard(URL){
	Drupal.ajax({ 
	  url: URL,
	  success: function(response) {		
		var $cardContents
		for (var key in response) {
			if (!response.hasOwnProperty(key)) continue;
			var obj = response[key];
			for (var prop in obj) {
				if(!obj.hasOwnProperty(prop)) continue;
				if(prop == "data"){
					$cardContents = jQuery('<div>' + response[key].data + '</div>');
				}
			}
		}
		jQuery('#bread-content-wrapper').empty().show();
		$cardContents.appendTo('#bread-content-wrapper');
		jQuery('<div class="closeSummaryCard"><i class="fas fa-times"></i></div>').appendTo('#bread-content-wrapper');
		jQuery( "div.closeSummaryCard" ).click(function(e) {
			jQuery('#bread-content-wrapper').empty().hide();
		});
	  }
	}).execute();	
}

function updateBreadCountry(){
	if (!jQuery(".bread-trail-region:visible").length)jQuery(".bread-trail-region").toggle( "slide" );
	if (!jQuery(".bread-trail-country:visible").length)jQuery(".bread-trail-country").toggle( "slide" );
	//if we are currently in the country tab, refresh the results
	if (jQuery(".indi-tab-national.ui-state-active:visible").length) {
		console.log(selSettings.ISO3);
		getRestResults();
	} else if ((jQuery(".indi-tab-national:visible").length) && (!jQuery(".indi-tab-national").hasClass("disable-scope"))){
		console.log(selSettings.ISO3);
		updateCardTab();
	}
	
	//country selected message
// 	jQuery('#bread-content-wrapper').empty().show();
// 	jQuery('<div><div class="bread-note-country-arrow"><i class="fas fa-arrow-up"></i></div><div class="bread-note-country-note">Click here to see more info for <b>'+ selSettings.countryName +'</b></div></div>').appendTo('#bread-content-wrapper');
// 	jQuery('#bread-content-wrapper').delay( 4000 ).fadeOut("slow");
    jQuery('#bread-note-wrapper').remove();
    jQuery('<div id="bread-note-wrapper"><div class="bread-note--arrow"><i class="fas fa-2x fa-arrow-circle-up"></i></div><div class="bread-note-pa-note">Click here to see more info for <hr></hr><b>'+ selSettings.countryName +'</b></div></div>')
    .appendTo('#bread-parent-country');
	jQuery('#bread-note-wrapper').delay( 5000 ).fadeOut("slow");
  
	jQuery("#bread-country").text(selSettings.countryName).one().effect( "highlight", {color: breadColor}, 500);
	jQuery("#bread-country").append("<button type='button' class='breadClose' aria-label='Close' onclick='removeCountry()'><i class='fas fa-times'></i></button>");
}
function updateBreadRegion(){
	if (!jQuery(".bread-trail-region:visible").length)jQuery(".bread-trail-region").toggle( "slide" );
	//if we are currently in the region tab, refresh the results
	thisMap.setLayoutProperty("regionSelected", 'visibility', 'visible');
	thisMap.setFilter('regionSelected', ['==', 'Group', selSettings.regionName]);
	if (jQuery(".indi-tab-regional.ui-state-active:visible").length) {
		getRestResults();
	} else if ((jQuery(".indi-tab-regional:visible").length) && (!jQuery(".indi-tab-regional").hasClass("disable-scope"))){
		updateCardTab();
	}
// 	jQuery('#bread-content-wrapper').empty().show();
// 	jQuery('<div><div class="bread-note-region-arrow"><i class="fas fa-arrow-up"></i></div><div class="bread-note-region-note">Click here to see more info for <b>'+ selSettings.regionName +'</b></div></div>').appendTo('#bread-content-wrapper');
// 	jQuery('#bread-content-wrapper').delay( 4000 ).fadeOut("slow");
    jQuery('#bread-note-wrapper').remove();
    jQuery('<div id="bread-note-wrapper"><div class="bread-note--arrow"><i class="fas fa-2x fa-arrow-circle-up"></i></div><div class="bread-note-pa-note">Click here to see more info for <hr></hr><b>'+ selSettings.regionName +'</b></div></div>')
    .appendTo('#bread-parent-region');
	jQuery('#bread-note-wrapper').delay( 5000 ).fadeOut("slow");
	
	jQuery("#bread-region").text(selSettings.regionName).one().effect( "highlight", {color: breadColor}, 500);
	jQuery("#bread-region").append("<button type='button' class='breadClose' aria-label='Close' onclick='removeRegion()'><i class='fas fa-times'></i></button>");
	jQuery(".bread-region-menu.bread-menu-icon").show();
	jQuery('.mapboxgl-ctrl-z-region').show();
}
function updateBreadPA(){
	if (!jQuery(".bread-trail-pa:visible").length)jQuery(".bread-trail-pa").toggle( "slide" );
	if (jQuery("#focus_details_right .view-breadcrumb-protected-area-summary:visible").length) updatePaInfo();
	//if we are currently in the pa tab, refresh the results
	if (jQuery(".indi-tab-local.ui-state-active:visible").length) {
		getRestResults();
	//if we are not in the tab and it's not turned off, switch to it.
	} else if ((jQuery(".indi-tab-local:visible").length) && (!jQuery(".indi-tab-local").hasClass("disable-scope"))){
		updateCardTab();
	}
//	jQuery('#bread-content-wrapper').empty().show();
	jQuery('#bread-note-wrapper').remove();
    jQuery('<div id="bread-note-wrapper"><div class="bread-note--arrow"><i class="fas fa-2x fa-arrow-circle-up"></i></div><div class="bread-note-pa-note">Click here to see more info for <hr></hr><b>'+ selSettings.paName +'</b></div></div>')
    .appendTo('#bread-parent-pa');
	jQuery('#bread-note-wrapper').delay( 5000 ).fadeOut("slow");
	
	jQuery('.mapboxgl-ctrl-z-pa').show();
	jQuery("#bread-pa").text(selSettings.paName).one().effect( "highlight", {color: breadColor}, 500);
	jQuery("#bread-pa").append("<button type='button' class='breadClose' aria-label='Close' onclick='removePA()'><i class='fas fa-times'></i></button>");
	jQuery(".bread-pa-menu-content ul.nav li:first").html("<div class='bread-menu-link'>Summary for "+selSettings.paName+"</div>");
	
}
function updateBreadIndicator(indicatorName){
	if (!jQuery(".bread-trail-indicator:visible").length)jQuery(".bread-trail-indicator").toggle( "slide" );
	jQuery("#bread-indicator").text(indicatorName).one().effect( "highlight", {color: breadColor}, 500);
	jQuery("#bread-indicator").append("<button type='button' class='breadClose' aria-label='Close' onclick='closeIndicatorCard()'><i class='fas fa-times'></i></button>");
}

function removeCountry(){
	if (jQuery(".bread-trail-country:visible").length)jQuery(".bread-trail-country").toggle( "slide" );
	selSettings.countryName = 'trans-ACP';
	selSettings.ISO2 = null;
	selSettings.ISO3 = null;
	selSettings.NUM = null;
 	thisMap.setFilter('wdpaAcpFill', null);
/*	thisMap.setFilter('countryFill', null);
	thisMap.setLayoutProperty("wdpaAcpFill", 'visibility', 'visible');
	thisMap.setLayoutProperty("countryFill", 'visibility', 'visible'); */
	highlightMapFeature();
	if (jQuery("#block-indicatorcard article:visible").length) updateCardTab();
	jQuery("#bread-country").text("NA").one().effect( "highlight", {color: breadColor}, 500);
	jQuery('.mapboxgl-ctrl-z-country').hide();
	thisMap.setFilter("wdpaAcpPolyLabels", ["in", "Point", 0]);
	thisMap.setFilter("wdpaAcpPointLabels", ["in", "Point", 1]);
	thisMap.setLayoutProperty("countrySelected", 'visibility', 'none');
	thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'none');
	if (selSettings.paName !== 'default'){
		removePA();
	} else {
		updateAddress();
	}
}

function removeRegion(){
	if (jQuery(".bread-trail-region:visible").length)jQuery(".bread-trail-region").toggle( "slide" );
	selSettings.regionID = null;
	selSettings.regionName = null;
	highlightMapFeature();
	thisMap.setFilter('wdpaAcpFill', null);
	thisMap.setFilter('countryFill', null);
	thisMap.setFilter('regionsFill', null);
	thisMap.setLayoutProperty("regionsFill", 'visibility', 'visible');
	if (jQuery("#block-indicatorcard article:visible").length) updateCardTab();
	jQuery("#bread-region").text("NA").one().effect( "highlight", {color: breadColor}, 500);
	jQuery('.mapboxgl-ctrl-z-region').hide();
	if (selSettings.ISO2 !== null){
		removeCountry();
	} else {
		updateAddress();
	}
	jQuery(".bread-region-menu.bread-menu-icon").hide();
	
	thisMap.setLayoutProperty("countryFill", 'visibility', 'none');
	thisMap.setLayoutProperty("regionSelected", 'visibility', 'none');
}

function removePA(){
	if (jQuery(".bread-trail-pa:visible").length)jQuery(".bread-trail-pa").toggle( "slide" );
	selSettings.paName = 'default';
	selSettings.WDPAID = 0;
	if (jQuery("#block-indicatorcard article:visible").length) updateCardTab();
	//this clears the PA from the chart if a chart is visible
	highlightMapFeature();
	jQuery('.mapboxgl-ctrl-z-pa').hide();
	jQuery("#bread-pa").text("NA").one().effect( "highlight", {color: breadColor}, 500);
	thisMap.setLayoutProperty("wdpaAcpSelected", 'visibility', 'none');
	updateAddress();
	//disable the indicator card tab.. if there is no tab nothing will happen
}

function removeIndicator(){
	if (jQuery(".bread-trail-indicator:visible").length)jQuery(".bread-trail-indicator").toggle( "slide" );
	closeIndicatorCard();
}