
//initiates the chart building
function getChart(error = 0){
	if (error == 0 ){
		//delete any old errors now that we have success
		jQuery( ".rest-error" ).empty();
		jQuery( ".indicator-chart" ).show();
		currentCardScope = jQuery("#pa-card-tabs li.ui-tabs-active").text().trim().toLowerCase();
		if (currentCardScope == "protected area"){
			currentCardScope = "pa";
		}
		//destroy any active charts, this is to remove any active events that might be attached to them, it also looks nicer with the animations being refreshed.
		//echarts.dispose(document.getElementById('indicator-chart-'+CurrentCardScope));
		indicatorChart = echarts.init(document.getElementById('indicator-chart-'+currentCardScope));
		//if there's a chart already unbind all the events attached to it. 
		//this stops the events being carried over from other countries, making the chart navigation buggy.
		//the events will be readded as needed below
		if (indicatorChart.id != null){
			indicatorChart.off();
		}
		//indicatorChart.disconnect();
		//initalize the chart library and attach it to the correct div
		
		//show the chart, in case it was hidden from a previous error
		switch(currentCardScope) {
		case "global":
			prepGlobalChart();
			break;
		case "regional":
			prepRegionalChart();
			break;
		case "pa":
			prepPaChart();
			break;
		default:	//the country charts are the default for now....
			prepCountryChart();
		}
	} else {
		chartError(error)
	}	
	
}

function chartError(error){
	//we hide the chart because it has a fixed size, and if it's empty (from the error) it takes too much space and looks funny.
	jQuery( ".indicator-chart" ).hide();
	if(error == 2){
		var scopeNeeded = '';
		switch(selData.map.mapScope){
			case 'local':
				scopeNeeded = "protected area";	
				break;
			case 'regional':
				scopeNeeded = "region";
				break;
			case 'national':
				scopeNeeded = "country";
				break;
			default:
				scopeNeeded = "area";
				console.log("map feature not detected for zoom event");
				break;
		}
		var currentScope = jQuery("ul.indicator-card-tabs").children(".ui-tabs-active").first().text();
		if(((selSettings.regionID != null) && (currentScope == "Regional")) || ((selSettings.ISO2 != null) && (currentScope == "Country")) || ((selSettings.WDPAID > 0) && (currentScope == "Protected Area"))){
			jQuery( ".rest-error" ).html("<div class='alert alert-info'>No results were found.<br>"+
			"Try selecting a different <b>" + scopeNeeded + "</b></div>");
		} else {
			jQuery( ".rest-error" ).html("<div class='alert alert-info'>You must select a <b>" + scopeNeeded + "</b> in the map.</div>");
		}	
	} else {
		jQuery( ".rest-error" ).html("<div class='alert alert-warning'>There was an error.</div>");
	}
}

function minimizeChart(){
  jQuery( ".activeSelection").first().next().trigger( "click" );
  //updateBreadIndicator("NA");
}
function sortByKey(array, key, order='asc') {
    return array.sort(function(a, b, order) {
		if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
		  // property doesn't exist on either object
			return 0; 
		}
		const varA = (typeof a[key] === 'string') ? 
		  a[key].toUpperCase() : a[key];
		const varB = (typeof b[key] === 'string') ? 
		  b[key].toUpperCase() : b[key];

		//console.log(varA + "  " + varB)
		let comparison = 0;
		if (varA > varB) {
		  comparison = 1;
		} else if (varA < varB) {
		  comparison = -1;
		}
		//console.log(comparison)
		return (
		  (order == 'desc') ? (comparison * -1) : comparison
		);
	});
}

function checkChartData(chartType = "barLine"){
	//we take the REST results and put it into a new variable, this ensures the original results are stored unmodified.
	var indicatorResults = selData.chart.RESTResults;
	
	//if this is a country linked visualisation, lets clean the results to ensure only ACP countries are showing in the chart.
	if (selData.chart.mapLayerField  == 'un_m49') {
		indicatorResults = indicatorResults.filter(ACPNUMFilter);
	}
	if (selData.chart.mapLayerField  == 'iso3') {
		indicatorResults = indicatorResults.filter(ACPISO3Filter);
	}
	if (selData.chart.mapLayerField  == 'iso2') {
		indicatorResults = indicatorResults.filter(ACPISO2Filter);
	}
	function ACPISO2Filter(value) {
		var acpIso2 = ["AO", "AG", "BS", "BB", "BZ", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM", "CG", "CD", "CK", "CI", "CU", "DJ", "DM", "DO", "GQ", "ER", "ET", "FJ", "GA", "GM", "GH", "GD", "GN", "GW", "GY", "HT", "JM", "KE", "KI", "LS", "LR", "MG", "MW", "ML", "MH", "MR", "MU", "FM", "MZ", "NA", "NR", "NE", "NG", "NU", "PW", "PG", "RW", "KN", "LC", "VC", "WS", "ST", "SN", "SC", "SL", "SB", "SO", "ZA", "SS", "SD", "SR", "SZ", "TZ", "TL", "TG", "TO", "TT", "TV", "UG", "VU", "ZM", "ZW"];
		return acpIso2.indexOf(value[selData.chart.mappedField]) > -1
	}
	function ACPISO3Filter(value) {
		var acpIso3 = ["AGO", "ATG", "BHS", "BRB", "BLZ", "BEN", "BWA", "BFA", "BDI", "CMR", "CPV", "CAF", "TCD", "COM", "COG", "COD", "COK", "CIV", "CUB", "DJI", "DMA", "DOM", "GNQ", "ERI", "ETH", "FJI", "GAB", "GMB", "GHA", "GRD", "GIN", "GNB", "GUY", "HTI", "JAM", "KEN", "KIR", "LSO", "LBR", "MDG", "MWI", "MLI", "MHL", "MRT", "MUS", "FSM", "MOZ", "NAM", "NRU", "NER", "NGA", "NIU", "PLW", "PNG", "RWA", "KNA", "LCA", "VCT", "WSM", "STP", "SEN", "SYC", "SLE", "SLB", "SOM", "ZAF", "SSD", "SDN", "SUR", "SWZ", "TZA", "TLS", "TGO", "TON", "TTO", "TUV", "UGA", "VUT", "ZMB", "ZWE"];
		return acpIso3.indexOf(value[selData.chart.mappedField]) > -1
	}
	function ACPNUMFilter(value) {
		var acpNUM = ["24", "28", "44", "52", "84", "204", "72", "854", "108", "120", "132", "140", "148", "174", "178", "180", "184", "384", "192", "262", "212", "214", "226", "232", "231", "242", "266", "270", "288", "308", "324", "624", "328", "332", "388", "404", "296", "426", "430", "450", "454", "466", "584", "478", "480", "583", "508", "516", "520", "562", "566", "570", "585", "598", "646", "659", "662", "670", "882", "678", "686", "690", "694", "90", "706", "710", "728", "736", "740", "748", "834", "626", "768", "776", "780", "798", "800", "548", "894", "716"].indexOf(value[selData.chart.mappedField]) > -1
	}

	if(selData.chart.sort == "Ascending"){
		sortByKey(indicatorResults, selData.chart.chartSeries[0].data, 'asc');
	} 
	if(selData.chart.sort == "Descending"){
		sortByKey(indicatorResults, selData.chart.chartSeries[0].data, 'desc');
	}

	//make a copy of the xaxis to modify
	var xAxis = jQuery.extend( true, {}, selData.chart.Xaxis );

	//if it's a year field we sort it. This overrides what the user may have defined because it's important to standardise how the dates are displayed.
	if ((xAxis.data == "timePeriodStart") || (xAxis.data == "Year")){
		sortByKey(indicatorResults, xAxis.data, 'asc');
	}
	
	//here we replace the x axis data placeholder with the array of values from the rest service. We only do this if they have assigned a vlaue to that axis.
	if (typeof xAxis['data'] !== 'undefined'){
		var xAxisData = [], testDate, fullDate;
		indicatorResults.forEach(function(object){
			//get the date - it could be a simple year, e.g. 2012 or more complex, e.g. 2016/04/16 - cant get date types to work in echarts
			// testDate = object[xAxis['data']];
			// if (testDate.length === 4){ //assumption is that if the test date is 4 characters long then it is a year
			//   fullDate = new Date(testDate, 11, 31); //month index and date
			// }else{
			//   fullDate = new Date(testDate);
			// }
			// xAxisData.push(fullDate.toLocaleString());
			xAxisData.push(object[xAxis['data']]);
		});
		xAxis['data'] = xAxisData;
	}
	
	var yAxis = jQuery.extend( true, {}, selData.chart.Yaxis );
	//here we replace the y axis data placeholder with the array of values from the rest service. We only do this if they have assigned a vlaue to that axis.
	if (typeof yAxis['data'] !== 'undefined'){
		var yAxisData = [];
		indicatorResults.forEach(function(object){
			yAxisData.push(object[yAxis['data']]);
		});
		yAxis['data'] = yAxisData;
	}
	
	var mappedField = [];
	indicatorResults.forEach(function(object){
		if(selData.chart.mapLayerField  == 'WDPAID'){
			mappedField.push(parseInt(object[selData.chart.mappedField]));
		} else {
			mappedField.push(object[selData.chart.mappedField]);
		}
		
	});
	
	//first we get the list of all data series defined in the indicator content type
	//we push these to the chartSeries array
	var chartSeries = [];
	
	//had a killer time trying to figure out why this damn thing wasn't cloning using other methods. Just leave it like this
	var data = JSON.parse(JSON.stringify(selData.chart.chartSeries));
	for (var key2 in data) {
		// skip loop if the property is from prototype
		if (!data.hasOwnProperty(key2)) continue;
		var obj = data[key2];
		for (var prop in obj) {
			// skip loop if the property is from prototype
			if(!obj.hasOwnProperty(prop)) continue;
			if (prop=='data'){
				//replace the placeholder of the series map with the actual array from the rest service 
				//obj[prop] = indicatorResults[obj[prop]];
				chartSeries.push(obj[prop])
				//console.log(prop + " = " + obj[prop]);
			}
		}
	}
	
	//here we exchange the field labels in the array with arrays of the field values. 
	chartSeries.forEach(function(object, index){
		var chartData = [];
		indicatorResults.forEach(function(object2){
			chartData.push(object2[chartSeries[index]]);
			//console.log(object2[chartSeries[index]])
		});
		chartSeries[index]=chartData;
	});
	
	//Now we got back into the original results and replace the series data with the arrays 
	//we push these to the chartSeries array
	for (var key2 in data) {
		// skip loop if the property is from prototype
		if (!data.hasOwnProperty(key2)) continue;
		var obj = data[key2];
		for (var prop in obj) {
			// skip loop if the property is from prototype
			if(!obj.hasOwnProperty(prop)) continue;
			if (prop=='data'){
				//replace the placeholder of the series map with the actual array from the rest service 
				obj[prop] = chartSeries[key2];
				//console.log(prop + " = " + obj[prop]);
			}
		}
	}
	
	data[0]['mapFeature'] = mappedField;
	data[0]['emphasis'] = {itemStyle: {color: '#ff6600'}};		

	chartSettings['xAxis'] = xAxis;
	chartSettings['yAxis'] = yAxis;
	chartSettings['data'] = data;
	return chartSettings;
}
function checkForChartType(chartTab){
	if ((jQuery( "div.field--name-field-indi-data-"+chartTab+" div.chart-bar-line" ).length) || (jQuery( "div.field--name-field-indi-get-data-from .field__item").text() == "BIOPAMA Geonode")){
		makeBarLineChart();
	} 
	else if (jQuery( "div.field--name-field-indi-data-"+chartTab+" div.chart-2d-scatter" ).length){
		makeScatterChart();
	} 
//	if (jQuery( "div.field--name-field-indi-data-"+chartTab+" div.node--type-chart-doughnut" ).length){
	else {
		makeDoughnutChart();
	}
}

function prepCountryChart(){
	//Any custom that we want to have at the country level can be done here.
	if (selSettings.ISO2 != null) {
		//we update the Country Name in the card
		jQuery("span.indicator-country").text(selSettings.countryName)
		checkForChartType("national");
	} else {
		//if there's a previously created country chart, kill it
		echarts.dispose(document.getElementById('indicator-chart-country'));
		jQuery( ".indicator-chart" ).hide();
		jQuery( ".rest-error-country" ).html("<div class='alert alert-info'>There is no Country currently selected, Try selecting one on the map.</div>");
	}
}
function highlightMapFeature() {
	if (jQuery("#block-indicatorcard article:visible").length) {
		if (indicatorChart.length == 0){
			return;
		} else {
			indicatorChart.dispatchAction({
				type: 'downplay',
				//It removes highlighting on upto 9 data series, it's unlikely there will be more...
				seriesIndex: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
			});
			switch(selData.chart.mapLayerField){
				case 'WDPAID':
					if (selSettings.WDPAID > 0){
						indicatorChart.dispatchAction({
							type: 'highlight',
							//dataIndex: chartSettings.data[0].mapFeature.findIndex(wdpaEquals)
							dataIndex: jQuery.inArray( selSettings.WDPAID, chartSettings.data[0].mapFeature )
						});
					}
					if (wdpaAcpHover.length > 0){
						for (var key in wdpaAcpHover) {
							indicatorChart.dispatchAction({
								type: 'highlight',
								dataIndex: jQuery.inArray( wdpaAcpHover[key], chartSettings.data[0].mapFeature )
							});
						}
					}
					break;
				case 'iso2':
					if (selSettings.ISO2 !== null){
						indicatorChart.dispatchAction({
							type: 'highlight',
							//dataIndex: chartSettings.data[0].mapFeature.findIndex(wdpaEquals)
							dataIndex: jQuery.inArray( selSettings.ISO2, chartSettings.data[0].mapFeature )
						});
					}
					if (countryHover2.length > 0){
						indicatorChart.dispatchAction({
							type: 'highlight',
							dataIndex: jQuery.inArray( countryHover2, chartSettings.data[0].mapFeature )
						});
					}
					break;
				case 'iso3':
					if (selSettings.ISO2 !== null){
						indicatorChart.dispatchAction({
							type: 'highlight',
							//dataIndex: chartSettings.data[0].mapFeature.findIndex(wdpaEquals)
							dataIndex: jQuery.inArray( selSettings.ISO3, chartSettings.data[0].mapFeature )
						});
					}
					if (countryHover3 !== null){
						indicatorChart.dispatchAction({
							type: 'highlight',
							dataIndex: jQuery.inArray( countryHover3, chartSettings.data[0].mapFeature )
						});
					}
					break;
				case 'un_m49':
					if (selSettings.ISO2 !== null){
						indicatorChart.dispatchAction({
							type: 'highlight',
							//dataIndex: chartSettings.data[0].mapFeature.findIndex(wdpaEquals)
							dataIndex: jQuery.inArray( selSettings.NUM, chartSettings.data[0].mapFeature )
						});
					}
					if (countryHoverNum !== null){
						indicatorChart.dispatchAction({
							type: 'highlight',
							dataIndex: jQuery.inArray( countryHoverNum, chartSettings.data[0].mapFeature )
						});
					}
					break;
				case 'Group':
					if (selSettings.regionID !== null){
						indicatorChart.dispatchAction({
							type: 'highlight',
							//dataIndex: chartSettings.data[0].mapFeature.findIndex(wdpaEquals)
							dataIndex: jQuery.inArray( selSettings.regionID, chartSettings.data[0].mapFeature )
						});
					}
					if (regionHover !== null){
						indicatorChart.dispatchAction({
							type: 'highlight',
							dataIndex: jQuery.inArray( regionHover, chartSettings.data[0].mapFeature )
						});
					}
					break;
				default:
					console.log("map feature not detected for highlight event");
					break;
			}
			if ((selData.chart.mapLayerField == "WDPAID") && (selSettings.WDPAID > 0)){
				indicatorChart.dispatchAction({
					type: 'highlight',
					//dataIndex: chartSettings.data[0].mapFeature.findIndex(wdpaEquals)
					dataIndex: jQuery.inArray( selSettings.WDPAID, chartSettings.data[0].mapFeature )
				});
			}
			if ((selData.chart.mapLayerField == "WDPAID") && (wdpaAcpHover.length > 0)){
				for (var key in wdpaAcpHover) {
					indicatorChart.dispatchAction({
						type: 'highlight',
						dataIndex: jQuery.inArray( wdpaAcpHover[key], chartSettings.data[0].mapFeature )
					});
				}
			}
		}
	}
}

function getChartMappedFields(chart, dataSeries){
	var option = chart.getOption();
	
	if (dataSeries == 1){
		//console.log("start: " + option.dataZoom[0].startValue + " End: " + option.dataZoom[0].endValue)
		var MappedSeriesArray = option.series[0].data;
		var MappedSeriesZoom = MappedSeriesArray.slice(option.dataZoom[0].startValue, option.dataZoom[0].endValue + 1);
		return MappedSeriesZoom;
	} else {
		//console.log("start: " + option.dataZoom[0].startValue + " End: " + option.dataZoom[0].endValue)
		var MappedFieldsArray = option.series[0].mapFeature;
		var MappedFieldsZoom = MappedFieldsArray.slice(option.dataZoom[0].startValue, option.dataZoom[0].endValue + 1);
		return MappedFieldsZoom;
	}
}

function mapTheIndicator(mapData){
	var MappedFieldsZoom = getChartMappedFields(indicatorChart);
	var MappedSeriesZoom = getChartMappedFields(indicatorChart, 1);
	var mapFilter = buildFilter(MappedFieldsZoom, 'in', selData.chart.mapLayerField);
	userPointToggle = 0;
	
	//if a card is open, and it has a toggle box, check it out.
	if (jQuery("#block-indicatorcard article:visible").length){
		if (jQuery('.indicator-make-points .form-control:visible').is(':checked')){
			userPointToggle = 1;
		} 
	}
	
	//we separate the types of map/chart connections into two types:
	//IF centroid is selected we will try to make a new layer of points...
	//ELSE we interact with the already present vecor layers
	if (userPointToggle == 1){
		mapPoints(mapFilter, mapData)
	} else {
		/* if (chart3D == true){
			map3D(MappedFieldsZoom, MappedSeriesZoom)
		} else {
			
		} */
		map2D(MappedFieldsZoom, MappedSeriesZoom)
	}
}

function map2D(MappedFieldsZoom, MappedSeriesZoom){
	removelayergroup();
	dataPoints = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: []}
	
	//var dataHighCurve = [0,50]
	
	if (customStopAmnt == 0){
		mapColors = colorbrewer.diverging[2][9];
	} else {
		mapColors = colorbrewer.diverging[2][customStopAmnt];
	}
	var mapColorCopy = mapColors.slice(0);
	if (((selData.chart.invertColors == "No") && (chartColorInvertedCheck == 0)) || (chartColorInvertedCheck == 1)){
		chartColorInvertedCheck = 1;
		mapColorCopy.reverse(); 
	} 
	if (mapMarkers.length > 0){
		resetMapPoints();
	}
	//filter the map based on the user defined field in the indicator (filter)
	if (['un_m49', 'iso3', 'iso2', 'WDPAID', 'Group'].indexOf(selData.chart.mapLayerField) >= 0) {
		thisMap.setPaintProperty("wdpaAcpFillHighlighted", "fill-opacity", 0);
		//remove the layers that may exsist that were previously added by this function.	
		if (customStopPoints.length > 1) {
			selectedStopPoints = customStopPoints;
		} else {
			selectedStopPoints = dataHighCurve;
		}
		var legendText = [];
		var filteredLegendText = [];
		var filteredLegendColors = [];
		jQuery(selectedStopPoints).each(function(index) {
			if (selectedStopPoints[index+1] != null) {
				legendText.push("=> "+selectedStopPoints[index] + " and < " + selectedStopPoints[index+1]);
			} else {
				legendText.push(" > " + selectedStopPoints[index])
			}
		});	
		jQuery(MappedFieldsZoom).each(function(i, data) {
			jQuery(selectedStopPoints).each(function(index) {
				if (selectedStopPoints[index+1] != null) {
					if ((MappedSeriesZoom[i] >= selectedStopPoints[index]) && (MappedSeriesZoom[i] < selectedStopPoints[index+1])){
						if(selData.chart.mapLayerField == "WDPAID"){
							dataPoints[index].push(parseInt(data));
						} else{
							dataPoints[index].push(data);
						}
					}
				} else {
					if (MappedSeriesZoom[i] >= selectedStopPoints[selectedStopPoints.length -1]){
						if(selData.chart.mapLayerField == "WDPAID"){
							dataPoints[selectedStopPoints.length -1].push(parseInt(data));
						} else{
							dataPoints[selectedStopPoints.length -1].push(data);
						}
					}
				}
			});
		});
		paintProp = ["match", ["get", selData.chart.mapLayerField]];
		for (var prop in dataPoints) {
			// skip loop if the property is from prototype
			if (!dataPoints.hasOwnProperty(prop)) continue;
			if (dataPoints[prop].length){ 
				paintProp.push(dataPoints[prop], mapColorCopy[prop]);
				filteredLegendText.push(legendText[prop]);
				filteredLegendColors.push(mapColorCopy[prop]);
			}
		}
		paintProp.push("rgba(0,0,0,0)");
		
		//var filteredLegendTextCopy = filteredLegendText.slice(0);
		//var filteredLegendColorsCopy = filteredLegendColors.slice(0);
		//buildMapLegend(filteredLegendTextCopy, filteredLegendColorsCopy);
		buildMapLegend(filteredLegendText, filteredLegendColors);
		//buildMapSlider(selectedStopPoints, mapColorCopy);
		updateIndicatorChart();
		
		var tempLayer = mapCountryLayer;
		if (selData.chart.mapLayerField == "WDPAID") tempLayer = mapPaLayer;
		if (selData.chart.mapLayerField == "Group") tempLayer = mapRegionLayer;
		thisMap.addLayer({
			"id": "1nd1l4y3r",
			"type": "fill",
			"source": "BIOPAMA_Poly",
			"source-layer": tempLayer,
			"layout": {
				"visibility": "visible"
			},
			'paint': {
				'fill-outline-color': paintProp,
				'fill-color': paintProp,
				'fill-opacity': 0.8,
				
			}
		}, 'gaulACP');
		thisMap.on('mousemove', "1nd1l4y3r", function (e) {
			if (e.features.length > 0) {
				if (jQuery(".indicator-chart:visible").length){
					highlightMapFeature();
				}
			} 
		});
		thisMap.on("mouseleave", "1nd1l4y3r", function() {
			thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'none');
			if (jQuery(".indicator-chart:visible").length){
				highlightMapFeature();
			}
		});
	} else if (['STATUS_YR'].indexOf(selData.chart.mapLayerField) >= 0){
		thisMap.setFilter("wdpaAcpFillHighlighted", [ "all", buildFilter(MappedFieldsZoom, 'in', 'STATUS_YR'), ['==', 'ISO3', selSettings.ISO3] ]);
	} else if (selSettings.WDPAID > 0){
		if (currentTab == "Protected Area"){
			thisMap.setFilter("wdpaAcpFillHighlighted", [ "all", ['!=', 'WDPAID', selSettings.WDPAID], ['==', 'ISO3', selSettings.ISO3] ]);
			thisMap.setPaintProperty("wdpaAcpFillHighlighted", "fill-opacity", 0.5);
			//show layer again just incase it's been turned off by the point layer
			thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'visible');
		}	
	} else {
		if (currentTab == "Protected Area"){
			thisMap.setFilter("wdpaAcpFillHighlighted",['==', 'ISO3', selSettings.ISO3]);
			//show layer again just incase it's been turned off by the point layer
			thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'visible');	
		}
	}
}
function updateIndicatorChart(){
/* 	if (customStopPoints.length > 1) {
		selectedStopPoints = customStopPoints;
	} else {
		selectedStopPoints = dataHighCurve;
	}
	jQuery(chartSettings.data[0].data).each(function(i, data) {
		jQuery(selectedStopPoints).each(function(index) {
			console.log(chartSettings.data[0].data[i] + "     " + selectedStopPoints[index])
			if (selectedStopPoints[index+1] != null) {
				if ((chartSettings.data[0].data[i] >= selectedStopPoints[index]) && (chartSettings.data[0].data[i] < selectedStopPoints[index+1])){
					
					chartSettings.data[0].data[i]['itemStyle'] = {color: '#ff0000'};	
				}
			} else {
				if (chartSettings.data[0].data[i] >= selectedStopPoints[selectedStopPoints.length -1]){
					chartSettings.data[0].data[i]['itemStyle'] = {color: '#00ff00'};	
				}
			}
		});
	});
	console.log(chartSettings.data[0].data)
		
	var option = {
		series: chartSettings.data
	}; 
	indicatorChart.setOption(option);
	
	return; */
}
function removelayergroup(){
	jQuery("#map-bad-legend, #map-legend").hide();
	var currentLayers = thisMap.style._layers;
	for (var key in currentLayers) { 
		if (currentLayers[key].id.indexOf('1nd1l4y3r') != -1) {
			thisMap.removeLayer(currentLayers[key].id);
		} 
	}
}
function buildMapLegend(legText, legColor){
	jQuery("#map-legend").empty().show();
	jQuery(legText).each(function(index) {
		var legendUnit = "<div class='legend-unit' style='display: flex; padding: 5px;'>"+
			"<div class='legend-color' style='background-color: "+legColor[index]+"; width:20px; height:20px;'></div>"+
			"<div class='legend-text'>&nbsp;"+legText[index]+"</div>"+
		"</div>";
		jQuery("#map-legend").append( legendUnit );
	});	
}
function buildMapSlider(stopPoints, colors){
	//we clone the arrays to prevent inverting the original arrays
	//var stopCopy = stopPoints.slice(0);
	//we have to invert the colors each time due to the orientation of the bar
	//colorCopy.reverse(); 
	//stopCopy.reverse(); 
	//var colorCopy = colors.slice(0);
	
	if(jQuery('#slider-color').length){
		jQuery('#slider-color').remove();
		jQuery('#stop-point-wrapper').remove()
	}
	jQuery( "<div id='slider-color' style='height: 190px; position: absolute; top: 110px;'></div>" ).insertAfter( "#indicator-chart-country" );
	jQuery( "<div id='stop-point-wrapper'>Stop Points: <select id='stop-points' name='Stop Points'>"+
		"<option selected='true' disabled>Change the number</option><option value='2'>2</option>"+
		"<option value='3'>3</option>"+"<option value='4'>4</option>"+
		"<option value='5'>5</option>"+"<option value='6'>6</option>"+
		"<option value='7'>7</option>"+"<option value='8'>8</option>"+
		"<option value='9'>Reset to default</option>"+
	"</select></div>" ).insertAfter( "#indicator-chart-country" );
	if (customStopAmnt > 1) jQuery('#stop-points').val(customStopAmnt);
	var slider = document.getElementById('slider-color');
	
	var connects = [false];
	jQuery(stopPoints).each(function(i, data) {
		connects.push(true);
	});
	noUiSlider.create(slider, {
		orientation: "vertical",
		direction: 'rtl',
		start: stopPoints,
		connect: connects,
		range: {
			'min': [0],
			'max': [100]
		}
	});
	
	jQuery('.noUi-connect').each(function(i, data) {
		jQuery(this).css('background', colors[i]);
	});
	slider.noUiSlider.on('change', function (values) { 
		var result=values.map(Number);
		customStopPoints = result;
		mapTheIndicator(chartSettings.data);
	});
	jQuery('#stop-points').change(function() {
		switch(jQuery( this ).val()){
			case '2':
				customStopAmnt = 2;
				customStopPoints = [0, 50];
				mapTheIndicator(chartSettings.data);
				break;
			case '3':
				customStopAmnt = 3;
				customStopPoints = [0, 33, 66];
				mapTheIndicator(chartSettings.data);
				break;
			case '4':
				customStopAmnt = 4;	
				customStopPoints = [0, 25, 50, 75];
				mapTheIndicator(chartSettings.data);
				break;
			case '5':
				customStopAmnt = 5;	
				customStopPoints = [0, 20, 40, 60, 80];
				mapTheIndicator(chartSettings.data);
				break;
			case '6':
				customStopAmnt = 6;	
				customStopPoints = [0, 16, 32, 48, 64, 80];
				mapTheIndicator(chartSettings.data);
				break;
			default:
				customStopAmnt = 0;	
				customStopPoints = [0,1,2,5,8,12,17,30,50]
				mapTheIndicator(chartSettings.data);
		}
	});
}

function removeCustomLayers(level = '-b10p4m4'){
	//other levels include -gl0b4l, -r3g10n, -c0untry, -l0c4l == these look funny because they HAVE to be super unique
	var customLayerSources = [];
	var currentLayers = thisMap.style._layers;
	for (var key in currentLayers) { 
		if (currentLayers[key].id.indexOf(level) != -1) {
			//add the source of this custom layer to an array. If it's not already in the array
			//we do this to be able to quickly check which sources may still be in use later and remove the unused ones.
			/* if($.inArray(currentLayers[key].source, customLayerSources) === -1){
				customLayerSources.push(currentLayers[key].source)
			} */
			thisMap.removeLayer(currentLayers[key].id);
		} 
	}
	var currentSources = thisMap.style.sourceCaches;
	//so far all the custom sources are being removed regardless of the array defined above... TODO
	for (var key in currentSources) { 
		if (currentSources[key].id.indexOf(level) != -1) {
			thisMap.removeSource(currentSources[key].id);
		} 
	} 
}
function map3D(MappedFieldsZoom, MappedSeriesZoom){
	//make the map
	//loop through all the records in the response and create a layer that shows the feature.
	jQuery(MappedFieldsZoom).each(function(i, data) {
		thisMap.addLayer({
			"id": "indilayer3D"+selData.info.name+i,
			"type": "fill-extrusion",
			"source": 'composite',
			'filter': ["all",
			['==', 'ISO3', selSettings.ISO3],
			['==', 'WDPAID', data]],
			"source-layer": "ACP_Poly-ch9f72",
			"layout": {
				"visibility": "visible"
			},
			'paint': {
				'fill-extrusion-color':  '#aaa',
				'fill-extrusion-height': MappedSeriesZoom[i]*5000,
				'fill-extrusion-base': 0,
				'fill-extrusion-opacity': 0.5
			}
		}, 'CountryLabels');
	});
}

function mapPoints(mapFilter, mapData){
	removelayergroup();
	if (mapMarkers.length > 0){
		resetMapPoints();
	}
	var arrDataMin = Math.min.apply(null, mapData[0].data),
	arrDataMax = Math.max.apply(null, mapData[0].data);
	var normalisedArr = mapData[0].data.map(normalize(arrDataMin, arrDataMax))
	var features = thisMap.querySourceFeatures('BIOPAMA_Poly', { sourceLayer: mapPaLayer, filter: [ "all", mapFilter, ['==', 'ISO3', selSettings.ISO3]] });
	features.forEach(function(marker) {
	  // create a HTML element for each feature
	  var el = document.createElement('div');
	  el.className = 'marker';
	  var dataPosition = jQuery.inArray( marker.properties.WDPAID , mapData[0].mapFeature );
	  el.style='width:'+ normalisedArr[dataPosition] +'px;height:'+ normalisedArr[dataPosition] +'px;background:rgba(255, 152, 0, 0.5);border:1px solid rgba(255, 152, 0, 1);';
	  el.classList.add("wdpa-id-" + mapData[0].mapFeature[dataPosition]);

	  // make a marker for each feature and add to the map
	  var marker = new mapboxgl.Marker(el)
	  .setLngLat({lng: marker.properties.CNTX, lat: marker.properties.CNTY});
	  
	  mapMarkers.push(marker);
	});
	
	mapMarkers.forEach(function(marker) {
		marker.addTo(thisMap);
	});
	thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'none');
}

function normalize(min, max) {
	var delta = max - min;
	return function (val) {
		return ((val - min) / delta) * 20 + 10;
	};
}

function resetMapPoints(){
	mapMarkers.forEach(function(marker) {
		marker.remove();
	});
	mapMarkers = [];
}

function prepGlobalChart(chartSettings){
	if (selData.map.mapScope != null) {
		//we update the Country Name in the card
		jQuery("span.indicator-country").text(" Pan-ACP")
	} else {
		jQuery("span.indicator-country").text(" Global")
		jQuery( ".rest-error-country" ).html("<div class='alert alert-info'>Theis is a global dataset, not restricted to the ACP.</div>");
	}
	checkForChartType("global");
}

function prepRegionalChart(chartSettings){
	//Any custom that we want to have at the country level can be done here.
	if (selSettings.regionName != null) {
		//we update the Country Name in the card
		jQuery("span.indicator-country").text(selSettings.regionName)
		checkForChartType("regional");
	} else {
		//if there's a previously created country chart, kill it
		echarts.dispose(document.getElementById('indicator-chart-country'));
		jQuery( ".indicator-chart" ).hide();
		jQuery( ".rest-error-regional" ).html("<div class='alert alert-info'>There is no Region currently selected, Try selecting one on the map.</div>");
	}
}

function prepPaChart(chartSettings){
	if (selSettings.WDPAID > 0){
		jQuery("span.indicator-country").text(selSettings.paName)
		checkForChartType("local");

	} else {
		//if there's a previously created pa chart, kill it
		echarts.dispose(document.getElementById('indicator-chart-pa'));
		jQuery( ".indicator-chart" ).hide();
		jQuery( ".rest-error-pa" ).html("<div class='alert alert-info'>There is no Protected Area currently selected, Try selecting one on the map.</div>");
	}

}