jQuery(document).ready(function($) {
	//this provides the ajax refresh of the views we have in the menu...
	//D9 patches have broken the feature formally using the Drupal API, now we delete and recreate the view manually.
	Drupal.behaviors.refreshMenuViews = {
		attach: function (context, settings) {
			$('#drupal-off-canvas').find('form.node-policy-form .alert-success, form.node-policy-edit-form .alert-success').once('updated-view').each( function() {
				console.log("policy saved");
				//$( ".view-id-menu_level_1_policies_:visible" ).trigger('RefreshView') 
				$( ".view-id-menu_level_1_policies_:visible" ).remove();
				var currentScope = $( ".active-scope" );
				if (currentScope.hasClass('global-trigger')){
					loadIndicators('global');
				} else if (currentScope.hasClass('regional-trigger')){
					loadIndicators('regional');
				} else if (currentScope.hasClass('national-trigger')){
					loadIndicators('national');
				} else if (currentScope.hasClass('local-trigger')){
					loadIndicators('local');
				}
				console.log("policy form closed");
				$("div.ui-dialog-titlebar button.ui-dialog-titlebar-close").delay( 800 ).trigger('click');
			});
			$('#drupal-off-canvas').find('form.node-goal-target-form .alert-success, form.node-goal-target-edit-form .alert-success').once('updated-view').each( function() {
				console.log("target saved");
				$( ".menu-goals:visible" ).trigger('RefreshView');
				$("div.ui-dialog-titlebar button.ui-dialog-titlebar-close").delay( 800 ).trigger('click');
			});
			$('#drupal-off-canvas').find('form.node-indicator-form .alert-success, form.node-indicator-edit-form .alert-success').once('updated-view').each( function() {
				$( ".menu-indicators:visible" ).trigger('RefreshView');
				if ($('#block-indicatorcard:visible').length){
					closeIndicatorCard();
					showIndicatorCard(currentIndicatorNodeURL);
				}
				$("div.ui-dialog-titlebar button.ui-dialog-titlebar-close").delay( 800 ).trigger('click');
			});	
			$('#drupal-off-canvas').find('form.node-indicator-data-glo-form .alert-success, form.node-indicator-data-regional-form .alert-success, form.node-indicator-data-country-form .alert-success, form.node-indicator-data-local-form .alert-success').once('updated-view').each( function() {
				if ($('#block-indicatorcard:visible').length){
					closeIndicatorCard();
					showIndicatorCard(currentIndicatorNodeURL);
				}
				$("div.ui-dialog-titlebar button.ui-dialog-titlebar-close").delay( 800 ).trigger('click');
			});	
			// menuDivFix();
			$( ".row-policy" ).each(function( index, element ) {
				var policyTitle = $(this).find(".policy-title").first().text().trim();
				if ( policyTitle ==  globalScope.policy) {
				  $(this).find("div.policy-header").next().show();
				  return false;
				}
			});
		}
	};
	
/* Drupal.behaviors.ajaxViewDemo = {
    attach: function (context, settings) {
      // Attach ajax action click event of each view column.
      $(context).find(".global-trigger").once('attach-links').each(this.attachLink);
    },
 
    attachLink: function (idx, column) {
 
      // Everything we need to specify about the view.
      var view_info = {
        view_name: 'map_policy_menu_level_2_targets_and_goals_',
        view_display_id: 'goal_block_1',
        view_dom_id: 'global-content-container'
      };
 
      // Details of the ajax action.
      var ajax_settings = {
        submit: view_info,
        url: '/views/ajax',
        element: ".global-trigger",
        event: 'click'
      };
 
      Drupal.ajax(ajax_settings);
    }
}; */
	function loadIndicators(scope){
		var indicatorsBlockURL = '';
		var indicatorContainer = '';
		switch (scope){
			case "state":
				indicatorsBlockURL = '/ajax-block/views_block__indicators_by_target_goal_indicator_state';
				indicatorContainer = '#state-tab';
				break;
			case "pressure":
				indicatorsBlockURL = '/ajax-block/views_block__indicators_by_target_goal_indicator_pressure';
				indicatorContainer = '#pressure-tab';
				break;
			case "global":
				indicatorsBlockURL = '/ajax-block/views_block__menu_level_1_policies__block_global';
				indicatorContainer = '.global-content';
				break;
			case "regional":
				indicatorsBlockURL = '/ajax-block/views_block__menu_level_1_policies__block_regional';
				indicatorContainer = '.regional-content';
				break;
			case "national":
				indicatorsBlockURL = '/ajax-block/views_block__menu_level_1_policies__block_national';
				indicatorContainer = '.national-content';
				break;
			case "local":
				indicatorsBlockURL = '/ajax-block/views_block__menu_level_1_policies__block_local';
				indicatorContainer = '.local-content';
				break;
/* 			case "list":
				indicatorsBlockURL = '/ajax-block/views_block__indicators_by_target_goal_indicator_list';
				indicatorContainer = '#list-tab';
				break; */
			default: 
				break;
		}
		$(indicatorContainer).append("<div id='mini-loader-wrapper'><div id='mini-loader'></div></div>");
		//console.log(indicatorsBlockURL);
		$.get({ 
			url: indicatorsBlockURL, 
			success: function (data) { 
				$(indicatorContainer).append( data )
				//$(indicatorContainer).html( data );
				Drupal.attachBehaviors($(indicatorContainer).get(0));
				$(indicatorContainer).find("#mini-loader-wrapper").remove();
				var menuAccordionContainer = ".menu-goals";
				var menuAccordionHeader = ".goal-header.views-field-title";
				if (indicatorContainer.indexOf("-tab") >= 1){ 
					menuAccordionContainer = ".menu-indicators";
					menuAccordionHeader = "h3.js-views-accordion-group-header";
					$(menuAccordionHeader, menuAccordionContainer).each(function (i) {
						// Wrap the accordion content within a div if necessary.
						if(!$(this).hasClass("accordionDone")){
							$(this).siblings().wrapAll('<div></div>');
						}
						$(this).addClass("accordionDone");
					});
				}
				$(menuAccordionContainer).accordion({
					collapsible: true,
					active: false,
					heightStyle: content,
					animate: false,
					header: menuAccordionHeader,
				});
				//$('div.goal-content.ui-accordion-content').height('auto'); //fix for the height of 0px being added somewhere incorrectly
			}
		});
	}
	
	$( "#map-menu" ).ready(function() {

		$('div#block-mapmenuscope').on('click', ".global-trigger, .regional-trigger, .national-trigger, .local-trigger, .state-trigger, .pressure-trigger, .list-trigger", function() {
			//console.log($(this));
			if (!$(this).hasClass("ajax-loaded")){ 
				$(this).addClass("ajax-loaded");
				if ($(this).hasClass("global-trigger")){ 
					loadIndicators('global');
				}
				if ($(this).hasClass("regional-trigger")){ 
					loadIndicators('regional');
				}
				if ($(this).hasClass("national-trigger")){ 
					loadIndicators('national');
				}
				if ($(this).hasClass("local-trigger")){ 
					loadIndicators('local');
				}
				if ($(this).hasClass("pressure-trigger")){ 
					loadIndicators('pressure');
				}
				if ($(this).hasClass("state-trigger")){ 
					loadIndicators('state');
				}
			}
		});
		
		
/* 		
		$('.views-accordion-header').on('click', function() {
			$( this ).next().css( "background-color", "red" );
		}); */
		
		$('div#block-mapmenuscope').on('click', "ul.menu-scope-list li, h2.menu-title", function() {
			//reset the selected scope/target/policy
			globalScope.scope = '';
			globalScope.policy = '';
			globalScope.target = '';
			globalScope.spr = '';
			globalScope.sprCat = '';
			var tabName = $(this).text().toLowerCase();
			//console.log(tabName)
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
		$('div#block-mapmenuscope').on('click', ".js-views-accordion-group-header", function() {
			globalScope.sprCat = $(this).text();
			//console.log(globalScope.sprCat)
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
				//menuDivFix();
				Drupal.attachBehaviors($("#menu-scope-tabs").get(0));
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
			globalScope.policy = $(this).find(".policy-title").first().text().trim(); //store selected policy 
			
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
		$('div#block-mapmenuscope').on('click', 'div.views-row div.goal-header', function() {
			globalScope.target = $(this).find(".field-content").text().trim();
			
			$(".active-goal" ).removeClass( "active-goal" );
			if ($(this).hasClass( "ui-accordion-header-active" )){
				$(this).addClass("active-goal");
			} 
		});

		$('div#block-mapmenuscope').on('mouseover', ".menu-policy-effect div.policy-wrapper", function () {
			if ($( "div.scope-content" ).hasClass( "menu-policy-effect" )){
				if ($(this).parent().parent().hasClass( "active-policy" )){
					return; //skip the policy from the hover event if it's the one currently open.
				}else{
					$('.menu-policy').find('.policy-hover').remove(); //ensures all other instances of hovered policies are removed
					var policyMenuLoc = $(this).closest('div.menu-policy').offset().top; //gets the hovered policy
					var position = $(this).offset().top - policyMenuLoc ; //get the vertical position of the hovered policy

					var cloneItem = $(this)
						.clone()
						.addClass('policy-hover')
						.css('top', position); //make a copy of the policy to display outside the current div 
					$('.menu-policy').find('.policy-hover').remove();
					$(this).before(cloneItem);
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