function makeDOPARadar(containerID){
	if ((jQuery(".view-breadcrumb-protected-area-summary:visible").length)){
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
		});	
	}
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
