/**
 * @file
 * Global utilities.
 *
 */
var tipTemplate    = '<div class="tooltip biopama-tip" role="tooltip"><div class="arrow biopama-arrow"></div><div class="tooltip-inner biopama-tip-inner"></div></div>';
var tipTopTemplate = '<div class="tooltip biopama-tip" role="tooltip"><div class="arrow biopama-top-arrow"></div><div class="tooltip-inner biopama-tip-inner"></div></div>';
var tipBottomTemplate = '<div class="tooltip biopama-tip-bottom" role="tooltip"><div class="arrow biopama-bottom-arrow"></div><div class="tooltip-inner biopama-tip-inner"></div></div>';

(function ($, Drupal) {
  'use strict';
  Drupal.behaviors.bootstrap_barrio_subtheme = {
    attach: function (context, settings) {
		$(".source-wrapper").hover(
		  function() {
			$( this ).find(".source-name").show("fast");
			//$( this ).find(".source-info").show("fast");
		  }, function() {
			$( this ).find(".source-name").hide("fast");
			//$( this ).find(".source-info").hide("fast");
		  }
		);
/* 		$(".source-wrapper").click(
		  function() {
			$( this ).find(".source-name").toggle("fast");
		  }
		); */
 		
		$(function () {                       
      
	  $( "div.tooltip-ter" ).tooltip({
			trigger:"hover",
			html: true,
			placement: "right",
			title:"CBD Target 11. Progress towards goal of protecting 17% of Terrestrial Areas.<br><div style='text-align: left;'><span style='color:#679b95;'>Blue</span> = Area protected towards the target<br><span style='color:#000;'>Black</span> = Area remaining<br><span style='color:#8fc04f;'>Green</span> = Area protected in addition to the target goal</div>",
			delay: 200,
			template: tipTemplate
	  });
      
      $( "div.tooltip-mar" ).tooltip({
			trigger:"hover",
			html: true,
			placement: "right",
			title:"CBD Target 11. Progress towards goal of protecting 10% of Marine Areas.<br><div style='text-align: left;'><span style='color:#679b95;'>Blue</span> = Area protected towards the target<br><span style='color:#000;'>Black</span> = Area remaining<br><span style='color:#8fc04f;'>Green</span> = Area protected in addition to the target goal</div>",
			delay: 200,
			template: tipTemplate
	  });
      
      $('.toolbar-icons-right a').tooltip({
        template: tipBottomTemplate,
        placement: "bottom",
        container: 'body',
        delay: 200,
        trigger:"hover",
        html: true,
      });
      
      $('.field_source_logo_tooltip').tooltip({
        template: tipBottomTemplate,
        placement: "bottom",
        container: 'body',
        delay: 200,
        trigger:"hover",
        html: true,
      });

    
    }) 
    }
  };

})(jQuery, Drupal);

function enableSplashScreen(){
	jQuery.jStorage.deleteKey("splashScreenIgnore");
	jQuery("#splash-enable").text( "Done!" );
	jQuery("#splash-enable").fadeOut( "slow" );
}