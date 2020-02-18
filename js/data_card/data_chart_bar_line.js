function makeBarLineChart(colorUpdate = 0){
	chartSettings = checkChartData("barLine");
	var symbolSize = 20;
	//the first time this runs it's 'clean' IE. I don't inject the color values. But then as it's getting updated after the first draw the color values are nested inside... 
	//so can only run it once (the first time)
	if (firstChartRun){
		firstChartRun = 0;
		chartSeriesGlobal = (chartSettings.data).slice();
		//console.log(chartSeriesGlobal)
	}
	var option = {
		title: {
			text: selData.info.name + " for \n" + selSettings.countryName,
			show: false
		}, 
		legend: chartLegend,
		toolbox: chartToolbox,
		tooltip: {
			trigger: 'axis',
			axisPointer : {            
				type : 'shadow',        // 'line' | 'shadow'
			},
			position: [60, 30],
			enterable: true,
			formatter: function (params) {
				var tooltip = makeTTwMap(params, chartSettings.data)
				return tooltip;
			}
		},
		xAxis: chartSettings.xAxis,
		yAxis: chartSettings.yAxis,
		dataZoom: [
			{   // This dataZoom component controls x-axis by dafault
				type: 'slider', // this dataZoom component is dataZoom component of slider
			}
		],
		series: chartSettings.data
	}; 
	indicatorChart.setOption(option); 
	highlightMapFeature();
	if (colorUpdate == 0){
		mapTheIndicator(chartSettings.data);
	}

	indicatorChart.on('dataZoom', function (params) {
		mapTheIndicator(chartSettings.data);
	});

	function makeTTwMap(params, data){
		//console.log(params[0].axisValue)
		var toolTip = params[0].axisValue;
		params.forEach(function(element) {
			if (typeof element.data === 'object'){
				toolTip += "<br>" + element.seriesName + ": " + element.data.value;
			} else{
				toolTip += "<br>" + element.seriesName + ": " + element.data;
			}
			
		});
		var mapFeature = data[0].mapFeature[params[0].dataIndex];
		if (mapFeature){
			switch(selData.chart.mapLayerField){
				case 'WDPAID':
					thisMap.setFilter('wdpaAcpHover', ['==', selData.chart.mapLayerField, mapFeature]);
					thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'visible');	
					break;
				case 'iso2':
				case 'iso3':
				case 'un_m49':
					thisMap.setFilter('countryHover', ['==', selData.chart.mapLayerField, mapFeature]);
					thisMap.setLayoutProperty("countryHover", 'visibility', 'visible');	
					break;
				case 'Group':
					thisMap.setFilter("regionHover", ['==', selData.chart.mapLayerField, mapFeature]);
					thisMap.setLayoutProperty("regionHover", 'visibility', 'visible');
					break;
				default:
					console.log("map feature not detected for chart hover event");
					break;
			}
			if (jQuery(".marker").length > 0 ){
				jQuery(".marker").css({ 'background': 'rgba(255, 152, 0, 0.5)', "border": "1px solid rgba(255, 152, 0, 1)" }); 
				jQuery(".wdpa-id-" + data[0].mapFeature[params[0].dataIndex]).css({ 'background': 'rgba(103, 155, 149, 0.6)', "border": "2px solid #679b95" });
			}	
		}
		return toolTip;
	}
/* 	var chartHighlight = null;
	indicatorChart.on('mouseover', function (params) {
		console.log("mouseover")
		console.log(params)
	}); 
	indicatorChart.on('mousemove', function (params) {
		console.log("mousemove")
		console.log(params)
	});  */
	indicatorChart.on('click', function (params) {
		//console.log(params)
		if (params.componentType === 'series'){
			var mapFeature = option.series[0].mapFeature[params.dataIndex];
			//TODO - instead if just highlighting on click, we should see if there's a tab we can navigate to based on the current selection.
			switch(selData.chart.mapLayerField){
				case 'WDPAID':
					selSettings.WDPAID = mapFeature;
					thisMap.setFilter('wdpaAcpSelected', ['==', 'WDPAID', mapFeature]);
					thisMap.setLayoutProperty("wdpaAcpSelected", 'visibility', 'visible');
					paChanged = 1;
					zoomToPA(mapFeature);	
					break;
				case 'iso2':
				case 'iso3':
				case 'un_m49':
					selSettings.ISO2 = option.series[0].countryISO2[params.dataIndex];
					countryChanged = 1;
					updateCountry('iso2');
					break;
				case 'Group':
					selSettings.regionID = mapFeature;
					regionChanged = 1;
					zoomToRegion(selSettings.regionID, false);
					break;
				default:
					console.log("map feature not detected for zoom event");
					break;
			}
			highlightMapFeature();
		}
	}); 
	
	jQuery(".indicator-content-wrapper").on('mouseout', function (params) {
		thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'none');
		if (jQuery(".marker").length > 0 ){
			jQuery(".marker").css({ 'background': 'rgba(255, 152, 0, 0.5)', "border": "1px solid rgba(255, 152, 0, 1)" }); 
		}	
		highlightMapFeature();
	});
	return;
}

function makeScatterChart(){
	chartSettings = checkChartData("scatter");
	var option = {
		legend: chartLegend,
		toolbox: chartToolbox,
		tooltip: {
			trigger: 'axis',
			axisPointer : {            
				type : 'shadow',        // 'line' | 'shadow'
			},
			confine: false,
			enterable: true,
			formatter: function (params) {
				var tooltip = makeTTwMap(params, chartSettings.data)
				return tooltip;
			}
		},
		xAxis: chartSettings.xAxis,
		yAxis: chartSettings.yAxis,
		dataZoom: [
			{   // This dataZoom component controls x-axis by dafault
				type: 'slider', // this dataZoom component is dataZoom component of slider
			}
		],
		series: chartSettings.data
	}; 
	indicatorChart.setOption(option); 

	highlightMapFeature();
	
	mapTheIndicator(chartSettings.data);

	indicatorChart.on('dataZoom', function (params) {
		mapTheIndicator(chartSettings.data);
	});

	function makeTTwMap(params, data){
		var toolTip = "";
		params.forEach(function(element) {
			toolTip += element.axisValueLabel + "<br>" + element.seriesName + ": " + element.data + "<br>"
		});
		var mapFeature = data[0].mapFeature[params[0].dataIndex];
		if (mapFeature){
			switch(selData.chart.mapLayerField){
				case 'WDPAID':
					thisMap.setFilter('wdpaAcpHover', ['==', selData.chart.mapLayerField, mapFeature]);
					thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'visible');	
					break;
				case 'iso2':
				case 'iso3':
				case 'un_m49':
					thisMap.setFilter('countryHover', ['==', selData.chart.mapLayerField, mapFeature]);
					thisMap.setLayoutProperty("countryHover", 'visibility', 'visible');	
					break;
				case 'Group':
					thisMap.setFilter("regionHover", ['==', selData.chart.mapLayerField, mapFeature]);
					thisMap.setLayoutProperty("regionHover", 'visibility', 'visible');
					break;
				default:
					console.log("map feature not detected for chart hover event");
					break;
			}
			if (jQuery(".marker").length > 0 ){
				jQuery(".marker").css({ 'background': 'rgba(255, 152, 0, 0.5)', "border": "1px solid rgba(255, 152, 0, 1)" }); 
				jQuery(".wdpa-id-" + data[0].mapFeature[params[0].dataIndex]).css({ 'background': 'rgba(103, 155, 149, 0.6)', "border": "2px solid #679b95" });
			}	
		}
		return toolTip;
	}

	indicatorChart.on('click', function (params) {
		if (params.componentType === 'series'){
			var mapFeature = option.series[0].mapFeature[params.dataIndex];
			//TODO - instead if just highlighting on click, we should see if there's a tab we can navigate to based on the current selection.
			switch(selData.chart.mapLayerField){
				case 'WDPAID':
					selSettings.WDPAID = mapFeature;
					thisMap.setFilter('wdpaAcpSelected', ['==', 'WDPAID', mapFeature]);
					thisMap.setLayoutProperty("wdpaAcpSelected", 'visibility', 'visible');
					paChanged = 1;
					zoomToPA(mapFeature);	
					break;
				case 'iso2':
					selSettings.ISO2 = mapFeature;
					countryChanged = 1;
					updateCountry('iso2');
					break;
				case 'iso3':
					selSettings.ISO3 = mapFeature;
					countryChanged = 1;
					updateCountry('iso3');
					break;
				case 'un_m49':
					selSettings.NUM = mapFeature;
					countryChanged = 1;
					updateCountry('num');
					break;
				case 'Group':
					regionChanged = 1;
					zoomToRegion(selSettings.regionID, false);
					break;
				default:
					console.log("map feature not detected for zoom event");
					break;
			}
			highlightMapFeature();
		}
	}); 
	
	jQuery(".indicator-content-wrapper").on('mouseout', function (params) {
		thisMap.setLayoutProperty("wdpaAcpHover", 'visibility', 'none');
		if (jQuery(".marker").length > 0 ){
			jQuery(".marker").css({ 'background': 'rgba(255, 152, 0, 0.5)', "border": "1px solid rgba(255, 152, 0, 1)" }); 
		}	
		highlightMapFeature();
	});
	return;
}