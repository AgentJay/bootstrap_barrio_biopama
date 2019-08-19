
//initiates the chart building
function getChart(error = 0){
	if (error == 0 ){
		//delete any old errors now that we have success
		jQuery( ".rest-error" ).empty();
		jQuery( ".indicator-chart" ).show();
		currentCardScope = jQuery("#pa-card-tabs li.ui-tabs-active").text().trim().toLowerCase();
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
		console.log(currentCardScope)
		//show the chart, in case it was hidden from a previous error
		switch(currentCardScope) {
		case "global":
			prepGlobalChart();
			break;
		case "regional":
			prepRegionalChart();
			break;
		case "national":
			prepCountryChart();
			break;
		case "local":
			prepPaChart();
			break;
		default:	//the country charts are the default for now....
			noChart();
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
		if(((selSettings.regionID != null) && (currentScope == "Regional")) || ((selSettings.ISO2 != null) && (currentScope == "National")) || ((selSettings.WDPAID > 0) && (currentScope == "Local"))){
			jQuery( ".rest-error" ).html("<div class='alert alert-info'>No results were found.<br>"+
			"Try selecting a different <b>" + scopeNeeded + "</b></div>");
		} else {
			jQuery( ".rest-error" ).html("<div class='alert alert-info'>You must select a <b>" + scopeNeeded + "</b> in the map.</div>");
		}	
	} else if (error == 3) {
		jQuery( ".rest-error" ).html("<div class='alert alert-warning'>There is no data for this country. Try selecting: <b>"+selData.data.countries+"</b></div>");
	} else {
		jQuery( ".rest-error" ).html("<div class='alert alert-warning'>There was an error.</div>");
	}
}

function minimizeChart(){
  jQuery( ".activeSelection").first().next().trigger( "click" );
  //updateBreadIndicator("NA");
}
function sortByKey(array, key, order='asc') {
	//console.log("boom");
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
	var acpCountryNames = ["Angola","Antigua and Barbuda","Bahamas","Barbados","Belize","Benin","Botswana","Burkina Faso","Burundi","Cameroon","Cape Verde","Central African Republic","Chad","Comoros","Congo (Brazzaville)","Congo, Democratic Republic of the","Cook Islands","Côte d'Ivoire","Cuba","Djibouti","Dominica","Dominican Republic","Equatorial Guinea","Eritrea","Ethiopia","Fiji","Gabon","Gambia","Ghana","Grenada","Guinea","Guinea-Bissau","Guyana","Haiti","Jamaica","Kenya","Kiribati","Lesotho","Liberia","Madagascar","Malawi","Mali","Marshall Islands","Mauritania","Mauritius","Micronesia, Federated States of","Mozambique","Namibia","Nauru","Niger","Nigeria","Niue","Palau","Papua New Guinea","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and Grenadines","Samoa","Sao Tome and Principe","Senegal","Seychelles","Sierra Leone","Solomon Islands","Somalia","South Africa","South Sudan","Sudan","Suriname","Eswatini","Tanzania, United Republic of","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tuvalu","Uganda","Vanuatu","Zambia","Zimbabwe"];
	var acpIso2 = ["AO", "AG", "BS", "BB", "BZ", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM", "CG", "CD", "CK", "CI", "CU", "DJ", "DM", "DO", "GQ", "ER", "ET", "FJ", "GA", "GM", "GH", "GD", "GN", "GW", "GY", "HT", "JM", "KE", "KI", "LS", "LR", "MG", "MW", "ML", "MH", "MR", "MU", "FM", "MZ", "NA", "NR", "NE", "NG", "NU", "PW", "PG", "RW", "KN", "LC", "VC", "WS", "ST", "SN", "SC", "SL", "SB", "SO", "ZA", "SS", "SD", "SR", "SZ", "TZ", "TL", "TG", "TO", "TT", "TV", "UG", "VU", "ZM", "ZW"];
	//console.log(indicatorResults);
	//we need to see if the data was from a REST service or a WMS service as the WMS service needs to be formatted differently
	if (selData.chart.dataSource == "External Map Data" || selData.chart.RESTdataContext == "features"){
		var wmsData = [];
		indicatorResults.forEach(function(object){
			wmsData.push(object['properties']);
		});
		//console.log(wmsData);
		indicatorResults = wmsData
	}
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
	
	function ACPISO2Filter(elem, index, array) {		
		var arrayIndex = acpIso2.indexOf(elem[selData.chart.mappedField]);
		if (arrayIndex > -1){
			elem['countryLabel'] = acpCountryNames[arrayIndex];
			elem['countryISO2'] = acpIso2[arrayIndex];
			return true;
		} else {
			console.log("Country code: "+elem[selData.chart.mappedField]+" is not in the ACP");
			return false; 
		}
	}
	function ACPISO3Filter(elem, index, array) {
		var acpIso3 = ["AGO", "ATG", "BHS", "BRB", "BLZ", "BEN", "BWA", "BFA", "BDI", "CMR", "CPV", "CAF", "TCD", "COM", "COG", "COD", "COK", "CIV", "CUB", "DJI", "DMA", "DOM", "GNQ", "ERI", "ETH", "FJI", "GAB", "GMB", "GHA", "GRD", "GIN", "GNB", "GUY", "HTI", "JAM", "KEN", "KIR", "LSO", "LBR", "MDG", "MWI", "MLI", "MHL", "MRT", "MUS", "FSM", "MOZ", "NAM", "NRU", "NER", "NGA", "NIU", "PLW", "PNG", "RWA", "KNA", "LCA", "VCT", "WSM", "STP", "SEN", "SYC", "SLE", "SLB", "SOM", "ZAF", "SSD", "SDN", "SUR", "SWZ", "TZA", "TLS", "TGO", "TON", "TTO", "TUV", "UGA", "VUT", "ZMB", "ZWE"];
		var arrayIndex = acpIso3.indexOf(elem[selData.chart.mappedField]);
		if (arrayIndex > -1){
			elem['countryLabel'] = acpCountryNames[arrayIndex];
			elem['countryISO2'] = acpIso2[arrayIndex];
			return true;
		} else {
			console.log("Country code: "+elem[selData.chart.mappedField]+" is not in the ACP");
			return false; 
		}
	}
	function ACPNUMFilter(elem, index, array) {
		var acpNUM = ["24", "28", "44", "52", "84", "204", "72", "854", "108", "120", "132", "140", "148", "174", "178", "180", "184", "384", "192", "262", "212", "214", "226", "232", "231", "242", "266", "270", "288", "308", "324", "624", "328", "332", "388", "404", "296", "426", "430", "450", "454", "466", "584", "478", "480", "583", "508", "516", "520", "562", "566", "570", "585", "598", "646", "659", "662", "670", "882", "678", "686", "690", "694", "90", "706", "710", "728", "736", "740", "748", "834", "626", "768", "776", "780", "798", "800", "548", "894", "716"].indexOf(value[selData.chart.mappedField]) > -1
		var arrayIndex = acpNUM.indexOf(elem[selData.chart.mappedField]);
		if (arrayIndex > -1){
			elem['countryLabel'] = acpCountryNames[arrayIndex];
			elem['countryISO2'] = acpIso2[arrayIndex];
			return true;
		} else {
			console.log("Country code: "+elem[selData.chart.mappedField]+" is not in the ACP");
			return false; 
		}
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
	function precision(a) {
	  var e = 1;
	  while (Math.round(a * e) / e !== a) e *= 10;
	  return Math.log(e) / Math.LN10;
	}
	
	//here we replace the x axis data placeholder with the array of values from the rest service. We only do this if they have assigned a value to that axis.
	if (typeof xAxis['data'] !== 'undefined'){
		var xAxisData = [], testDate, fullDate;
		if ((selData.chart.mapLayerField  == 'un_m49') || (selData.chart.mapLayerField  == 'iso3') || (selData.chart.mapLayerField  == 'iso2')){
			//if the chart is linked to the map by a country field, then we replace the country code in the chart by the country name 
			indicatorResults.forEach(function(object){
				xAxisData.push(object['countryLabel']);
			});
		} else {
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
		}
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
	var countryLabels = [];
	var countryISO2codes = [];
	indicatorResults.forEach(function(object){
		if(selData.chart.mapLayerField  == 'WDPAID'){
			mappedField.push(parseInt(object[selData.chart.mappedField]));
		} else {
			mappedField.push(object[selData.chart.mappedField]);
			countryLabels.push(object['countryLabel'])
			countryISO2codes.push(object['countryISO2'])
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
		//if it's the first in the series we Swap it out with NaN so it can remain compatible with the chart
		if (index == 0){
			indicatorResults.forEach(function(object2){
				//var precisionCheck = precision(object2[chartSeries[index]]);
				var tempDataVal = object2[chartSeries[index]];
				if (tempDataVal === null || Number.isNaN(tempDataVal)) {
					chartData.push("NaN");
				} else {
					var dataVal = parseFloat(tempDataVal, 10);
					chartData.push(dataVal);
				}
				/* if (precisionCheck >= 2){
					tempDataVal = tempDataVal.toFixed(2);
				} */

			});
		} else {
			indicatorResults.forEach(function(object2){
				//var precisionCheck = precision(object2[chartSeries[index]]);
				var tempDataVal = object2[chartSeries[index]];
				var dataVal = parseFloat(tempDataVal, 10);
				chartData.push(dataVal);
				/* if (precisionCheck >= 2){
					tempDataVal = tempDataVal.toFixed(2);
				} */
			});
		}
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
	data[0]['countryISO2'] = countryISO2codes;
	data[0]['countryLabels'] = countryLabels;
	data[0]['emphasis'] = {itemStyle: {color: '#ff6600'}};		
	//console.log(data[0])
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
		//makeDoughnutChart();
		jQuery( ".rest-error" ).html("<div class='alert alert-info'>No Chart was Configured yet.</div>");
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
		echarts.dispose(document.getElementById('indicator-chart-national'));
		jQuery( ".indicator-chart" ).hide();
		jQuery( ".rest-error-country" ).html("<div class='alert alert-info'>There is no Country currently selected, Try selecting one on the map.</div>");
	}
}
function noChart(){
	//Any custom that we want to have at the country level can be done here.
	//we update the title
	jQuery("span.indicator-for").text("");
	jQuery("span.indicator-country").text("");
	jQuery( ".indicator-chart" ).hide();
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
					if (pasCurrentlyHovered.length > 0){
						for (var key in pasCurrentlyHovered) {
							indicatorChart.dispatchAction({
								type: 'highlight',
								dataIndex: jQuery.inArray( pasCurrentlyHovered[key], chartSettings.data[0].mapFeature )
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
			if ((selData.chart.mapLayerField == "WDPAID") && (pasCurrentlyHovered.length > 0)){
				for (var key in pasCurrentlyHovered) {
					indicatorChart.dispatchAction({
						type: 'highlight',
						dataIndex: jQuery.inArray( pasCurrentlyHovered[key], chartSettings.data[0].mapFeature )
					});
				}
			}
		}
	}
}

function getChartMappedFields(chart, dataSeries){
	if (dataSeries == 1){
		var MappedSeriesArray = chartSeriesGlobal[0].data;
		//var MappedSeriesZoom = MappedSeriesArray.slice(chart.dataZoom[0].startValue, chart.dataZoom[0].endValue + 1);
		var MappedSeriesZoom = MappedSeriesArray.slice(chart.dataZoom[0].startValue, chart.dataZoom[0].endValue + 1);
		return MappedSeriesZoom;
	} else {
		//console.log("start: " + option.dataZoom[0].startValue + " End: " + option.dataZoom[0].endValue)
		var MappedFieldsArray = chart.series[0].mapFeature;
		var MappedFieldsZoom = MappedFieldsArray.slice(chart.dataZoom[0].startValue, chart.dataZoom[0].endValue + 1);
		return MappedFieldsZoom;
	}
}

function mapTheIndicator(mapData){
	var chartOptions = indicatorChart.getOption();
	var MappedFieldsZoom = getChartMappedFields(chartOptions);
	var MappedSeriesZoom = getChartMappedFields(chartOptions, 1);
	
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
	//console.log("boom");
	removelayergroup();
	dataPoints = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: []}
	
	if(customStopAmnt){
		customNumStopPoints = customStopAmnt
	} else {
		if (selData.chart.breakPoints){
			customNumStopPoints = selData.chart.breakPoints;
		} else {
			customNumStopPoints = 3
		}
	}
	if (selData.chart.colorSwatch){
		var tempCustomStopAmnt = selData.chart.colorSwatch.split("-");
		if (customNumStopPoints == 2){
			mapCustomSwatchCat = 'diverging'
		} else {
			mapCustomSwatchCat = tempCustomStopAmnt[0]
		}
		mapCustomSwatchColors = parseInt(tempCustomStopAmnt[1], 10);
	} 
	
	if (customNumStopPoints == 0){
		mapColors = colorbrewer.diverging[3][3];
	} else {
		mapColors = colorbrewer[mapCustomSwatchCat][mapCustomSwatchColors][customNumStopPoints];
	}
	var mapColorCopy = mapColors.slice();
	if (customColorInvert == null){
		if (selData.chart.invertColors == "Yes"){
			customColorInvert = "on"
		} else {
			customColorInvert = "off"
		}
	}
	if (customColorInvert == "on"){
		mapColorCopy.reverse(); 
	} 
	if (mapMarkers.length > 0){
		resetMapPoints();
	}
	//filter the map based on the user defined field in the indicator (filter)
	if (['un_m49', 'iso3', 'iso2', 'WDPAID', 'Group'].indexOf(selData.chart.mapLayerField) >= 0) {
		var legendText = [];
		var tempLayer = mapCountryLayer;
		if (selData.chart.mapLayerField == "WDPAID") tempLayer = mapPaLayer;
		if (selData.chart.mapLayerField == "Group") tempLayer = mapRegionLayer;
		thisMap.setPaintProperty("wdpaAcpFillHighlighted", "fill-opacity", 0);
		//remove the layers that may exist that were previously added by this function.	
		
		//clean out the null/NaN values from the array and show them in the map as a second, non interactive layer.
		var nanCheck = 0;
		var nanCount = 0;
		var nanMapAreas = [];
		console.log(MappedSeriesZoom);
		console.log("boom");
		MappedSeriesZoom = MappedSeriesZoom.filter(function(elem, index, array) { 
			if (array[index] == "NaN") {
				nanCheck = 1;
				nanCount++;
				nanMapAreas.push(MappedFieldsZoom[0])
				MappedFieldsZoom.splice(0, 1);
			}
			return elem !== "NaN"
		})
		if (nanCheck == 1) {
			var mapLayer = thisMap.getLayer('nan-layer');
			if(typeof mapLayer !== 'undefined') {
				thisMap.setFilter("nan-layer", buildFilter(nanMapAreas, 'in', selData.chart.mapLayerField));
			} else {
				thisMap.loadImage('/themes/custom/bootstrap_barrio_biopama/img/nan-pattern.png', function(err, image) {
					// Throw an error if something went wrong
					if (err) throw err;
					thisMap.addImage('pattern', image);
					thisMap.addLayer({
						"id": "nan-layer",
						"type": "fill",
						"source": "BIOPAMA_Poly",
						"source-layer": tempLayer,
						"paint": {
							"fill-pattern": "pattern"
							}
					}, 'gaulACP');
					thisMap.setFilter("nan-layer", buildFilter(nanMapAreas, 'in', selData.chart.mapLayerField));
				});
			}
			jQuery("#custom-map-legend-nan").show();
		} else {
			jQuery("#custom-map-legend-nan").hide();
			var mapLayer = thisMap.getLayer('nan-layer');
			if(typeof mapLayer !== 'undefined') {
				thisMap.setLayoutProperty("nan-layer", 'visibility', 'none');
			}
		}
		
		if (customStopPoints.length > 1) {
			console.log("Custom Points "+ customStopPoints);
			selectedStopPoints = customStopPoints;
		} else {
			console.log("Default Points");
			//We do 3 things. If nothing was defined: define it, if it was defined: use it, if it was over ridden: use that.
			if (customClassMethod == ""){
				if (selData.chart.classificationMethod == ""){
					customClassMethod = "Natural Breaks (Jenks)"; //if the card wasn't setup properly, use jenks as a default
				} else {
					customClassMethod = selData.chart.classificationMethod;
				}
			} 
			selectedStopPoints = calcPointSatistics(MappedSeriesZoom, customClassMethod, customNumStopPoints);
		}
		
		var filteredLegendText = [];
		var filteredLegendColors = [];
		
		var stopPointMin = parseFloat(MappedSeriesZoom[0], 10);
		if (stopPointMin == "NaN") stopPointMin = 0;
		var stopPointMax = parseFloat(MappedSeriesZoom[MappedSeriesZoom.length - 1], 10);
		var stopPointsWithEnds = selectedStopPoints.slice();
		stopPointsWithEnds.unshift(stopPointMin)//adds min to beginning
		jQuery(stopPointsWithEnds).each(function(index) {
			if (stopPointsWithEnds[index+1] != null) {
				legendText.push("=> "+stopPointsWithEnds[index] + " and < " + stopPointsWithEnds[index+1]);
			} else {
				legendText.push(" > " + stopPointsWithEnds[index])
			}
		});	
		var uniqueMappedFieldsZoom = MappedFieldsZoom.filter(function(elem, index, array) {
			if (array.indexOf(elem) == -1) MappedSeriesZoom.splice(index, 1);
			return index === array.indexOf(elem);
		});
		var dataColorArray = [];
		jQuery(uniqueMappedFieldsZoom).each(function(i, data) {
			jQuery(stopPointsWithEnds).each(function(index) {
				if (stopPointsWithEnds[index+1] != null) {
					if ((MappedSeriesZoom[i] >= stopPointsWithEnds[index]) && (MappedSeriesZoom[i] < stopPointsWithEnds[index+1])){
						if(selData.chart.mapLayerField == "WDPAID"){
							dataPoints[index].push(parseInt(data));
						} else{
							dataPoints[index].push(data);
						}
						dataColorArray.push(mapColorCopy[index]);
					}
				} else {
					if (MappedSeriesZoom[i] >= stopPointsWithEnds[stopPointsWithEnds.length -1]){
						if(selData.chart.mapLayerField == "WDPAID"){
							dataPoints[stopPointsWithEnds.length -1].push(parseInt(data));
						} else{
							dataPoints[stopPointsWithEnds.length -1].push(data);
						}
						dataColorArray.push(mapColorCopy[index]);
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
		//console.log(paintProp);
		
		buildMapLegend(filteredLegendText, filteredLegendColors);
		buildMapSlider(selectedStopPoints, mapColorCopy, stopPointMin, stopPointMax);
		
		updateIndicatorChart(uniqueMappedFieldsZoom, dataColorArray, MappedSeriesZoom, nanCount);

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
		if (currentTab == "Local"){
			thisMap.setFilter("wdpaAcpFillHighlighted", [ "all", ['!=', 'WDPAID', selSettings.WDPAID], ['==', 'ISO3', selSettings.ISO3] ]);
			thisMap.setPaintProperty("wdpaAcpFillHighlighted", "fill-opacity", 0.5);
			//show layer again just incase it's been turned off by the point layer
			thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'visible');
		}	
	} else {
		if (currentTab == "Local"){
			thisMap.setFilter("wdpaAcpFillHighlighted",['==', 'ISO3', selSettings.ISO3]);
			//show layer again just incase it's been turned off by the point layer
			thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'visible');	
		}
	}
}
function calcPointSatistics(MappedSeriesZoom, classMethod, stopPoints){
	selectedStopPoints = [];
	var stopGap = (1 / stopPoints);
	var stopTotal = stopGap;
	var stopPointMin = parseFloat(MappedSeriesZoom[0], 10);
	var stopPointMax = parseFloat(MappedSeriesZoom[MappedSeriesZoom.length - 1], 10);
	//console.log(stopPointMin +" - "+stopPointMax)
	var loopNum = 1;
	switch(classMethod){
		case 'Equal Interval':
			var tempVal = (stopPointMax - stopPointMin) * stopGap;
			do {
				selectedStopPoints.push((equalDistribution(stopPointMin, tempVal, loopNum)).toFixed(2));
				loopNum++;
			} while (loopNum < stopPoints);
			break;
		case 'Standard Deviation':
			var avg = average(MappedSeriesZoom);
			var tempVal = (standardDeviation(avg, MappedSeriesZoom)/2).toFixed(2);
			do {
				var checkLoop = isOdd(loopNum);
				if (checkLoop){
					if ((avg - (tempVal * loopNum)).toFixed(2) < stopPointMin){
						selectedStopPoints.push(stopPointMin);
					} else{
						selectedStopPoints.push((avg - (tempVal * loopNum)).toFixed(2));
					}
				} else {
					if ((avg - (tempVal * loopNum)).toFixed(2) > stopPointMax){
						selectedStopPoints.push(stopPointMax);
					} else{
						selectedStopPoints.push((avg + (tempVal * loopNum)).toFixed(2));
					}
				}
				loopNum++;
			} while (loopNum < stopPoints);
			break;
		case 'Quantile':
			do {
				selectedStopPoints.push((Quantile(MappedSeriesZoom, stopTotal)).toFixed(2));
				stopTotal = stopTotal + stopGap;
				if (stopTotal > 0.95) stopTotal =  1; //we round it off if it gets close to 1 to fix decimal errors....
			} while (stopTotal < 1);
			break;
		case 'Natural Breaks (Jenks)':
		default:
			selectedStopPoints = naturalBreaks(MappedSeriesZoom, parseInt(stopPoints));
			selectedStopPoints = selectedStopPoints.slice(1,-1);	
	}
	return selectedStopPoints;
	
	function isOdd(num) { return num % 2;}
	function equalDistribution(min, q, loopNum) {
	  var base = min + (q * loopNum);
	  return base;
	}
	function Quantile(data, q) {
	  var pos = ((data.length) - 1) * q;
	  var base = Math.floor(pos);
	  var rest = pos - base;
	  if( (data[base+1]!==undefined) ) {
		return data[base] + rest * (data[base+1] - data[base]);
	  } else {
		return data[base];
	  }
	}
	function standardDeviation(avg, values){
	  var squareDiffs = values.map(function(value){
		var diff = value - avg;
		var sqrDiff = diff * diff;
		return sqrDiff;
	  });
	  var avgSquareDiff = average(squareDiffs);
	  var stdDev = Math.sqrt(avgSquareDiff);
	  return stdDev;
	}

	function average(data){
	  var sum = data.reduce(function(sum, value){
		return sum + value;
	  }, 0);
	  var avg = sum / data.length;
	  return avg;
	}
	function naturalBreaks(series, numClasses) {
		var mat1 = [];
		for ( var x = 0, xl = series.length + 1; x < xl; x++) {
			var temp = []
			for ( var j = 0, jl = numClasses + 1; j < jl; j++) {
				temp.push(0)
			}
			mat1.push(temp)
		}

		var mat2 = []
		for ( var i = 0, il = series.length + 1; i < il; i++) {
			var temp2 = []
			for ( var c = 0, cl = numClasses + 1; c < cl; c++) {
				temp2.push(0)
			}
			mat2.push(temp2)
		}

		for ( var y = 1, yl = numClasses + 1; y < yl; y++) {
			mat1[0][y] = 1
			mat2[0][y] = 0
			for ( var t = 1, tl = series.length + 1; t < tl; t++) {
				mat2[t][y] = Infinity
			}
			var v = 0.0
		}

		for ( var l = 2, ll = series.length + 1; l < ll; l++) {
			var s1 = 0.0
			var s2 = 0.0
			var w = 0.0
			for ( var m = 1, ml = l + 1; m < ml; m++) {
				var i3 = l - m + 1
				var val = parseFloat(series[i3 - 1])
				s2 += val * val
				s1 += val
				w += 1
				v = s2 - (s1 * s1) / w
				var i4 = i3 - 1
				if (i4 != 0) {
					for ( var p = 2, pl = numClasses + 1; p < pl; p++) {
						if (mat2[l][p] >= (v + mat2[i4][p - 1])) {
							mat1[l][p] = i3
							mat2[l][p] = v + mat2[i4][p - 1]
						}
					}
				}
			}
			mat1[l][1] = 1
			mat2[l][1] = v
		}

		var k = series.length
		var kclass = []

		for (i = 0, il = numClasses + 1; i < il; i++) {
			kclass.push(0)
		}

		kclass[numClasses] = parseFloat(series[series.length - 1])

		kclass[0] = parseFloat(series[0])
		var countNum = numClasses
		while (countNum >= 2) {
			var id = parseInt((mat1[k][countNum]) - 2)
			kclass[countNum - 1] = series[id]
			k = parseInt((mat1[k][countNum] - 1))

			countNum -= 1
		}

		if (kclass[0] == kclass[1]) {
			kclass[0] = 0
		}

		range = kclass;
		range.sort(function (a, b) { return a-b })

		return range; //array of breaks
	}
}
function updateIndicatorChart(seriesData, colors, MappedSeriesZoom, nanCount){
	var chartOptions = indicatorChart.getOption();
	var startIndex = chartOptions.dataZoom[0].startValue;

	var itemStyle = {
		color: "#000", barBorderColor: '#666', barBorderWidth: 2
	};
	var newChartSettings = jQuery.extend( true, {}, chartSettings );
	//newChartSettings.data[0]['itemStyle'] = itemStyle;
	jQuery(seriesData).each(function(i, data) {
		var tempVal = chartSettings.data[0].data[i+startIndex+nanCount];
		newChartSettings.data[0].data[i+startIndex+nanCount] = {
			value: tempVal,
			itemStyle: {color: colors[i] },
		}
	});

	//console.log(newChartSettings)
	//indicatorChart.clear();
	var option = {
		series: newChartSettings.data
	};
	indicatorChart.setOption(option);
	//console.log(indicatorChart.getOption())
	//makeBarLineChart(1, seriesData, colors)
}
function removelayergroup(){
	//jQuery("#map-bad-legend, #map-legend").hide();
	var currentLayers = thisMap.style._layers;
	for (var key in currentLayers) { 
		if (currentLayers[key].id.indexOf('1nd1l4y3r') != -1) {
			thisMap.removeLayer(currentLayers[key].id);
		} 
	}
}
function buildMapLegend(legText, legColor){
	jQuery("#map-legend").show();
	jQuery("#custom-map-legend").empty();
	jQuery(legText).each(function(index) {
		var legendUnit = "<div class='legend-unit' style='display: flex; padding: 5px;'>"+
			"<div class='legend-color' style='background-color: "+legColor[index]+"; width:20px; height:20px;'></div>"+
			"<div class='legend-text'>&nbsp;"+legText[index]+"</div>"+
		"</div>";
		jQuery("#custom-map-legend").append( legendUnit );
	});	
	jQuery("#custom-map-legend").append( "<div class='map-legend-title'>"+selData.chart.chartSeries[0].name+"</div>" );
}
function buildMapSlider(stopPoints, colors, minRange, maxRange){
	//we clone the arrays to prevent inverting the original arrays
	//var stopCopy = stopPoints.slice(0);
	//we have to invert the colors each time due to the orientation of the bar
	//colorCopy.reverse(); 
	//stopCopy.reverse(); 
	//var colorCopy = colors.slice(0);
	
	if(jQuery('#slider-color').length){ //remove any sliders that may have already been created
		jQuery('#slider-color, #card-controls, #color-swatch-wrapper').remove()
	}
	//attach a new one to the visible chart
	jQuery( "<div id='slider-color' style='height: 190px; position: relative; top: -290px; margin-bottom: -180px;'></div>" ).insertAfter( ".indicator-chart:visible" );
	jQuery( "<div id='card-controls'>"+
			"<div id='stop-point-wrapper' class='card-control'>Classes <br><select id='stop-points' name='Stop Points'>"+
				"<option value='0' selected='true'>Default</option>"+
				"<option value='3'>3</option>"+"<option value='4'>4</option>"+
				"<option value='5'>5</option>"+"<option value='6'>6</option>"+
				"<option value='7'>7</option>"+"<option value='8'>8</option>"+
			"</select></div>" +
			"<div id='class-method-wrapper' class='card-control'>Classification <br>"+
				"<select id='class-method' name='Class Method'>"+
				"<option selected='true'>Default</option>"+
				"<option>Equal Interval</option>"+
				"<option>Standard Deviation</option>"+
				"<option>Natural Breaks (Jenks)</option>"+
				"<option>Quantile</option>"+
				"</select>"+
			"</div>"+
			"<div id='color-selected-wrapper' class='card-control'>Color <br>"+
				"<div id='active-color-selected'>"+
				"</div>"+
			"</div>"+
			"<div id='color-reverse-wrapper' class='card-control'>Invert <br>"+
				"<input id='color-reverse' type='checkbox' value='on'>" +
			"</div>"+
		"</div>").insertAfter( ".indicator-chart:visible" );
		jQuery( "<div id='color-swatch-wrapper'>"+
			'<H5>Diverging</H5>'+
			'<div id="ramps-diverging">' +
			'</div>'+	
			'<H5>Sequential</H5>'+
			'<div id="ramps-sequential">' +
			'</div>'+
		"</div>").insertAfter( "#block-indicatorcard" );
	jQuery("#color-swatch-wrapper").hide(0);
	var selectedNumClasses = stopPoints.length + 1;
	jQuery("#ramps-diverging, #ramps-sequential").empty();
	jQuery("#color-selected-wrapper").click(function() {
		jQuery("#color-swatch-wrapper").toggle("fast");
	});

	if (selData.chart.classificationMethod != customClassMethod){
		jQuery('#class-method').val(customClassMethod)
	} else {
		jQuery('#class-method').val(selData.chart.classificationMethod)
	}
	if (customColorInvert == "on"){
		jQuery('#color-reverse').prop("checked",true);
	} 
	if (customClassMethod == "Standard Deviation"){
		jQuery('#stop-points').val(3).attr('disabled', 'disabled');
	}
	jQuery('#stop-points').val(customNumStopPoints);
	for ( var i in colorbrewer.diverging ){
		var ramp = jQuery("<div class='ramp colorbrewdiverging-"+ i +"'></div>"),
			svg = "<svg width='15' height='"+selectedNumClasses*15+"'>";
		for ( var n = 0; n < selectedNumClasses; n++ ){
			svg += "<rect fill="+colorbrewer.diverging[i][selectedNumClasses][n]+" width='15' height='15' y='"+n*15+"'/>";
		}
		svg += "</svg>";
		jQuery("#ramps-diverging").append(ramp.append(svg).click( function(){
			if ( jQuery(this).hasClass("selected") ) return;
			setScheme( jQuery(this).attr("class").substr(14) );
		}));
	}
	for ( var i in colorbrewer.sequential ){
		var ramp = jQuery("<div class='ramp colorbrewsequential-"+ i +"'></div>"),
			svg = "<svg width='15' height='"+selectedNumClasses*15+"'>";
		for ( var n = 0; n < selectedNumClasses; n++ ){
			svg += "<rect fill="+colorbrewer.sequential[i][selectedNumClasses][n]+" width='15' height='15' y='"+n*15+"'/>";
		}
		svg += "</svg>";
		jQuery("#ramps-sequential").append(ramp.append(svg).click( function(){
			if ( jQuery(this).hasClass("selected") ) return;
			setScheme( jQuery(this).attr("class").substr(14) );
		}));
	}
	if (selData.chart.colorSwatch){
		setScheme( selData.chart.colorSwatch );
	}
	function setScheme(selectedScheme){
		jQuery(".ramp.selected").removeClass("selected");
		jQuery("#active-color-selected").empty();
		jQuery(".ramp.colorbrew"+selectedScheme).clone().appendTo( "#active-color-selected" ).addClass("card-selected-color");
		jQuery(".ramp.colorbrew"+selectedScheme).addClass("selected");
		if (selData.chart.colorSwatch !== selectedScheme){
			selData.chart.colorSwatch = selectedScheme;
			mapTheIndicator(chartSettings.data);
		}
	}

	
	var slider = document.getElementById('slider-color');
	var connects = [true];
	jQuery(stopPoints).each(function(i, data) {
		connects.push(true);
	});
	console.log(stopPoints)
	console.log(connects)
	console.log(minRange)
	console.log(maxRange)
	noUiSlider.create(slider, {
		orientation: "vertical",
		direction: 'rtl',
		//tooltips: true,
		start: stopPoints,
		connect: connects,
		range: {
			'min': [minRange],
			'max': [maxRange]
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
		customStopPoints = 0;
		customStopAmnt = jQuery( this ).val();
		if (customStopAmnt == 0){
			customStopAmnt = selData.chart.breakPoints;
		} 
		mapTheIndicator(chartSettings.data);
	});
	jQuery('#color-reverse').change(function() {
		if (jQuery(this).prop("checked")) {
			customColorInvert = "on";
		} else{
			customColorInvert = "off";
		}
		mapTheIndicator(chartSettings.data);
	});
	jQuery('#class-method').change(function() {
		customStopPoints = 0;
		if (customClassMethod !== jQuery( this ).val()){
			customClassMethod = jQuery( this ).val();
			if (customClassMethod == "Standard Deviation"){
				customStopAmnt = 3;
			}
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
			jQuery("."+key).remove();
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
		echarts.dispose(document.getElementById('indicator-chart-regional'));
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
		echarts.dispose(document.getElementById('indicator-chart-local'));
		jQuery( ".indicator-chart" ).hide();
		jQuery( ".rest-error-pa" ).html("<div class='alert alert-info'>There is no Protected Area currently selected, Try selecting one on the map.</div>");
	}

}