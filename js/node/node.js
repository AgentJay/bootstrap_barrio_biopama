var countryCharts = [];

var CountrySettings = {
	selIndicators: [],
	selIndicatorMapLayerField: [],
	selIndicatorMappedField: [],
	selIndicatorChartType: [],
	selIndicatorRESTurl: [],
	mapLayerField: [],
	mappedField: [],
	mapPoints: [],
	selIndicatorRESTFields: [],
	selIndicatorRESTFieldLabels: [],
	selIndicatorChartProc: [],
	selIndicatorXaxis: [],
	selIndicatorYaxis: [],
	selIndicatorChartSeries: [],
	selIndicatorChartRadarSeries: [],
	selIndicatorChartRadarSettings: [],
	selIndicatorRes: [],
	selIndicatorCountries: [],
	selIndicatorImages: [],
	sort: [],
};

(function ($, Drupal) {
	Drupal.behaviors.refreshView = {
		attach: function (context, settings) {
			$('#drupal-off-canvas').find('form.node-priority-action-form .alert-success, form.node-priority-action-edit-form .alert-success').each( function() {
				$( ".view-priority-actions-regional, .view-priority-actions-country, .view-priority-actions-pa" ).delay( 800 ).trigger('RefreshView');
				$("div.ui-dialog-titlebar button.ui-dialog-titlebar-close").delay( 800 ).trigger('click');
			});
			$('#drupal-off-canvas').find('form.node-management-assessment-justificat-form .alert-success, form.node-priority-action-edit-form .alert-success').each( function() {
				$( ".view-management-assessments-by-region, .view-management-assessments-country, .view-management-assessments-pa" ).delay( 800 ).trigger('RefreshView');
				$("div.ui-dialog-titlebar button.ui-dialog-titlebar-close").delay( 800 ).trigger('click');
			});
		}
	};
})(jQuery, Drupal);

jQuery(document).ready(function($) {
	var height = getWindowHeight();
	resizeMap(height);
	$('#focus_details_right').css('height', height);
	
	$("div.info-link").on("click", function(e) {
		if ($(this).hasClass("active-chart-button")){
			$(this).removeClass("active-chart-button");
			$(this).closest("div.chart-wrapper").find("div.info-hidden").hide("fast");
		} else {
			$("div.active-chart-button").removeClass('active-chart-button');
			$("div.info-hidden:visible").hide(); //hide any info boxes that may be open
			$(this).addClass("active-chart-button");
			$(this).closest("div.chart-wrapper").find("div.info-hidden").show("fast");
			$("div.chart-large:visible").hide();
		}
	});
	$("div.graph-link").on("click", function(e) {
		if ($(this).hasClass("active-chart-button")){
			$(this).removeClass("active-chart-button");
			$(this).closest("div.chart-wrapper").find("div.chart-large").hide();
		} else {
			$("div.active-chart-button").removeClass("active-chart-button");//rest other chart buttons
			$(this).addClass("active-chart-button"); //activate this one
			$("div.info-hidden:visible").hide(); //hide any info boxes that may be open
			$("div.chart-large").hide(); //hide any other charts that may be open
			$(this).closest("div.chart-wrapper").find("div.chart-large").show(); //show this chart box
			var indicatorID = $(this).closest("div.chart-wrapper").find(".nid").text().trim(); 
			var activeIndicator = $.inArray(indicatorID, CountrySettings.selIndicators);
			sparkLine = false;
			//getCountryRestResults(activeIndicator);
			var indicator = CountrySettings.selIndicators[activeIndicator];
			getCountryChart(activeIndicator, indicator, 0);
		}
	});
	
	$('div.map-link').on("click", function(e) {
		if ($(this).hasClass("active-chart-button")){
			$(this).removeClass("active-chart-button");
			chartLayersToRemove();
		} else {
			$("div.map-link.active-chart-button").removeClass("active-chart-button");
			$(this).addClass("active-chart-button");
			addChartLayers();
		}
	});

	$( "#accordion" ).accordion({
	  collapsible: true,
	  active: false,
	  heightStyle: "content",
	  activate: checkForCharts, 
	  create: checkForCharts
	});
	//$( "#focus-tabs" ).tabs({heightStyle: "content", activate: changeTheDataAndLayers, create: createIndiCardTabs});
	$( "#focus-tabs" ).tabs({
	  collapsible: true,
	  activate: checkForCharts, 
	  create: checkForCharts
	});
	
	function checkForCharts(){
		//initiateToolTips();
		if ($( ".views-col:visible" ).length){
			$(".views-col:visible").each(function(index) {
				$('a[data-toggle="tooltip"]').tooltip({
					template: tipTopTemplate,
					placement: "top",
					delay: 200,
					trigger:"hover",
					html: true,
				});
				var indicatorName = $.trim($(this).find(".field--name-title").text());
				var indicatorClass = indicatorName.replace(/\s/g, "-");
				var indicatorID = $.trim($(this).find(".nid").text().trim());
				var activeIndicator = $.inArray(indicatorID, CountrySettings.selIndicators);
				if (activeIndicator == -1) {
					CountrySettings.selIndicators.push(indicatorID);
					//for each of these we work our way up from the active url. then find the field we need. This is due to the way drupal views generates the table
					//temp - as not all charts are complete we check if a series AND URL exists to do the chart
					var indicatorRESTurl = $(this).find(".field--name-field-data-rest-url").text();
					CountrySettings.selIndicatorRESTurl.push(indicatorRESTurl);
					var mapLayerField = $(this).find( ".field--name-field-data-map-attribute-link.field__item" ).text();
					if ( mapLayerField.length ) CountrySettings.mapLayerField.push(mapLayerField);
					var mappedField = $(this).find( ".field--name-field-data-rest-map-field-link.field__item" ).text();
					if ( mappedField.length ) CountrySettings.mappedField.push(mappedField);
					var mapPoints = $(this).find( ".field--name-field-indicator-make-map-points.field__item" ).text().trim();
					if ( mapPoints.length ) CountrySettings.mapPoints.push(mapPoints);
					var indicatorXaxis = $(this).find(".chart-xaxis").text().trim();
					try {
						indicatorXaxis = JSON.parse(indicatorXaxis);
					} catch (e) {
						indicatorXaxis = '{}';
					}
					CountrySettings.selIndicatorXaxis.push(indicatorXaxis);
					var indicatorYaxis = $(this).find(".chart-yaxis").text().trim();
					try {
						indicatorYaxis = JSON.parse(indicatorYaxis);
					} catch (e) {
						indicatorYaxis = '{}';
					}	
					CountrySettings.selIndicatorYaxis.push(indicatorYaxis);
					if ( $(this).find( ".field--name-field-chart-bl-sort" ).length ){
						CountrySettings.sort.push( $(this).find( ".field--name-field-chart-bl-sort.field__item" ).text().trim() );
					} else {
						CountrySettings.sort.push("none");
					}
					var indicatorSeries = $(this).find(".chart-series").text().trim();
					indicatorSeries = indicatorSeries.replace(/(}\s*\s)+/g, "}||").split("||");
					indicatorSeries.forEach(function(object, index){
						try {
							indicatorSeries[index] = JSON.parse(object);
						} catch (e) {
							indicatorSeries[index] = '{}';
						}	
					});	
					CountrySettings.selIndicatorChartSeries.push(indicatorSeries);
					var indicatorCountries = $(this).find(".indicator-countries").text();
					var indicatorCountriesArray = indicatorCountries.split(", ");
					CountrySettings.selIndicatorCountries.push(indicatorCountriesArray);
					var indicatorImages = $(this).find('img').attr('src');
					CountrySettings.selIndicatorImages.push(indicatorImages);
					var restCheck = $.inArray(indicatorID, CountrySettings.selIndicators);
					if (CountrySettings.selIndicatorRESTurl[restCheck] != null){
						setTimeout(getCountryRestResults(restCheck), 1000)
					}
				} else {
					var restCheck = $.inArray(indicatorID, CountrySettings.selIndicators);
					var indicator = CountrySettings.selIndicators[restCheck];
					setTimeout(getCountryChart(restCheck, indicator, 0), 1000)
				}

			});
		}
		if ($( ".indicator-chart:visible" ).length){
			$( ".indicator-chart:visible" ).each(function( index ) {
			  var chartID = $(this).attr("id");
			  buildIndicatorChart(chartID);
			});
		}
	}
	function buildIndicatorChart(containerID){
		switch(containerID){
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
	function addChartLayers(){
		var tabLayerKey;
		chartLayersToRemove();
		if ($( ".chart-layers" ).length){
			tabLayerKey = '-b10p4m4';
			//I change the map layer loading to be different
			var mapLayersArray = [];
			var mapLayer;
			$( ".chart-layers" ).children().each(function () {
				try {
					mapLayer = JSON.parse($(this).text().trim().replace("'", "\""))
					mapLayer.id = mapLayer.id + tabLayerKey;
					//console.log(mapLayer)
					//we need to know if the current source has already been added, and if so make sure it's referenced rather then added again.
					var currentSources = thisMap.style.sourceCaches
					for (var key in currentSources) {
						if (currentSources[key].id == mapLayer.source) {
							mapLayer.source = currentSources[key].id;
						} 
					}
					thisMap.addLayer(mapLayer, 'gaulACP'); 
				} catch (e) {
					console.log("You have a messed up layer for the card")
					mapLayer = '{}'; 
				}	
			});
		}
	}
	function chartLayersToRemove(){
		var currentLayers = thisMap.style._layers;
		for (var key in currentLayers) { 
			if (currentLayers[key].id.indexOf('-b10p4m4') != -1) {
				//add the source of this custom layer to an array. If it's not already in the array
				//we do this to be able to quickly check which sources may still be in use later and remove the unused ones.
				thisMap.removeLayer(currentLayers[key].id);
			} 
		}
		var currentSources = thisMap.style.sourceCaches;
		//so far all the custom sources are being removed regardless of the array defined above... TODO
		for (var key in currentSources) { 
			if (currentSources[key].id.indexOf('-b10p4m4') != -1) {
				thisMap.removeSource(currentSources[key].id);
			} 
		} 
	}
/* 	function getWbRestData(containerID, RESTArg, resultType = "chart", round = true){
		var seriesData;
		var restURL = "https://api.worldbank.org/v2/countries/"+selSettings.ISO3+"/indicators/"+RESTArg+"?format=json&MRNEV=1"
		if (resultType == "chart") restURL = restURL + '0';
		jQuery.ajax({
			url: restURL,
			dataType: 'json',
			success: function(d) {
				var wbData = [];
				var wbYear = [];
				var wbTitle = "none";
				if (resultType == "chart"){
					jQuery(d[1]).each(function(i, data) {
						wbData.push(data.value);
						wbYear.push(data.date);
					});
					wbTitle = d[1][0].indicator.value;
					var DOPAChart = echarts.init(document.getElementById(containerID+"-chart"));
					wbData.reverse();
					wbYear.reverse();
					var option = {
						color: ['#8fbf4b','#679b95'],
						grid: {
							left: '2%',
							top: 5,
							right: '2%',
							bottom: 5,
						},
						tooltip: {
							trigger: 'axis',
							axisPointer: {
								type: 'line', // 'line' | 'shadow'
							},
							confine: true
						},
						xAxis: {
							type: 'category',
							axisLabel: {'show': false},
							axisTick: {'show': false},
							data: wbYear
						},
						yAxis: {
							type: 'value',
							axisLabel: {'show': false},
							axisTick: {'show': false},
						},
						series: [{
							data: wbData,
							type: 'line',
							smooth: true
						}]
					};
					DOPAChart.setOption(option);
				} else {
					wbData = d[1][0].value;
					if (round == true) wbData = precise(wbData, 2);
					wbYear = d[1][0].date;
					wbTitle = d[1][0].indicator.value;
					jQuery("#"+containerID+"-number").text(wbData)
					jQuery("#"+containerID+"-year").text("("+wbYear+")")
					jQuery("#"+containerID+"-number").formatNumber({
					  cents: '.',
					  decimal: ','
					});
				}
				jQuery("#"+containerID+"-title").text(wbTitle);
				
			}
		});	
	}
	function getDOPAPaNums(){
		var restURL = "https://rest-services.jrc.ec.europa.eu/services/d6dopa30/administrative_units/get_country_pa_count?c_un_m49="+selSettings.NUM+"&format=json";
		jQuery.ajax({
			url: restURL,
			dataType: 'json',
			success: function(d) {
				console.log(d)
				jQuery("#costal-pas").text(d.records[0].pa_count_polygons_coastal)
				jQuery("#marine-pas").text(d.records[0].pa_count_polygons_marine)
				jQuery("#terrestrial-pas").text(d.records[0].pa_count_polygons_terrestrial)
				jQuery("#total-pas").text(d.records[0].pa_count)
			}
		});	
	}
	function getCountryProtCon(type){
		var restURL = "https://rest-services.jrc.ec.europa.eu/services/d6dopa/administrative_units/get_country_protection_protconn?c_un_m49="+selSettings.NUM+"&format=json&includemetadata=false";
		jQuery.ajax({
			url: restURL,
			dataType: 'json',
			success: function(d) {
				var paChartVal;
				var title;
				var distanceToGo = 0;
				var distanceOver = 0;
				var TerMarGoal;
				if (type == "terrestrial-prot-chart"){
					paChartVal = parseInt(d.records[0].terrestrial_protected_perc, 10);
					TerMarGoal = 17;
					title = "Terrestrial";
				} else {
					paChartVal = parseInt(d.records[0].marine_protected_perc, 10);
					TerMarGoal = 10;
					title = "Marine";
				}
				var originalVal = paChartVal;
				if (paChartVal < TerMarGoal){
					distanceToGo = TerMarGoal - paChartVal;
				}
				if (paChartVal >= TerMarGoal){
					distanceOver = paChartVal - TerMarGoal;
					paChartVal = TerMarGoal;
				}
				var DOPAChart = echarts.init(document.getElementById(type));
				var inverseVal = 100 - paChartVal - distanceToGo - distanceOver;
				option = {
					title: {
						text: originalVal+'%',
						left: '39%',
						top: '40%',
						z: 1,
					},
					series: [
						{
							name:'back',
							type:'pie',
							radius: ['60%', '90%'],
							label: {
								normal: {show: false},
								emphasis: {show: false,}
							},
							labelLine: {
								normal: {show: false}
							},
							data:[
								{value:100, name:'back',itemStyle: {color: '#ccc',}},
							],
							silent: true,
						},
						{
							name:'front',
							type:'pie',
							radius: ['65%', '85%'],
							avoidLabelOverlap: false,
							label: {
								normal: {
									show: false,
									position: 'center'
								},
								emphasis: {
									show: true,
									textStyle: {
										fontSize: '20',
										fontWeight: 'bold'
									}
								}
							},
							labelLine: {
								normal: {
									show: false
								}
							},
							data:[
								{value: paChartVal, name: paChartVal+' %',itemStyle: {color: '#679b95',},
									label: {fontSize: 18,backgroundColor: "#fff", width: "50px"}
								},
								{value: distanceToGo, name: distanceToGo+' %',itemStyle: {color: '#000',},label: {backgroundColor: "#fff", width: "50px"}
								},
								{value: distanceOver, name: distanceOver+' %',itemStyle: {color: '#90c14f',},label: {backgroundColor: "#fff", width: "50px"}
								},
								{value:inverseVal, 
								name:'back',
								emphasis: {
									label: {show: false},
									itemStyle: {color: '#ccc',}
								},
								itemStyle: {color: '#ccc',}
								},
							],
							//animation: false,
						}
					]
				};
				DOPAChart.setOption(option);
			}
		});	
	} */
	
});