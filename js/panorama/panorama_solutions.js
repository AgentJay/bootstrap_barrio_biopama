jQuery(document).ready(function($) {
	var solutionsLoaded = 0;
	$('.panorama-solutions').bind("click", function(){
		if ($(this).hasClass("ui-state-active")){
			//The panel has already been opened... So we check for the map layer and remove it.
			thisMap.setLayoutProperty("panorama-point", 'visibility', 'none');
			//console.log("active!");
		} else {
			if (solutionsLoaded == 0){
				solutionsLoaded = 1;
				var panoramaAreaCode = getAreaCode();
				
				var panoramaPoints = [];
				var jqxhr = $.get( "https://panorama.solutions/en/api/v1/solutions?api_key=b15ad7e5b77bc99b0f26a691&"+panoramaAreaCode, function(data) {
					var results = '<div class="container solution-container"><div class="row">';
					console.log(data.solutions.length)
					if (data.solutions.length){
						$.each(data.solutions, function( index, value ) {
							//we wrap the result in the col class seperately to allow the map popup to appear clean
							results += '<div class="solution-wrapper col-sm-4 col-m-2 col-md-3 col-xs-10 p-2">';
							var thisResult = '<a class="solution-link" target="_blank" href='+value.solution.url+'>'+
							'<div class="solution-inner">'+
								'<div class="solution-header-picture">'+
									'<img typeof="foaf:Image" src='+value.solution.preview_image.src+' width="380" height="220" title='+value.solution.title+'>'+
								'</div>'+
								'<div class="solution-content">'+
									'<div class="solution-title">'+value.solution.title+'</div>';
									if (value.solution.contributors.length > 0){
										thisResult += '<div class="solution-submit">'+
											'<div class="solution-provider">by <span class="solution-provider-name">'+value.solution.contributors[0].contributor.name+'</span></div>'+
											'<div class="solution-organisation">'+value.solution.contributors[0].contributor.organisation+'</div>'+
										'</div>';
									}
									thisResult += '<div class="solution_location">'+
										'<strong><div class="solution-location-label"><i class="fas fa-map-marker-alt"></i> Location</div></strong>'+
										'<span>'+value.solution.field_location+'</span>'+
									'</div>'+
								'</div>'+
							'</div>'+
							'</a>';
							results += thisResult
							results += '</div>';
							if (value.solution.field_location_geofield !== null){
								var regex = /\[.*?\]/g;
								var solutionPoint = value.solution.field_location_geofield.match(regex) + '';
								solutionPoint = solutionPoint.slice(1, -1);
								var solutionLoc = solutionPoint.split(",");
								var solutioXcoord = parseInt(solutionLoc[0]);
								var solutioYcoord = parseInt(solutionLoc[1]);
								var solutioCoords = [solutioXcoord, solutioYcoord, 0];
								var panoramaSolution = { "type": "Feature", "properties": { "id": index, "contents": '<div class="panorama-marker-popup">'+thisResult+'</div>'}, "geometry": { "type": "Point", "coordinates": solutioCoords } }
								panoramaPoints.push(panoramaSolution)
								//console.log(panoramaSolution)
							}
							
						});
					} else {
						results += '<div class="alert alert-warning" role="alert">' +
							'At present, no solution case studies related to ' + selSettings.paName + ' available on the PANORAMA web platform. Would you like to submit one? Go here: <a href="https://panorama.solutions/en/solution/add">https://panorama.solutions/en/solution/add</a>' +
						'</div>';
					}
					results += '</div></div>'+
					$( ".panorama-solutions-results" ).html( results );
				})
				.done(function() {
					//console.log(panoramaPoints)
					var panoramaGeoJson = {
						"type": "FeatureCollection",
						"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
					};
					panoramaGeoJson.features = panoramaPoints;
					thisMap.addSource("panorama", {
						type: "geojson",
						data: panoramaGeoJson,
					});
					thisMap.addLayer({
						id: "panorama-point",
						type: "circle",
						source: "panorama",
						paint: {
							"circle-color": "#11b4da",
							"circle-radius": 6,
							"circle-stroke-width": 1,
							"circle-stroke-color": "#fff"
						}
					});
					thisMap.on('click', 'panorama-point', function (e) {
						var coordinates = e.features[0].geometry.coordinates.slice();
						var popText = e.features[0].properties.contents;
						new mapboxgl.Popup({className: 'panorama-popup'})
							.setLngLat(coordinates)
							.setHTML(popText)
							.addTo(thisMap);
					});
				})
				.fail(function() {
					$( ".panorama-solutions-results" ).html( '<div class="alert alert-warning"><strong>Error!</strong> Panorama Solutions are not working correctly</div>' );
				})
			} else {
				thisMap.setLayoutProperty("panorama-point", 'visibility', 'visible');
			}
		}
	});
	
	function getAreaCode(){
		var panoramaCode;
		//console.log(selSettings);
/* 		switch(selSettings.regionID) {
		  case "CW_Africa":
			panoramaCode = 53
			break;
		  case "ES_Africa":
			panoramaCode = 140
			break;
		  case "Pacific":
			panoramaCode = 493
			break;
		  case "Caribbean":
			panoramaCode = 163
			break;
		  default:
			break;
		} */
		if (selSettings.WDPAID){
			panoramaCode = 'wdpa='+selSettings.WDPAID;
		} else if (selSettings.countryName !== "trans-ACP"){
			panoramaCode = selSettings.ISO2;
		} else if(selSettings.regionName !== null){
			switch(selSettings.regionName) {
			  case "Central Africa":
			  case "Western Africa":
				panoramaCode = 'region[]=53'
				break;
			  case "Eastern Africa":
			  case "Southern Africa":
				panoramaCode = 'region[]=140'
				break;
			  case "Pacific":
				panoramaCode = 'region[]=493'
				break;
			  case "Caribbean":
				panoramaCode = 'region[]=163'
				break;
			  default:
				break;
			}
		}
		return panoramaCode;
	}
});