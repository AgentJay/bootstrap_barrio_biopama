var idOpen = 0;
function idEditor(){
	if (idOpen == 0){
		jQuery('.mapboxgl-ctrl.ajax-loader').toggle(true);
		idOpen = 1; 
		var center = thisMap.getCenter();
		var zoom = thisMap.getZoom();
		//	console.log(center.lng + "  " +  + "  " + zoom);
		var iFrameLink = '/id_demo/iD/#background=DigitalGlobe-Premium&disable_features=boundaries&map='+zoom+'/'+center.lat+'/'+center.lng;
		var ifrm = document.createElement('iframe');
		ifrm.setAttribute('id', 'iframe-container'); // assign an id
		var el = document.getElementById('map-container');
		el.parentNode.insertBefore(ifrm, el);
		var height = jQuery('.mapboxgl-canvas').outerHeight(true);
		var toolBarHeight = jQuery('#toolbar-bar').outerHeight(true);
		var adminTrayHeight = jQuery('#toolbar-item-administration-tray').outerHeight(true);
		var width = jQuery('.mapboxgl-canvas').outerWidth(true);
		jQuery('iframe#iframe-container').css('height', height);
		jQuery('iframe#iframe-container').css('width', width);
		jQuery('iframe#iframe-container').animate({left: 0},1000).queue(function() {
			jQuery('button#close-id-editor').toggle(true);
			jQuery( this ).dequeue();
		});
	
		jQuery( "#header" ).hide();

		ifrm.setAttribute('src', iFrameLink);
		//http://beta.biopama.org/id_demo/iD/#background=DigitalGlobe-Premium&disable_features=boundaries&map=16.05/-19.39773/23.04016
	} else {
		return;
	}	
}

function closeIdEditor(){
	if (idOpen == 1){
		jQuery('.mapboxgl-ctrl.ajax-loader').toggle(false);
		jQuery( "#iframe-container" ).hide( "fast", function() {
			var elem = document.querySelector('#iframe-container');
			elem.parentNode.removeChild(elem);
		});
		jQuery('button#close-id-editor').toggle(false);
		jQuery( "#header" ).show();
		idOpen = 0; 
	} else {
		return;
	}
}