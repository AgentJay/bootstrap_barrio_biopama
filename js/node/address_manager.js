jQuery(document).ready(function($) {
	//$.address.wrap(true);
	$.address.change(function(event) {
		// Check if we have any address set to allow us to go to respective content
		if(event.value !== '/'){
			var parts = event.value.split("/");
			//console.log(parts.length)
			switch(parts.length) {
				case 2:
					selSettings.regionID = parts[1];
					regionChanged = 1;
					zoomToRegion(selSettings.regionID, false);
					break;
				case 3:
					selSettings.ISO2 = parts[2];
					countryChanged = 1;
					zoomToCountry(selSettings.ISO2);
					break;
				case 4:
					selSettings.WDPAID = parseInt(parts[3]);
					paChanged = 1;
					zoomToPA(selSettings.WDPAID);
					break;
				default:
					console.log("Address error");
			}
		}
	});
	
});
//Here we update the URL (address) to allow deep linking
function updateAddress(){
	var currentPath = window.location.pathname;
	var pathParts = currentPath.split("/");
/* 	if (pathParts[1] == "pa"){
		window.history.pushState(selSettings.paName, selSettings.paName, '/pa/' + selSettings.WDPAID);
	} else if (pathParts[1] == "country"){
		window.history.pushState(selSettings.countryName, selSettings.countryName, '/country/' + selSettings.ISO2 + "?iso2=" + selSettings.ISO2);
		//jQuery.address.value("?iso2=" + selSettings.ISO2);  
		jQuery( ".view-breadcrumb-country-summary" ).trigger('RefreshView');
		console.log("country trigger")
	} else  if (pathParts[1] == "region"){
		window.history.pushState(selSettings.regionName, selSettings.regionName, '/region/' + selSettings.regionID);
	} else {
		jQuery.address.value("");  
		jQuery.address.title("BIOPAMA RIS");
	} */
}