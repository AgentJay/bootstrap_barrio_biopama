var defaultRestIso2;
var defaultRestIso3;
var defaultRestNum;
var defaultRestRegion;
var defaultRestWdpaId;

jQuery(document).ready(function($) {
	$('#core-rest-working, #user-rest-working').hide();
	var height = $(window).height();
	var coreChecked = 0;  //this is to ensure we ONLY send an e-mail once after both user and core services have been checked. 
	var userChecked = 0;
	var emailRequested = 0;
	resizeCards(height);
	
	$(".DOPAgetWdpaExtent").text(DOPAgetWdpaExtent+600);
	$(".DOPAgetCountryExtent").text(DOPAgetCountryExtent+'BWA');
	$(".DOPAcountriesGroupExtent").text(DOPAcountriesGroupExtent+'BWA');
	$(".DOPAgetRadarPlot").text(DOPAgetRadarPlot+600);
	$(".DOPAgetCountryProtCon").text(DOPAgetCountryProtCon+'BW');
	$(".DOPAgetPaNums").text(DOPAgetPaNums+'BW');
	$(".DOPAavgClimate").text(DOPAavgClimate+600);
	$(".wb-rest-sp-pop-totl").text("https://api.worldbank.org/v2/countries/BWA/indicators/SP.POP.TOTL?format=json&MRNEV=1");
	$(".wb-rest-ag-lnd-totl-k2").text("https://api.worldbank.org/v2/countries/BWA/indicators/AG.LND.TOTL.K2?format=json&MRNEV=1");
	$(".wb-rest-ny-gdp-pcap-pp-cd").text("https://api.worldbank.org/v2/countries/BWA/indicators/NY.GDP.PCAP.PP.CD?format=json&MRNEV=1");
	$(".wb-restny-gdp-mktp-kd-zg").text("https://api.worldbank.org/v2/countries/BWA/indicators/NY.GDP.MKTP.KD.ZG?format=json&MRNEV=1");
	
	var coreTotal = $( ".core-rest" ).length;
	$('#core-rest-total').text(coreTotal);
	
	
	$('#check-user-rest').bind("click", function(){
		$('#user-rest-results').append( '<i class="fas fa-sync-alt fa-spin"></i>' );
		runRestReport("user");
	});
	$('#check-core-rest').bind("click", function(){
		$('#core-rest-results').append( '<i class="fas fa-sync-alt fa-spin"></i>' );
		runRestReport("core");
	});
	$('#email-report').bind("click", function(){
		console.log("clicked!");
		emailRequested = 1;
		runRestReport("core");
		runRestReport("user");
	});
	
	
	function runRestReport(type){
		var restUrls = $( "."+type+"-rest" );
		var successCount = 0;
		var errorCount = 0;
		var failCount = 0;
		$('#check-'+type+'-rest').prop("disabled", true);

		$.when.apply($, restUrls.map(function(item) {
			$( ".alert" ).remove();//remove any alert divs to get the clean URL
			var restURL = $( this ).text()
			var thisRestRow = this;
			return $.ajax({
				url: restURL,
				async: true,
				success: function(d) {
					var result = JSON.stringify(d).toLowerCase();
					var errors = ["error", "invalid"];
					var restProccessed = 0;
					errorLength = errors.length;
					while(errorLength--) {
						console.log(result);
					   if (result.indexOf(errors[errorLength]) > 0) { //an error was found!
							if (result.indexOf('"success":true') > 0) { //we check if it's not a False Negative from our own services
								restProccessed = 0;
							} else{
								restProccessed = 1;
							}
					   } else {
						   restProccessed = 0;
					   }
					}
					if (restProccessed == 0) { //if all was good from the last check
						successCount++;
						$(thisRestRow).append( '<div class="alert alert-success"><strong>Success!</strong></div>' );
					} else{
						errorCount++;
						$(thisRestRow).append( '<div class="alert alert-warning"><strong>Error!</strong></div>' );
					}
				},
				error: function(d) {
					var result = JSON.stringify(d).toLowerCase();
					$(thisRestRow).append( '<div class="alert alert-danger"><strong>Fail! ' + result + '</strong></div>' );
					failCount++;
				}
			}).then(function(data){
				$('#'+type+'-rest-success').text(successCount);
				$('#'+type+'-rest-error').text(errorCount);
				$('#'+type+'-rest-fail').text(failCount);
			});
		})).then(function() {
			if(type == "core"){
				coreChecked = 1; 
			}
			if(type == "user"){
				userChecked = 1; 
			}
			
			$('#check-'+type+'-rest').prop("disabled", false);
			$('i.fa-sync-alt').remove();
			if ((coreChecked == 1) && (userChecked == 1) && (emailRequested == 1)){
				restEmailReport();
				emailRequested = 0;
			}
		});
	}
	function restEmailReport(){
		var coreRESTresults = $( "#core-rest-results" ).text();
		var userRESTresults = $( "#user-rest-results" ).text();
		$.ajax({
			url     : '/emailRESTresults.php',
			type  : 'POST',
			data    : { 'core': coreRESTresults,
						'user': userRESTresults
					  },
			success : function( response ) {
				$('#core-rest-success').text("email-sent");
			}
		}); 
	}
});

jQuery(window).resize(function(){
	var height = jQuery(window).height();
	resizeCards(height);
});

function resizeCards(height){
	jQuery('.card').css('max-height', height-150);
}

(function ($, Drupal) {
	Drupal.behaviors.restFormUpdate = {
		attach: function (context, settings) {
			$('#check-user-rest').prop("disabled", false);
			$('#check-core-rest').prop("disabled", false);
			$('i.fa-sync-alt').remove();
			defaultRestIso2 = $( "input#country-iso2" ).val();
			defaultRestIso3 = $( "input#country-iso3" ).val();
			defaultRestNum = $( "input#country-num" ).val();
			//defaultRestRegion = $( "input#region" ).val();
			defaultRestWdpaId = $( "input#wdpa-id" ).val();

			$( ".views-field-field-data-rest-url .field-content" ).each(function( index ) {
				var restURL = $( this ).text()
				restURL = restURL.replace("NUM", defaultRestNum)
				.replace("ISO2", defaultRestIso2)
				.replace("ISO3", defaultRestIso3)
				.replace("WDPAID", defaultRestWdpaId);
				$( this ).html('<a href="'+restURL+'" target="_blank">'+restURL+'</a>');
			});
			var userTotal = $( ".user-rest" ).length;
			$('#user-rest-total').text(userTotal);
		}
	};
})(jQuery, Drupal);

function updateRESTTokens(){
	jQuery('.view-rest-url-list').trigger('RefreshView');
}