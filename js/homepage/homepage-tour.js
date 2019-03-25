// Instance the tour
var mapTour = new Tour({
	orphan: true,
	steps: [
	  {
		orphan: true,
		element: "",
		title: "How does the map work?",
		content: "During this tour selections will be made in the map to guide you through it."
	  },{
		orphan: true,
		element: "",
		title: "The Interactive Map",
		content: "The map has 3 layers. Regions, Countries and Protected Areas. You can click the <b>highlighted</b> areas in the map to explore the layers. Click next to see a region. Warning, this will remove any selections you have made in the map.",
		onShow: blockMapTour,
	  },{
		title: "Region",
		element: "#bread-parent-region",
		placement: "right",
		content: "Eastern and Southern Africa has been selected. You can also click to see additional summary information about the selected region here. <b>This also includes a link to go to the region page.</b> Click next to go to view a country in this region. ",
		onShow: regionTour,
	  },{
		title: "Country",
		element: "#bread-parent-country",
		placement: "right",
		content: "Botswana has been selected. As with the region, you can find out more about this country here. This also includes a link to go to the <b>country page</b>. Click next to go to view a <b>Protected Area</b> in this country. ",
		onShow: countryTour,
	  },{
		title: "Protected Area",
		element: "#bread-parent-pa",
		placement: "right",
		content: "Chobe has been selected. As with the region and country, you can find out more about this protected area here. This also includes a link to go to the <b>protected area page</b>",
		onShow: paTour,
	  },{
		element: ".mapboxgl-ctrl-top-right",
		title: "Map controls",
		content: "These are the controls for the map. You can hover your mouse over each one to find out what they do.",
		placement: "left"
	  },{
		element: ".mapboxgl-ctrl-bottom-right",
		title: "Map Source",
		content: "This is to see the source for the layers visible in the map. Hover your mouse over the <i class='fas fa-info-circle'></i> to see the source.",
		placement: "left"
	  },{
		element: ".mapboxgl-ctrl-bottom-left",
		title: "Map Scale",
		content: "This is the current scale of the map.",
		placement: "right"
	  },{
		orphan: true,
		title: "That's it!",
		content: "Now that you have the basics, you can try interacting with the map yourself.",
	  }
	],
	onStart: blockMapTour,
	onEnd: unblockMapTour,
});

var menuTour = new Tour({
	orphan: true,
	steps: [
	  {
		backdrop: true,
		element: "#block-mapmenuscope",
		title: "How does the menu work?",
		content: "During this tour selections will be made in the menu to guide you through what can be found.",
		placement: "right"
	  },{
		element: ".menu-scope-list",
		title: "Pressure State Response",
		backdrop: true,
		content: "The menu is divided into 3 main sections. These sections can contain indicators that relate to what has been selected in the map. The fourth option is the list icon: <i class='fas fa-list-ul'></i> Which displays ALL indicators in a searchable list.",
		placement: "right"
	  },{
		title: "State",
		element: ".ui-tabs-tab.ui-tab:nth-child(1)",
		placement: "right",
		content: "State info",
		onShow: triggerState,
	  },{
		title: "Pressure",
		element: ".ui-tabs-tab.ui-tab:nth-child(2)",
		placement: "right",
		content: "Pressure Info",
	  },{
		title: "Response",
		element: ".ui-tabs-tab.ui-tab:nth-child(3)",
		placement: "right",
		content: "Response Info",
	  },{
		element: ".mapboxgl-ctrl-top-right",
		title: "Map controls",
		content: "These are the controls for the map. You can hover your mouse over each one to find out what they do.",
		placement: "left"
	  },{
		element: ".mapboxgl-ctrl-bottom-right",
		title: "Map Source",
		content: "This is to see the source for the layers visible in the map. Hover your mouse over the <i class='fas fa-info-circle'></i> to see the source.",
		placement: "left"
	  },{
		element: ".mapboxgl-ctrl-bottom-left",
		title: "Map Scale",
		content: "This is the current scale of the map.",
		placement: "right"
	  },{
		orphan: true,
		title: "That's it!",
		content: "Now that you have the basics, you can try interacting with the map yourself.",
	  }
	],
	onStart: blockMenuTour,
	onEnd: unblockMenuTour,
});

function blockMapTour () {
	jQuery("#block-mapmenuscope, #block-mainnavigation").addClass("tour-backdrop");
	jQuery("#map-container").addClass("block-for-tour");
}

function blockMenuTour () {
	jQuery("#block-mainnavigation").addClass("tour-backdrop");
	jQuery("#map-container").addClass("block-for-tour");
}

function unblockMapTour () {
	jQuery("#block-mapmenuscope, #block-mainnavigation").removeClass("tour-backdrop");
	jQuery("#map-container").removeClass("block-for-tour");
	jQuery('div.biopama-tour').removeClass( "tour-active" );
}

function unblockMenuTour () {
	jQuery("#block-mainnavigation").removeClass("tour-backdrop");
	jQuery("#map-container").removeClass("block-for-tour");
	jQuery('div.biopama-tour').removeClass( "tour-active" );
}

function regionTour () {
	//remove all selected items in the map (the region removal concatonates down to all levels)
	removeRegion();
	selSettings.regionID = "ES_Africa";
	updateRegion("ES_Africa");
	zoomToRegion("ES_Africa");
}

function countryTour () {
	selSettings.ISO2 = "BW";
	updateCountry();
	zoomToCountry("BW");
}

function paTour () {
	selSettings.paName = "Central Kalahari";
	selSettings.WDPAID = 7510;
	zoomToPA(7510)
	updatePa();
}

function triggerState () {
	return;
}

jQuery(document).ready(function($) {
	$('.tour-toggle-trigger').change(function() {
		if ($(this).prop('checked')) {
			showTours();
		} else {
			hideTours();
		}
    })
	$('#map-tourtip').bind("click", function(){
		if ($( "#map-tourtip" ).hasClass( "tour-active" )) {
			$('#map-tourtip').removeClass( "tour-active" );
			mapTour.end()
		} else {
			$('#map-tourtip').addClass( "tour-active" );
			mapTour.init();
			mapTour.restart();
		}
	});
	
	$('#menu-tourtip').bind("click", function(){
		if ($( "#menu-tourtip" ).hasClass( "tour-active" )) {
			$('#menu-tourtip').removeClass( "tour-active" );
			menuTour.end()
		} else {
			$('#menu-tourtip').addClass( "tour-active" );
			menuTour.init();
			menuTour.restart();
		}
	});
	
	var tourCheck = jQuery.jStorage.get("toursToggle", "show");
	if (tourCheck == "hide"){
		hideTours();
		$('.tour-toggle-trigger').bootstrapToggle('off')
	} else {
		showTours();
		$('.tour-toggle-trigger').bootstrapToggle('on')
	}
});

function hideTours(){
	jQuery.jStorage.set("toursToggle", "hide");
	jQuery( "div.biopama-tour" ).hide( "fast" );
	jQuery('.tour-label').addClass( "tour-label-off" );
}

function showTours(){
	jQuery.jStorage.set("toursToggle", "show");
	jQuery( "div.biopama-tour" ).show( "fast" );
	jQuery('.tour-label').removeClass( "tour-label-off" );
}
