jQuery(document).ready(function($) {
	$( ".view-breadcrumb-country-summary" ).ready(function() {
		if ($( ".view-breadcrumb-country-summary:visible" ).length){
			selSettings.countryName = jQuery('.scope-summary-title').text().trim();
			selSettings.ISO2 = jQuery('.country-iso2-value').text().trim();
			selSettings.ISO3 = jQuery('.country-iso3-value').text().trim();
			selSettings.NUM = jQuery('.country-num-value').text().trim();
			poulateCountryCard();
		}
	});
	$( ".view-breadcrumb-protected-area-summary:visible" ).ready(function() {
		if ($( ".view-breadcrumb-protected-area-summary:visible" ).length){
			selSettings.WDPAID = parseInt(jQuery('.wdpaid-value').text().trim(), 10);
			selSettings.paName = jQuery('.scope-summary-title').text().trim();
			poulatePaCard();
		}
	});
	$( ".view-breadcrumb-region-summary:visible" ).ready(function() {
		if ($( ".view-breadcrumb-region-summary:visible" ).length){
			selSettings.regionID = jQuery('.views-field-field-region-id').text().trim();
			poulateRegionCard();
		}
	});	
});

function poulateCountryCard(){
	console.log("country card")
	jQuery( "div.tooltip-ter" ).tooltip({
		trigger:"hover",
		html: true,
		placement: "right",
		title:"CBD Target 11. Progress towards goal of protecting 17% of Terrestrial Areas.<br><div style='text-align: left;'><span style='color:#679b95;'>Blue</span> = Area protected towards the target<br><span style='color:#000;'>Black</span> = Area remaining<br><span style='color:#8fc04f;'>Green</span> = Area protected in addition to the target goal</div>",
		delay: 200,
		template: tipTemplate
	});
	jQuery( "div.tooltip-mar" ).tooltip({
		trigger:"hover",
		html: true,
		placement: "right",
		title:"CBD Target 11. Progress towards goal of protecting 10% of Marine Areas.<br><div style='text-align: left;'><span style='color:#679b95;'>Blue</span> = Area protected towards the target<br><span style='color:#000;'>Black</span> = Area remaining<br><span style='color:#8fc04f;'>Green</span> = Area protected in addition to the target goal</div>",
		delay: 200,
		template: tipTemplate
	});
	getWbRestData("wb-total-pop", "SP.POP.TOTL", "number", false);
	getWbRestData("wb-area", "AG.LND.TOTL.K2", "number");
	getWbRestData("wb-gdp", "NY.GDP.PCAP.PP.CD", "number");
	getWbRestData("wb-gdp-growth", "NY.GDP.MKTP.KD.ZG", "number");
	getDOPAPaNums();
	getCountryProtCon();
	//getCountryProtCon("marine-prot-chart");	
	//Drupal.attachBehaviors(jQuery(".view-breadcrumb-country-summary:visible"));		
}
function poulatePaCard(){
	makeDOPARadar("pa-radar");
	//Drupal.attachBehaviors(jQuery(".view-pa-management-plan"));		
}
function poulateRegionCard(){
	//Drupal.attachBehaviors(jQuery(".view-breadcrumb-region-summary:visible"));		
}

function getWbRestData(containerID, RESTArg, resultType = "chart", round = true){
	var seriesData;
	var restURL = "https://api.worldbank.org/v2/countries/"+selSettings.ISO3+"/indicators/"+RESTArg+"?format=json&MRNEV=1";
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
				//console.log(wbData);
				if (round == true) wbData = precise(wbData, 2);
				wbYear = d[1][0].date;
				wbTitle = d[1][0].indicator.value;
				jQuery("#"+containerID+"-number").text(wbData)
				//console.log(jQuery("#"+containerID+"-number"));
				jQuery("#"+containerID+"-year").text("("+wbYear+")")
				jQuery("#"+containerID+"-number").formatNumber({
				  cents: '.',
				  decimal: ','
				});
			}
			jQuery("#"+containerID+"-title").text(wbTitle);
			
		},
		error: function() {
			cardRestError("#"+containerID+"-title", "WorldBank");
		}
	});	
}
function getDOPAPaNums(){
	var restURL = DOPAgetPaNums+selSettings.ISO2;
	jQuery.ajax({
		url: restURL,
		dataType: 'json',
		success: function(d) {
			if (!Array.isArray(d.records) || !d.records.length) {
				jQuery("#costal-pas").html("<div class='small-error'>DOPA services not responding<div>");
			} else {
				var totalCoastalPas = parseInt(d.records[0].pa_count_polygons_coastal) + parseInt(d.records[0].pa_count_points_coastal);
				var totalMarPas = parseInt(d.records[0].pa_count_polygons_marine) + parseInt(d.records[0].pa_count_points_marine);
				var totalTerPas = parseInt(d.records[0].pa_count_polygons_terrestrial) + parseInt(d.records[0].pa_count_points_terrestrial);
				jQuery("#costal-pas").text(totalCoastalPas)
				jQuery("#marine-pas").text(totalMarPas)
				jQuery("#terrestrial-pas").text(totalTerPas)
				jQuery("#total-pas").text(d.records[0].pa_count)
			}
		},
		error: function() {
			cardRestError("#costal-pas", "DOPA");
		}
	});	
}
function getCountryProtCon(){
	var restURL = DOPAgetCountryProtCon+selSettings.ISO2;
	jQuery.ajax({
		url: restURL,
		dataType: 'json',
		success: function(d) {
			if (!Array.isArray(d.records) || !d.records.length) {
				cardRestError("#terrestrial-prot-chart", "DOPA");
				cardRestError("#marine-prot-chart", "DOPA");
			} else {
			var TerMarGoal;
			dopaProtConChart("terrestrial-prot-chart");
			dopaProtConChart("marine-prot-chart");
			function dopaProtConChart(type){
				var paChartVal;
				var distanceToGo = 0;
				var distanceOver = 0;
				var title;
				var DOPAChart = echarts.init(document.getElementById(type));
				if (type == "terrestrial-prot-chart"){
					paChartVal = parseFloat(d.records[0].area_prot_terr_perc, 10);
					TerMarGoal = 17;
					title = "Terrestrial";
				} else {
					paChartVal = parseFloat(d.records[0].area_prot_mar_perc, 10);
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
				distanceToGo = parseFloat(distanceToGo).toFixed(2);
				var inverseVal = 100 - paChartVal - distanceToGo - distanceOver;
				
				option = {
					title: {
						text: originalVal+'%',
						left: 'center',
						top: '42%',
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
			}
		},
		error: function() {
			cardRestError('#'+type, "DOPA");
		}
	});	
}
function makeDOPARadar(containerID){
		var restURL = DOPAgetRadarPlot+selSettings.WDPAID
		jQuery.ajax({
			url: restURL,
			dataType: 'json',
			success: function(d) {
				if (d.metadata.recordCount == 0) {
					jQuery('#'+containerID).text("No records for " + selSettings.paName);
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
					var option = {
						tooltip: {},
						color: ['#8fbf4b','#679b95'],
						legend: {
							data: ['Protected Area', 'Country Average'],
							left:  '0'
						}, 
						radar: {
							indicator: seriesTitle,
							radius: '70%',
						},
						series: [{
							//name: 'DOPA stats for' + selSettings.paName,
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
							],
							tooltip: {
								position: [10, 10],
							},
						}]
					};
					DOPAChart.setOption(option);
				}
			},
			error: function() {
				cardRestError('#'+containerID, "DOPA");
			}
		});	
}
function makeDOPAAvgClimate(containerID){
	var restURL = DOPAavgClimate+selSettings.WDPAID;
	
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
							formatter: '{value} C'
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

function cardRestError(attr, restPointer){
	jQuery(attr).html("<div class='small-error'>" + restPointer + " services not responding<div>");	
}