jQuery(document).ready(function($) {
	$( "#map-menu" ).ready(function() {
		$('div#block-mapmenuscope').on('click', "ul.menu-scope-list li, h2.menu-title", function(e) {
			//reset the selected scope/target/policy
			globalScope.scope = '';
			globalScope.policy = '';
			globalScope.target = '';
			globalScope.spr = '';
			globalScope.sprCat = '';
			var tabName = $(this).text().toLowerCase();
			console.log(tabName)
			if ((tabName != "explore") || (tabName != "explorer")){
				switch (tabName){
					case "etat":
						tabName = "state";
						break;
					case "pression":
						tabName = "pressure";
						break;
					case "réponse":
						tabName = "response";
						break;
					default: 
						break;
				}
				globalScope.spr = $(this).text();
				$(".menu-tab").hide();
				$(".ui-tabs-active").removeClass('ui-tabs-active');
				$("#"+tabName+"-tab").show()
				$(this).addClass("ui-tabs-active");
			}
			if($(".menu-block-effect").length){
				$("div#block-mapmenuscope").removeClass("menu-block-effect");
				$(".active-scope-icon-title").removeClass("active-scope-icon-title");
				$(".active-scope").removeClass("active-scope");
				$("div.scope-content").hide();
				$('ul.menu-scope-list li').show();
			}
		});
		$('div#block-mapmenuscope').on('click', ".js-views-accodion-group-header", function(e) {
			globalScope.sprCat = $(this).text();
			console.log(globalScope.sprCat)
		});

		$('div#block-mapmenuscope').on('click', 'div.scope-icon-title', function(e) {
			$('.menu-scope-list > li:not(.ui-tabs-active)').hide();
			globalScope.scope = $(this).find(".scope-title").text().trim();
			
			//remove the active classes on all elements that didn't get clicked
			$('.menu-policy').find('.policy-hover').remove();
			$("div.scope-icon-title").not($(this)).removeClass('active-scope').next().hide();
			//check to see if any policies are open
			if ( $( ".active-policy" ).length ) {
				//hide the contents of any policies that are open
				$(".active-policy").next().hide();
				//remove active classes for nested policy menus.
				$(".active-policy").removeClass("active-policy");
				$(".menu-policy-effect").removeClass("menu-policy-effect");
			}
			$(this).toggleClass("active-scope");
			if ( $( ".active-scope" ).length ) {
				$('.menu-scope-list > li:not(.ui-tabs-active)').hide();
				$("div#block-mapmenuscope").addClass("menu-block-effect");
				$(".scope-icon-title").addClass("active-scope-icon-title");
				$(this).next().css( "display", 'flex' );
				//We run the fix (in global_var_functs.js) just in case the issue is present
				menuDivFix();
				$( "a.view-policy" ).tooltip({
					trigger:"hover",
					placement: "right",
					title:"View policy details",
					delay: tTipDelay,
					template: tipTemplate
				});
				$( "div.Draft" ).tooltip({
					trigger:"hover",
					placement: "right",
					title:"Draft Policy",
					delay: tTipDelay,
					template: tipTemplate
				});
				$( "a.edit-policy" ).tooltip({
					trigger:"hover",
					placement: "right",
					title:"Edit Policy",
					delay: tTipDelay,
					template: tipTemplate
				});
				$( "a.edit-target" ).tooltip({
					trigger:"hover",
					placement: "right",
					title:"Edit Target",
					delay: tTipDelay,
					template: tipTemplate
				});
				$( "a.edit-indicator" ).tooltip({
					trigger:"hover",
					placement: "right",
					title:"Edit Indicator",
					delay: tTipDelay,
					template: tipTemplate
				});
			} else {
				$('ul.menu-scope-list li').show();
				$("div#block-mapmenuscope").removeClass("menu-block-effect");
				$(".scope-icon-title").removeClass("active-scope-icon-title");
				$("div.scope-content").hide();
			}
		});
		$('div#block-mapmenuscope').on('click', 'div.policy-header', function(e) {
			globalScope.policy = $(this).find(".policy-title").first().text().trim();
			
			$('.menu-policy').find('.policy-hover').remove();
			var policyCountries = $(this).parent().find( ".views-field-field-countries" ).text().trim().replace(/\s/g,'');
			//If the policy has any countries attached to it, zoom to that extent.
/* 			if(policyCountries.length > 0){
				var policyZoomURL = DOPAcountriesGroupExtent + policyCountries
				console.log(policyZoomURL);
				jQuery.ajax({
				  url: policyZoomURL,
				  dataType: 'json',
				  success: function(d) {
						thisMap.fitBounds(jQuery.parseJSON(d.records[0].get_bbox_for_countries_dateline_safe), {
						  padding: {top: 100, bottom:10, left: 350, right: 10}
						});
				  },
				  error: function() {
					//TODO Make error
				  }
				});
			} */
			$("div.policy-header").not($(this)).removeClass('active-policy').next().hide();
			$(this).toggleClass("active-policy");
			if ( $( ".active-policy" ).length ) {
				$(this).closest(".scope-content").addClass("menu-policy-effect");
				$(this).next().css( "display", 'flex' );
			} else {
				$(this).closest(".scope-content").removeClass("menu-policy-effect");
				$("div.policy-content").hide();
			}
		});
		$('div#block-mapmenuscope').on('click', 'div.views-row > div.goal-header', function(e) {
			globalScope.target = $(this).find(".field-content").text().trim();
			
			$(".active-goal" ).removeClass( "active-goal" );
			if ($(this).hasClass( "ui-accordion-header-active" )){
				$(this).addClass("active-goal");
			} 
		});

		$('div#block-mapmenuscope').on('mouseover', ".menu-policy-effect div.policy-wrapper", function () {
			if ($( "div.scope-content" ).hasClass( "menu-policy-effect" )){
				if ($(this).parent().parent().hasClass( "active-policy" )){
					return;
				}else{
					$('.menu-policy').find('.policy-hover').remove();
					var policyMenuLoc = $(this).closest('div.menu-policy').offset().top;
					var hoveredItem = $(this);
					var position = hoveredItem.offset().top - policyMenuLoc ;

					var cloneItem = $(this)
						.clone()
						.addClass('policy-hover')
						.css('top', position);
					$('.menu-policy').find('.policy-hover').remove();
					hoveredItem.before(cloneItem);
				}
				var policyCountries = $(this).find( ".views-field-field-countries" ).text().trim().split(",  ")
				if(policyCountries[0] != [""]){
					thisMap.setLayoutProperty("CountriesBadMask", 'visibility', 'visible');
					thisMap.setFilter("CountriesBadMask", buildFilter(policyCountries, '!in', 'ISO3'));
				} 
			}
		});
		$('div#block-mapmenuscope').on('mouseover', "div.policy-wrapper", function () {
			var policyCountries = $(this).closest(".row-policy").find( ".views-field-field-countries" ).text().trim().split(",  ")
			//console.log(policyCountries)
			if(typeof policyCountries !== 'undefined' && policyCountries.length > 0){
				thisMap.setFilter("CountriesBadMask", buildFilter(policyCountries, '!in', 'iso3'));
				thisMap.setFilter("CountriesGoodMask", buildFilter(policyCountries, 'in', 'iso3'));
				thisMap.setLayoutProperty("CountriesGoodMask", 'visibility', 'visible');
				thisMap.setLayoutProperty("CountriesBadMask", 'visibility', 'visible');
			}
		});
		$('div#block-mapmenuscope').on('mouseout', "div.policy-wrapper", function () {
			thisMap.setLayoutProperty("CountriesGoodMask", 'visibility', 'none');
			thisMap.setLayoutProperty("CountriesBadMask", 'visibility', 'none');
		});
		$('div#block-mapmenuscope').on('mouseout', "div.policy-wrapper", function () {
			$('.menu-policy').find('.policy-hover').remove();
		});
		
	});
});