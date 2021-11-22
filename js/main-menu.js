jQuery(document).ready(function($) {
	$('div.menu-icon').on('click', function(e) {
		if (!$(this).hasClass('main-menu-active')){
			$(this).addClass("main-menu-active");
			$('#ultimenu-main').show(200);
		} else {
			$(this).removeClass("main-menu-active");
			$('#ultimenu-main').hide(200);
		}
	});
	$('#block-ultimenumainnavigation').on('mouseleave', function(e) {
		$('div.menu-icon').removeClass("main-menu-active");
		$('#ultimenu-main').hide(200);
	});	
});