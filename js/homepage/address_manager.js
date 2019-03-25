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
	if (selSettings.WDPAID > 0){
		jQuery.address.value(selSettings.regionID + "/" + selSettings.ISO2 + "/" + selSettings.WDPAID);  
		jQuery.address.title(selSettings.regionName + ' | ' + selSettings.countryName + ' | ' + selSettings.paName);
	} else if (selSettings.ISO2 !== null){
		jQuery.address.value(selSettings.regionID + "/" + selSettings.ISO2);  
		jQuery.address.title(selSettings.regionName + ' | ' + selSettings.countryName);
	} else  if (selSettings.regionID !== null){
		jQuery.address.value(selSettings.regionID);  
		jQuery.address.title(selSettings.regionName);
	} else {
		jQuery.address.value("");  
		jQuery.address.title("BIOPAMA RIS");
	}
}