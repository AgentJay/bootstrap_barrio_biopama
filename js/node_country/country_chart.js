/* var countryCharts = [];

var CountrySettings = {
	selIndicators: [],
	selIndicatorMapLayerField: [],
	selIndicatorMappedField: [],
	selIndicatorChartType: [],
	selIndicatorRESTurl: [],
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
}; */

var selSettings = {
    paName: 'default',
	WDPAID: 0,
    countryName: 'trans-ACP',
    regionID: null,
	regionName: null,
	ISO2: null,
	ISO3: null,
	NUM: null,
};
var sparkLine = true;

var bigChart;

function getCountryRestResults(activeIndicator) {
	//console.log(activeIndicator)
	//we get the indicator name as a class
	var indicator = CountrySettings.selIndicators[activeIndicator];
	//we pass the class to our generate url function to keep the finished product 
	var indicatorURL = generateCountryRestURL(activeIndicator);
	jQuery.ajax({
		url: indicatorURL,
		dataType: 'json',
		success: function(d) {
			//console.log(d)
			//CountrySettings.selIndicatorRes[activeIndicator] = d;
			if (d.hasOwnProperty("records")) { //from a JRC REST Service
				//console.log("has records")
				CountrySettings.selIndicatorRes[activeIndicator] = d.records;
				if (d.metadata.recordCount == 0) {
					//we create a card, but tell it that the response was empty (error 2)
					getCountryChart(activeIndicator, indicator, 2);
				}
				else {
					//create the map
					//mapTheIndicator(activeMapIndicator);
					//the 0 means there was no error
					//console.log(CountrySettings.selIndicatorRes[activeIndicator])
					getCountryChart(activeIndicator, indicator, 0);
				}
			}
			if (d.hasOwnProperty("dimensions")) { //from an UN Stats SDG REST Service
				CountrySettings.selIndicatorRes[activeIndicator] = d.dimensions;
				getCountryChart(activeIndicator, indicator, 0);
			} else if (d.hasOwnProperty(CountrySettings.selIndicatorRESTdataContext[activeIndicator])){
				CountrySettings.selIndicatorRes[activeIndicator] = d[CountrySettings.selIndicatorRESTdataContext[activeIndicator]];
				getCountryChart(activeIndicator, indicator, 0);
			} else {
				CountrySettings.selIndicatorRes[activeIndicator] = d;
				getCountryChart(activeIndicator, indicator, 0);
			}
		},
		error: function() {
			//we create a card, but tell it that there was a general error (error 1)
			//todo - expand error codes to tell user what went wrong.
			getCountryChart(activeIndicator, indicator, 1);
		}
	});
}

function generateCountryRestURL(activeIndicator) {
	//we get the url from the hidden fields in the indicator menu
	var indicatorURL = CountrySettings.selIndicatorRESTurl[activeIndicator]
	//our URL should contain some tokens as placeholders. So here we switch those out with the real values
	indicatorURL = indicatorURL.replace("NUM", selSettings.NUM)
		.replace("ISO2", selSettings.ISO2)
		.replace("ISO3", selSettings.ISO3)
		.replace("WDPAID", selSettings.WDPAID)
		.replace("REGION", selSettings.regionID);
	return indicatorURL;
}

function getCountryChart(key, indicator, error) {
	//console.log(indicator + "error " + error);
	//we look to see if the chart div has been created already
	//if it's not there, make it, if it is there, turn it on
	//jQuery('#country-sparkchart-' + CountrySettings.selIndicators[key]).show("fast");

	//Drupal.attachBehaviors(jQuery('#country-chart-' + CountrySettings.selIndicators[key]));
	//we initialize e-charts and attach it to the chart div 
	if (sparkLine == true){
		if (error == 0) {
			jQuery('#country-sparkchart-' + CountrySettings.selIndicators[key]+":visible").closest("div.chart-wrapper").find(".graph-link").show();
			var chartSettings = checkCountryChartData(key);
			//countryCharts[key] = echarts.init(document.getElementById('country-sparkchart-' + CountrySettings.selIndicators[key]));
			countryCharts[key] = echarts.init(jQuery( ".country-sparkchart-" + CountrySettings.selIndicators[key] + ":visible" )[ 0 ]);
			makeSparkChart(key, chartSettings);
			
		} else {
			chartCountryError(key, error)
		}
	}
	else {
/* 		jQuery( ".country-chart-large.chart-active" ).each(function( index ) {
		  echarts.dispose(jQuery(this));
		});
		jQuery( ".chart-active" ).removeClass('chart-active'); */
		var chartSettings = checkCountryChartData(key);
		bigChart = echarts.init(document.getElementById('country-fullchart-' + CountrySettings.selIndicators[key]));
		//jQuery('#country-fullchart-' + CountrySettings.selIndicators[key]).addClass('chart-active');
		makeFullChart(key, chartSettings);
	}
}

function chartCountryError(key, error) {
	var errorContainer = jQuery('#country-sparkchart-' + CountrySettings.selIndicators[key]).closest(".views-col").find(".rest-error-container");
	if (error == 2) {
		errorContainer.html("<div class='alert alert-info'>No results for this indicator in <b>" + selSettings.countryName + "</b>.</div>");
	}
	else {
		errorContainer.html("<div class='alert alert-warning'>There was an error.</div>");
	}
}

function sortByKeyCountryData(array, key, order='asc') {
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

function checkCountryChartData(indicator) {
	//we take the REST results and put it into a new variable, this ensures the original results are stored unmodified.
	var indicatorResults = CountrySettings.selIndicatorRes[indicator];
	if (CountrySettings.selIndicatorRes[indicator].hasOwnProperty("dimensions")) {
		indicatorResults = CountrySettings.selIndicatorRes[indicator].dimensions;
		//console.log("good");
	}
	else if (CountrySettings.selIndicatorRes[indicator].hasOwnProperty("records")) {
		indicatorResults = CountrySettings.selIndicatorRes[indicator].records;
	}
	if (CountrySettings.selIndicatorRESTdataContext[indicator] == "features"){
		var wmsData = [];
		indicatorResults.forEach(function(object){
			wmsData.push(object['properties']);
		});
		//console.log(wmsData);
		indicatorResults = wmsData
	}
	
	//console.log(indicatorResults)
	//if this is a country linked visualisation, lets clean the results to ensure only ACP countries are showing in the chart.
	if (CountrySettings.selIndicatorMapLayerField  == 'un_m49') {
		indicatorResults = indicatorResults.filter(ACPNUMFilter);
	}
	if (CountrySettings.selIndicatorMapLayerField  == 'iso3') {
		indicatorResults = indicatorResults.filter(ACPISO3Filter);
	}
	if (CountrySettings.selIndicatorMapLayerField  == 'iso2') {
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

	//var indicatorResults = (CountrySettings.selIndicatorRes[indicator].hasOwnProperty("data")) ? CountrySettings.selIndicatorRes[indicator].data : CountrySettings.selIndicatorRes[indicator].records.slice(0);
	var xAxis = jQuery.extend(true, {}, CountrySettings.selIndicatorXaxis[indicator]);
	//sort the xaxis data by year
	//sortByKeyCountryData(indicatorResults, xAxis['data']);
	//sortByKeyCountryData(indicatorResults, CountrySettings.selIndicatorChartSeries[indicator][0].data);
	if(CountrySettings.sort[indicator] == "Ascending"){
		sortByKeyCountryData(indicatorResults, CountrySettings.selIndicatorChartSeries[indicator][0].data, 'asc');
	} 
	if(CountrySettings.sort[indicator] == "Descending"){
		sortByKeyCountryData(indicatorResults, CountrySettings.selIndicatorChartSeries[indicator][0].data, 'desc');
	}
	

	//here we replace the x axis data placeholder with the array of values from the rest service. We only do this if they have assigned a vlaue to that axis.
	if (typeof xAxis['data'] !== 'undefined') {
		var xAxisData = [], testDate, fullDate;
		//console.log(indicatorResults)
		indicatorResults.forEach(function(object) {
			//get the date - it could be a simple year, e.g. 2012 or more complex, e.g. 2016/04/16
			// 	testDate = object[xAxis['data']];
			// 	if (testDate.length === 4){ //assumption is that if the test date is 4 characters long then it is a year
			// 	  fullDate = new Date(testDate, 11, 31); //month index and date
			// 	}else{
			// 	  fullDate = new Date(testDate); 
			// 	}
			// 	xAxisData.push(fullDate.toLocaleString());
			xAxisData.push(object[xAxis['data']]);
		});
		xAxis['data'] = xAxisData;
	}

	var yAxis = jQuery.extend(true, {}, CountrySettings.selIndicatorYaxis[indicator]);
	//here we replace the y axis data placeholder with the array of values from the rest service. We only do this if they have assigned a vlaue to that axis.
	if (typeof yAxis['data'] !== 'undefined') {
		var yAxisData = [];
		indicatorResults.forEach(function(object) {
			yAxisData.push(object[yAxis['data']]);
		});
		yAxis['data'] = yAxisData;
	}

	var mappedField = [];
	indicatorResults.forEach(function(object){
		if(CountrySettings.mapLayerField[indicator]  == 'WDPAID'){
			mappedField.push(parseInt(object[CountrySettings.mappedField[indicator]]));
		} else {
			mappedField.push(object[CountrySettings.mappedField[indicator]]);
		}
		
	});
/* 	var wdpaIDs = [];
	indicatorResults.forEach(function(object) {
		wdpaIDs.push(object['wdpa_id']);
		mappedField.push(object[CountrySettings.selIndicatorMappedField[indicator]]);
	}); */

	//first we get the list of all data series defined in the indicator content type
	//we push these to the chartSeries array
	var chartSeries = [];

	//had a killer time trying to figure out why this damn thing wasn't cloning using other methods. Just leave it like this
	var data = JSON.parse(JSON.stringify(CountrySettings.selIndicatorChartSeries[indicator]));
	for (var key2 in data) {
		// skip loop if the property is from prototype
		if (!data.hasOwnProperty(key2)) continue;
		var obj = data[key2];
		for (var prop in obj) {
			// skip loop if the property is from prototype
			if (!obj.hasOwnProperty(prop)) continue;
			if (prop == 'data') {
				//replace the placeholder of the series map with the actual array from the rest service 
				//obj[prop] = indicatorResults[obj[prop]];
				chartSeries.push(obj[prop])
				//console.log(prop + " = " + obj[prop]);
			}
		}
	}

	//here we exchange the field labels in the array with arrays of the field values. 
	chartSeries.forEach(function(object, index) {
		var chartData = [];
		indicatorResults.forEach(function(object2) {
			chartData.push(object2[chartSeries[index]]);
		});
		chartSeries[index] = chartData;
	});

	//Now we got back into the original results and replace the series data with the arrays 
	//we push these to the chartSeries array
	for (var key2 in data) {
		// skip loop if the property is from prototype
		if (!data.hasOwnProperty(key2)) continue;
		var obj = data[key2];
		for (var prop in obj) {
			// skip loop if the property is from prototype
			if (!obj.hasOwnProperty(prop)) continue;
			if (prop == 'data') {
				//replace the placeholder of the series map with the actual array from the rest service 
				obj[prop] = chartSeries[key2];
				//console.log(prop + " = " + obj[prop]);
			}
		}
		//data[key2]['wdpa'] = wdpaIDs;
		data[key2]['mapFeature'] = mappedField;
	}
	if (sparkLine == true){
		delete xAxis.name;
		delete yAxis.name;
		xAxis.axisLabel = {'show': false};
		yAxis.axisLabel = {'show': false};
		xAxis.axisTick = {'show': false};
		yAxis.axisTick = {'show': false};
		//yAxis.splitLine = {'show': false};
	}
	
	//var wdpa = {type:"bar", data:wdpaIDs, name:"WDPA"};
	CountrySettings.selIndicatorChartProc[indicator] = true;
	var chartSettings = new Object();
	chartSettings['xAxis'] = xAxis;
	chartSettings['yAxis'] = yAxis;
	chartSettings['data'] = data;
	//chartSettings['radar'] = radarSettings;
	return chartSettings;
}

function makeSparkChart(key, chartSettings) {
	var option = {
		title: {
			text: CountrySettings.selIndicators[key] + " for \n" + selSettings.countryName,
			show: false
		},
		color: ['#8fbf4b','#679b95'],
		legend: {
			show: false,
			orient: 'horizontal',
			align: 'left',
			top: '2%',
			left: '2%',
			width: '96%',
			itemGap: 4,
			itemHeight: 7,
			itemWidth: 15,
			padding: 1,
		},
		toolbox: {
			show: false,
			feature: {
				restore: {
					title: 'Restore'
				},
				saveAsImage: {
					title: 'Image',
					name: CountrySettings.selIndicators[key] + " for " + selSettings.countryName
				}
			}
		},
		grid: {
			left: '2%',
			top: 10,
			right: '2%',
			bottom: 10,
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow', // 'line' | 'shadow'
			},
			confine: true
		},
		xAxis: chartSettings.xAxis,
		yAxis: chartSettings.yAxis,
		series: chartSettings.data
	};
	countryCharts[key].setOption(option);
	var option2 = countryCharts[key].getOption();
	return;
}
function makeFullChart(key, chartSettings) {
	var option = {
		title: {
			text: CountrySettings.selIndicators[key] + " for \n" + selSettings.countryName,
			show: false
		},
		color: ['#8fbf4b','#679b95'],
		legend: {
			show: true,
			orient: 'horizontal',
			align: 'left',
			top: '2%',
			left: '2%',
			width: '96%',
			itemGap: 4,
			itemHeight: 7,
			itemWidth: 15,
			padding: 1,
		},
		toolbox: {
			show: true,
			feature: {
				restore: {
					title: 'Restore'
				},
				saveAsImage: {
					title: 'Image',
					name: CountrySettings.selIndicators[key] + " for " + selSettings.countryName
				}
			}
		},
		grid: {
			left: '10%',
			top: 40,
			right: '10%',
			bottom: 100,
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow', // 'line' | 'shadow'
			},
			confine: true
		},
		xAxis: chartSettings.xAxis,
		yAxis: chartSettings.yAxis,
		series: chartSettings.data,
		dataZoom: [
			{   // This dataZoom component controls x-axis by dafault
				type: 'slider', // this dataZoom component is dataZoom component of slider
			}
		],
	};
	bigChart.setOption(option);
	sparkLine = true; //we reset the sparkline just incase the user decides to switch somewhere else
	return;
}