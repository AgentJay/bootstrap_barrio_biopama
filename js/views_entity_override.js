 jQuery(document).ready(function($) {
	$( "div.view-content" ).prepend( "Select all ACP countries: <input style='margin-left: 20px;' type='checkbox' class='select-acp'>" );
	$( "h3" ).append( "<input style='margin-left: 20px;' type='checkbox' class='select-region'>" );
	
	$('input.select-region').click(function(e) {
	  $.each($('.form-checkbox', $(this).parent().next()), function(i,d) {
		  d.checked = !d.checked;
	  });
	});
	$('input.select-acp').click(function(e) {
	  $.each($('.form-checkbox'), function(i,d) {
		  d.checked = !d.checked;
	  });
	});
});