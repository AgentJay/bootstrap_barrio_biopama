jQuery(document).ready(function($) {
	var cookie_value = jQuery.cookie("toolbarActiveTab");
	if(cookie_value != 0)
	{
		console.log(document.cookie.split(';'))
	}
	else {
		console.log("not logged in")
	}
}) 