function makeDoughnutChart(){
	chartSettings = checkChartData("doughnut");
	var currentMapAttribute;
	//console.log(selData.chart.mapLayerField)
	switch(selData.chart.mapLayerField) {
		case 'Group':
			currentMapAttribute = 'regionID';
			break;
		case 'iso3':
			currentMapAttribute = 'ISO3';
			break;
		case 'iso2':
			currentMapAttribute = 'ISO2';
			break;
		case 'un_m49':
			currentMapAttribute = 'NUM';
			break;
		case 'WDPAID':
			currentMapAttribute = 'WDPAID';
			break;
		default:
			currentMapAttribute = '';
	}
	var dataPosition = jQuery.inArray( selSettings[currentMapAttribute], chartSettings.data[0].mapFeature )
	var paChartVal = chartSettings.data[0].data[dataPosition];
	var inverseVal = 100 - paChartVal;
	option = {
		toolbox: chartToolbox,
		series: [
			{
				name:'back',
				type:'pie',
				radius: ['50%', '70%'],
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
				//animation: false,
			},
			{
				name:'front',
				type:'pie',
				radius: ['52%', '68%'],
				avoidLabelOverlap: false,
				label: {
					normal: {
						show: false,
						position: 'center'
					},
					emphasis: {
						show: true,
						textStyle: {
							fontSize: '30',
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
						label: {
							show: true,
							fontSize: 26,
						}
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
	indicatorChart.setOption(option); 
	return;
}