function buildModalWithMap(pageURL, restURL, modalTitle){
	Drupal.ajax({ 
		url: pageURL,
		success: function(response) {			
			var $paDialogContents
			for (var key in response) {
				// skip loop if the property is from prototype
				if (!response.hasOwnProperty(key)) continue;
				var obj = response[key];
				for (var prop in obj) {
					// skip loop if the property is from prototype
					if(!obj.hasOwnProperty(prop)) continue;
					//console.log(prop + " = " + obj[prop]);
					if(prop == "data"){
						//console.log(prop + " = " + obj[prop]);
						$paDialogContents = jQuery('<div>' + response[key].data + '</div>').appendTo('body');
					}
				}
			}
			var paDialog = Drupal.dialog($paDialogContents, {title: modalTitle, dialogClass: "country-summary-dialog", width: "80%", height: "80%", create: buildMap(restURL)});
			paDialog.showModal();
			Drupal.attachBehaviors(jQuery(".country-summary-dialog"));
		}
	}).execute(); 		
}

function buildMap(restURL){
	var countryMap;
	jQuery.ajax({
	  url: restURL,
	  dataType: 'json',
	  success: function(d) {
		countryMap = new mapboxgl.Map({ 
			container: 'country-map',
			style: 'mapbox://styles/blishten/cjlvzdp7g2ni62rnig4vurzq3', //Andrews default new RIS v2 style based on North Star
			attributionControl: true,
			renderWorldCopies: true,
			interactive: false
		});
		countryMap.fitBounds(jQuery.parseJSON(d.records[0].extent));
		countryMap.on('load', function () {
			countryMap.addSource('wdpaVector', {
					type: 'vector',
					url: 'mapbox://jamesdavy.ai6ap09k'
			});
			countryMap.addSource('countryEEZ', {
					type: 'vector',
					url: 'mapbox://jamesdavy.8j7z85ew'
			});
			countryMap.addLayer({
				"id": "selectedCountry",
				"type": "line",
				"source": 'countryEEZ',
				"source-layer": "ACP_Dissolved_groups-6q6dqi",
				"filter": ["==", "iso3", selSettings.ISO3],
				"paint": {
					"line-color": "#8FBF4B",
					"line-width": 3
				}
			}, 'state-label-lg');
			countryMap.addLayer({
				"id": "WDPADec2017Poly",
				"type": "fill",
				"source": 'wdpaVector',
				"source-layer": "ACP_Poly-ch9f72",
				"minzoom": 3,
				"paint": {
					"fill-color": {
						"base": 1,
						"type": "categorical",
						"property": "MARINE",
						"stops": [
							["0", "rgba(143, 191, 75, 0.2)"],
							["1", "rgba(103, 155, 149, 0.2)"],
							["2", "rgba(103, 155, 149, 0.2)"]
						]
					},
					"fill-opacity": 0.8
				}
			}, 'state-label-lg');
			countryMap.addLayer({
				"id": "WDPADec2017Poly_high",
				"type": "fill",
				"source": 'wdpaVector',
				"source-layer": "ACP_Poly-ch9f72",
				"filter": ["==", "ISO3", selSettings.ISO3],
				'paint': {
					'fill-color':'rgba(143, 191, 75, 0.5)',
					'fill-outline-color': 'rgba(143, 191, 75, 0.5)'
				}
			}, 'state-label-lg');
			countryMap.addLayer({
				"id": "WDPADec2017Poly_Sel",
				"type": "line",
				"source": 'wdpaVector',
				"source-layer": "ACP_Poly-ch9f72",
				"layout": {
					"visibility": "none"
				},
				"paint": {
					"line-color": "rgba(143, 191, 75, 1)",
					"line-width": 3,
				},
				"transition": {
				  "duration": 300,
				  "delay": 0
				}
			}, 'state-label-lg');
			if (jQuery( ".field--name-field-pa-centroid" ).length > 0){
				countryMap.setFilter("WDPADec2017Poly_Sel", ['==', 'WDPAID', selSettings.WDPAID]);
				countryMap.setLayoutProperty("WDPADec2017Poly_Sel", 'visibility', 'visible');
			}
		});
	  }
	});
	
	//we build the tabs with a trigger to check for charts when the tabs are both created and changed
	//this is to fix the issues with echarts visualisation and save bandwidth
	jQuery( "#tabs" ).tabs({activate: checkForCharts});
	if (jQuery( "#state-accordion" ).length){
		jQuery( "#state-accordion" ).accordion({heightStyle: "fill", collapsible: true, active: false, activate: checkForCharts, create: checkForCharts});
	}
	if (jQuery( "#response-accordion" ).length){
		jQuery( "#response-accordion" ).accordion({heightStyle: "fill", collapsible: true, active: false, activate: checkForCharts, create: checkForCharts});
	}
	if (jQuery( "#pressure-accordion" ).length){
		jQuery( "#pressure-accordion" ).accordion({heightStyle: "fill", collapsible: true, active: false, activate: checkForCharts, create: checkForCharts});
	}

	function checkForCharts(){
		if (jQuery( ".views-col:visible" ).length){
			jQuery(".views-col:visible").each(function(index) {
				var indicatorName = jQuery.trim(jQuery(this).find(".field--name-title").text());
				var indicatorClass = indicatorName.replace(/\s/g, "-");
				var indicatorID = jQuery.trim(jQuery(this).find(".views-field-nid").text());
				var activeIndicator = jQuery.inArray(indicatorID, CountrySettings.selIndicators);

				if (activeIndicator == -1) {
					CountrySettings.selIndicators.push(indicatorID);
					var indicatorWrapper = jQuery(this);
					//for each of these we work our way up from the active url. then find the field we need. This is due to the way drupal views generates the table
					//temp - as not all charts are complete we check if a series AND URL exists to do the chart
					var indicatorRESTurl = jQuery(indicatorWrapper).find(".field--name-field-data-rest-url").text();
					CountrySettings.selIndicatorRESTurl.push(indicatorRESTurl);
					//var indicatorMapLayer = jQuery(indicatorWrapper).find(".views-field-field-map-layer-field").text();
					//CountrySettings.selIndicatorMapLayerField.push(indicatorMapLayer);
					//var indicatorMap = jQuery(indicatorWrapper).find(".views-field-field-map-rest-field").text();
					//CountrySettings.selIndicatorMappedField.push(indicatorMap);
					var indicatorXaxis = jQuery(indicatorWrapper).find(".chart-xaxis").text().trim();
					try {
						indicatorXaxis = JSON.parse(indicatorXaxis);
					} catch (e) {
						indicatorXaxis = '{}';
					}
					CountrySettings.selIndicatorXaxis.push(indicatorXaxis);
					var indicatorYaxis = jQuery(indicatorWrapper).find(".chart-yaxis").text().trim();
					try {
						indicatorYaxis = JSON.parse(indicatorYaxis);
					} catch (e) {
						indicatorYaxis = '{}';
					}	
					CountrySettings.selIndicatorYaxis.push(indicatorYaxis);
					var indicatorSeries = jQuery(indicatorWrapper).find(".chart-series").text().trim();
					indicatorSeries = indicatorSeries.replace(/(}\s*\s)+/g, "}||").split("||");
					indicatorSeries.forEach(function(object, index){
						try {
							indicatorSeries[index] = JSON.parse(object);
						} catch (e) {
							indicatorSeries[index] = '{}';
						}	
					});	
					CountrySettings.selIndicatorChartSeries.push(indicatorSeries);
					var indicatorCountries = jQuery(indicatorWrapper).find(".indicator-countries").text();
					var indicatorCountriesArray = indicatorCountries.split(", ");
					CountrySettings.selIndicatorCountries.push(indicatorCountriesArray);
					var indicatorImages = jQuery(indicatorWrapper).find('img').attr('src');
					CountrySettings.selIndicatorImages.push(indicatorImages);
				}
				activeIndicator = jQuery.inArray(indicatorID, CountrySettings.selIndicators);
				if (CountrySettings.selIndicatorRESTurl[activeIndicator] != null){
					jQuery(this).append("<div class='country-chart' id='country-chart-" + indicatorID + "-wrapper'></div>");
					getCountryRestResults(activeIndicator);
				}
			});
		}
		if (jQuery( ".indicator-chart:visible" ).length){
			jQuery( ".indicator-chart:visible" ).each(function( index ) {
			  var chartID = jQuery(this).attr("id");
			  buildIndicatorChart(chartID);
			});
		}
	}
}

function buildIndicatorChart(containerID){
	switch(containerID){
		case "pa-radar-chart":
			makeDOPARadar(containerID);
			break;
		case "pa-avg-climate-chart":
			makeDOPAAvgClimate(containerID);
			break;
		case "pa-dopa-ap":
		case "pa-dopa-roads-pressure":
		case "pa-dopa-roads-in":
		case "pa-dopa-ppi":
		case "pa-dopa-ppi-change":
			makeDOPAPressureChart(containerID);
			break;
		default:
            break;
	}
}

function makeDOPARadar(containerID){
	var restURL = "https://dopa-services.jrc.ec.europa.eu/services/d6dopa/protected_sites/get_radarplot_all?format=json&wdpaid="+selSettings.WDPAID
	
	jQuery.ajax({
		url: restURL,
		dataType: 'json',
		success: function(d) {
			if (d.metadata.recordCount == 0) {
				jQuery('#'+containerID).text("no records for " + selSettings.paName);
			} else {
				var seriesTitle = [];
				var seriesNorm = [];
				var seriesAvg = [];
				var DOPAChart = echarts.init(document.getElementById(containerID));

				jQuery(d.records).each(function(i, data) {
					var tempObj = {};
					tempObj.name = data.title
					tempObj.max = 100;
					seriesTitle.push(tempObj);
					seriesNorm.push(data.site_norm_value); 
					seriesAvg.push(data.country_avg);
				});
			}
			
			var option = {
				tooltip: {},
				legend: {
					data: ['Protected Area', 'Country Average'],
					left:  '0'
				}, 
				radar: {
					indicator: seriesTitle
				},
				series: [{
					name: 'DOPA stats for' + selSettings.paName,
					type: 'radar',
					data : [
						{
							value : seriesNorm,
							name : 'Protected Area'
						},
						 {
							value : seriesAvg,
							name : 'Country Average',
							areaStyle: {normal: {color: 'rgba(0, 0, 0, 0.5)'}}
						}
					]
				}]
			};
			
			DOPAChart.setOption(option);
			
		}
	});	
}

function makeDOPAAvgClimate(containerID){
	var restURL = "https://dopa-services.jrc.ec.europa.eu/services/d6dopa/climate/get_worldclim_pa?wdpaid="+selSettings.WDPAID;
	
	jQuery.ajax({
		url: restURL,
		dataType: 'json',
		success: function(d) {
			if (d.metadata.recordCount == 0) {
				jQuery('#'+containerID).text("no records for " + selSettings.paName);
			} else {
				var DOPAChart = echarts.init(document.getElementById(containerID));

				var precip = [];
				var tmax = [];
				var tmin = [];
				var tmean = [];


				jQuery(d.records).each(function(i, data) {
				    switch (data.type) {
						case 'prec':
						   for (var prop in data) {
							   if (prop !== 'type' && prop !== 'uom') {
								   precip.push(data[prop])
							   }
						   }
							break;
						case 'tmin':
						   for (var prop in data) {
							   if (prop !== 'type' && prop !== 'uom')
								   tmin.push(data[prop])
						   }
							break;
						case 'tmax':
						   for (var prop in data) {
							   if (prop !== 'type' && prop !== 'uom')
								   tmax.push(data[prop])
						   }
							break;
						case 'tmean':
						   for (var prop in data) {
							   if (prop !== 'type' && prop !== 'uom')
								   tmean.push(data[prop])
						   }
							break;
					   default:
							break;
				    }
				});
			}
			
			var option = {
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'cross',
						crossStyle: {
							color: '#999'
						}
					}
				},
				toolbox: {
					show: true,
					feature: {
						restore: {
							title: 'Restore'
						},
						saveAsImage: {
							title: 'Image',
						}
					}
				},
				//color: {"#bfd4d6"},
				legend: {
					data:['Precipitation','Max Temp.', 'Mean Temp.', 'Min Temp.']
				},
				xAxis: [
					{
						type: 'category',
						data: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
						axisPointer: {
							type: 'shadow'
						}
					}
				],
				yAxis: [
					{
						type: 'value',
						name: 'Precipitation',
						min: 0,
						axisLabel: {
							formatter: '{value} mm'
						}
					},
					{
						type: 'value',
						name: 'Temperature',
						min: 0,
						axisLabel: {
							formatter: '{value} °C'
						}
					}
				],
				series: [
					{
						name:'Precipitation',
						type:'bar',
						data: precip
					},
					{
						name:'Max Temp.',
						type:'line',
						data: tmax,
						yAxisIndex: 1,
						lineStyle: {
							normal: {
								color: '#df9595',
								width: 3,
								type: 'dashed'
							}
						}
					},
					{
						name:'Mean Temp.',
						type:'line',
						yAxisIndex: 1,
						data: tmean,
						lineStyle: {
							normal: {
								color: '#f2cd77',
								width: 3,
								type: 'dashed'
							}
						}
					},
					{
						name:'Min Temp.',
						type:'line',
						yAxisIndex: 1,
						data: tmin,
						lineStyle: {
							normal: {
								color: '#c8dff2',
								width: 3,
								type: 'dashed'
							}
						}
					}
				]
			};
			DOPAChart.setOption(option);
		}
	});	
}

function makeDOPAPressureChart(containerID){
	var DOPA_REST_URL = 'https://dopa-services.jrc.ec.europa.eu/services/ibex/';
	var chartColor = '#BFCFE1';
	var chartHiColor = '#003F87';
	var serviceNames = {
		'pa-dopa-ppi':{
			endpoint: 'ehabitat/get_ppi_country?countryid='+ selSettings.NUM,
			indicatorvalue: 'ppi',
			normalisedField:'normalised_ppi',
			normalisedAvgField:'normalised_avg_ppi',
			title:'Population density pressure index <br>for '+ selSettings.countryName,
			ytitle:'Population density pressure',
			color: chartColor,
			hilite: chartHiColor
		},
		'pa-dopa-ppi-change':{
			endpoint: 'ehabitat/get_ppi_change_country?countryid='+ selSettings.NUM,
			indicatorvalue: 'percent_change',
			normalisedField:'normalised_ppi_change',
			normalisedAvgField:'normalised_avg_ppi_change',
			title:'Change in population density pressure <br>from ' + ' 1990-2000 in '+ selSettings.countryName,
			ytitle:'Change in population density pressure',
			color: chartColor,
			hilite: chartHiColor
		},
		'pa-dopa-ap':{
			endpoint: 'ehabitat/get_agri_pressure_gw_country?countryid='+ selSettings.NUM,
			indicatorvalue: 'ap',
			normalisedField:'normalised_ap',
			normalisedAvgField:'normalised_avg_ap',
			title:'Agricultural Pressure index <br>for '+ selSettings.countryName,
			ytitle:'Agricultural pressure',
			color: chartColor,
			hilite: chartHiColor
		},
		'pa-dopa-roads-pressure':{
			endpoint: 'ehabitat/get_roads_pressure_country?countryid='+ selSettings.NUM,
			indicatorvalue: 'roads',
			normalisedField:'normalised_roads',
			normalisedAvgField:'normalised_avg_roads',
			title:'External roads pressure index <br>for '+ selSettings.countryName,
			ytitle:'External roads Pressure',
			color: chartColor,
			hilite: chartHiColor
		},
		'pa-dopa-roads-in':{
			endpoint: 'ehabitat/get_internal_roads_pressure_country?countryid='+ selSettings.NUM,
			indicatorvalue: 'roads_in',
			normalisedField:'normalised_roads_in',
			normalisedAvgField:'normalised_avg_roads_in',
			title:'Internal roads pressure index <br>for '+ selSettings.countryName,
			ytitle:'Internal roads pressure',
			color: chartColor,
			hilite: chartHiColor
		}
	};
	
	
	var url=DOPA_REST_URL+serviceNames[containerID].endpoint;
	
	jQuery.ajax({
		url: url,
		dataType: 'json',
		success: function(d) {
			if (d.metadata.recordCount == 0) {
				jQuery('#'+containerID).text("no records");
			} else {
				var DOPAChart = echarts.init(document.getElementById(containerID));
				var wdpa_id = [];
				var indicatorvalue = [];
				var marker_color = [];
				var normalised = [];
				var normalised_avg = [];
				var country_rank = [];

				jQuery(d.records).each(function(i, data) {
					for (var prop in data){
						if(prop == 'wdpa_id'){
							wdpa_id.push(data[prop]);
						}
						else if(prop == serviceNames[containerID].indicatorvalue){
							indicatorvalue.push(data[prop]);
						}
						else if(prop == serviceNames[containerID].normalisedField){
							normalised.push(data[prop]);
						}
						else if(prop == serviceNames[containerID].normalisedAvgField){
							normalised_avg = data[prop];
						}
						else if(prop == 'country_rank'){
							if (data[prop] == country_rank[country_rank.length-1]){
								country_rank.push(data[prop]+1);
							}
							else{
								country_rank.push(data[prop]);
							}
						}
						else {
						}
					}
				});
			}
			
			var option = {
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'cross',
						crossStyle: {
							color: '#999'
						}
					}
				},
				toolbox: {
					show: true,
					feature: {
						restore: {
							title: 'Restore'
						},
						saveAsImage: {
							title: 'Image'
						}
					}
				},
				xAxis: [
					{
						type: 'category',
						data: country_rank,
						axisPointer: {
							type: 'shadow'
						}
					}
				],
				yAxis: [
					{
						type: 'value',
						name: serviceNames[containerID].ytitle
					}
				],
				series: [
					{
						name:serviceNames[containerID].ytitle,
						type:'bar',
						data: normalised
					},
					{
						name: "Average " + serviceNames[containerID].ytitle,
						type:'line',
						data: normalised_avg
					}]
			};
			DOPAChart.setOption(option);
		}
	});	
}