jQuery(document).ready(function($) {
	//console.log("boom");
	selData = {
		info: {
			name: '',
			scope: '',
			policy: '',
			target: '',
			spr: '',
			sprCat: '',
			countries: '',
			targetNum: null,
			qualifier: null,
		},
		data: {
			countries: '',
		},
		map: {
			mapLayerField: '',
			mappedField: '',
			mapPoints: '',
			mapScope: '',
			regionActive: 0,
		},
		chart: {
			invertColors: '',
			chartType: '',
			dataSource: '',
			RESTurl: '',
			RESTdataContext: '',
			RESTfilter: '',
			RESTFields: '',
			RESTFieldLabels: '',
			RESTResults: '',
			Xaxis: '',
			Yaxis: '',
			chartSeries: '',
			sort: '',
			chartRadarSeries: '',
			chartRadarSettings: '',
			ranking: '',
			breakPoints: 0,
			classificationMethod: '',
			colorSwatch: '',
			areaIn: '',
		},
	};
	
	selData.info.scope = globalScope.scope;
	selData.info.policy = globalScope.policy;
	selData.info.target = globalScope.target;
	selData.info.spr = globalScope.spr;
	selData.info.sprCat = globalScope.sprCat;
	
	//Remove ALL layers that are made for map interactions. We will only use the layer that is generated by the TAB now.
	//thisMap.setPaintProperty("regionsFill", "fill-opacity", ["match", ["get", "Group"], [selSettings.regionID], 0, 0.6]);
	//thisMap.setLayoutProperty("ACP_EEZ", 'visibility', 'none');
	
	if (selData.info.spr == 'List'){
		$("div.indicator-breadcrumbs").html(selData.info.spr)
	} else if (selData.info.scope !== ''){
		$("div.indicator-breadcrumbs").html(selData.info.scope + " / " + selData.info.policy + " / " + selData.info.target )
	} else {
		$("div.indicator-breadcrumbs").html(selData.info.spr + " / " + selData.info.sprCat )
	}
		
	//turn on the tabs and set them to the scope found above...
	$( "#pa-card-tabs" ).tabs({heightStyle: "content", activate: changeTheDataAndLayers, create: createIndiCardTabs});
	
	function createIndiCardTabs(){
		//Here we remove all the layers that are not from the user selected fields in the card
		lockScopeLayers();
		changeTheDataAndLayers(true);
	}
	addCardLayers()
	function changeTheDataAndLayers(firstTime = false){
		selData.chart.areaIn = '';
		//console.log("boom");
		if ($("a.edit-indicator.indicator-card-edit-link.use-ajax.menu-tip").length){
			$("div.edit-menu-trigger").css("display", "block");
		}
		var typeOfData = jQuery( "div.field--name-field-indi-get-data-from .field__item").text();
		if (firstTime == true){
			//This IF is needed because if the Card Has a Global value open by default it will not resolve correctly.
			var scopeCheckVal = scopeCheck();
			if (scopeCheckVal == 0){
				if ((typeOfData == "BIOPAMA Geonode") && (jQuery( "div.field--name-field-indi-geonode-global .field__item").text() == "On")){
					//this if for Geonode data
					getGeonodeData("global", "global");
				} else {
					//this is for the REST data
					setupScopeData('global');
				}
			} else {
				//if it's our first load we don't know which card tab we will have open, so we figure it out like this
				updateCardTab();
			}
			return;
		}
		if (selData.info.name == ''){
			selData.info.name = jQuery("div.indicator-row.activeSelection").find('.field--name-title').text();
		}
		
		updateBreadIndicator(selData.info.name);
		currentTab = jQuery( "#pa-card-tabs:visible .ui-tabs-active" ).text()
		switch(currentTab) {
			case 'Global':
				thisMap.flyTo({
					center: [0, -6.66],
					zoom: 1.5
				});
				//if (selSettings.regionID !== null) removeRegion();
				//if (selSettings.ISO2 !== null) removeCountry();
				if ((typeOfData == "BIOPAMA Geonode") && (jQuery( "div.field--name-field-indi-geonode-global .field__item").text() == "On")){
					getGeonodeData("global", "global");
				} else {
					setupScopeData('global');
				}
				break;
			case 'Regional':
				zoomToRegion(selSettings.regionID);
				if ((typeOfData == "BIOPAMA Geonode") && (jQuery( "div.field--name-field-indi-geonode-regional .field__item").text() == "On")){
					getGeonodeData("regional", "REGION");
				} else {
					setupScopeData('regional');
				}
				break;
			case 'National':
				zoomToCountry(selSettings.ISO2);
				if ((typeOfData == "BIOPAMA Geonode") && (jQuery( "div.field--name-field-indi-geonode-country .field__item").text() == "On")){
					getGeonodeData('national', "ISO3");
				} else {
					setupScopeData('national');
				}
				break;
			case 'Local':
				zoomToPA(selSettings.WDPAID)
				if ((typeOfData == "BIOPAMA Geonode") && (jQuery( "div.field--name-field-indi-geonode-pa .field__item").text() == "On")){
					getGeonodeData("local", "WDPAID");
				} else {
					setupScopeData('local');
				}
				break;
			default:
				console.log("nothing to do");
				removeCustomLayers('||a11');
				$("span.indicator-for").text("");
				$("span.indicator-country").text("");
		}
	}
	function getGeonodeData(scopeSelected, scopeID = null){
		//console.log("boom");
		selData.map.mapScope = scopeSelected;
		selData.chart.RESTurl = "https://dopa-services.jrc.ec.europa.eu/services/d6biopamarest/d6biopama/get_indicator_data?format=json&geonode_layer=cp84&indicator_method=area_summaries&entity_id="+ scopeID +"&children=TRUE";
		selData.chart.mappedField = "id";
		selData.chart.sort = "Ascending";
		selData.chart.Yaxis = {"name":"Percent", "nameLocation": "middle", "nameGap": 40, "type":"value", "data":"percent"};
		selData.chart.chartSeries = [{"name":"Percent", "type":"bar", "data":"percent"}];
		switch(scopeSelected) {
			case 'global':
				selData.chart.Xaxis = {"name":"Regions", "nameLocation": "middle", "nameGap": 40, "type":"category", "data":"id"};
				selData.chart.mapLayerField = "Group";
				break;
			case 'regional':
				selData.chart.Xaxis = {"name":"Countries", "nameLocation": "middle", "nameGap": 40, "type":"category", "data":"id"};
				selData.chart.mapLayerField = "iso3";
				break;
			case 'national':
				selData.chart.Xaxis = {"name":"Protected areas", "nameLocation": "middle", "nameGap": 40, "type":"category", "data":"id"};
				selData.chart.mapLayerField = "WDPAID";
				break;
			case 'local':
				selData.chart.RESTurl = "https://dopa-services.jrc.ec.europa.eu/services/d6biopamarest/d6biopama/get_indicator_data?format=json&geonode_layer=cp84&indicator_method=area_summaries&entity_id="+ scopeID;
				selData.chart.Xaxis = {"name":"Protected area", "nameLocation": "middle", "nameGap": 40, "type":"category", "data":"id"};
				selData.chart.mapLayerField = "";
				break;
			default:
				console.log("the Geonode layer is messed up");
				removeCustomLayers('||a11');
		}
		getRestResults();
	}
	
	function setupScopeData(scopeSelected){
		//console.log("boom");
		$("span.indicator-for").text(" for");
		selData.map.mapScope = scopeSelected;
		if (jQuery( "div.field--name-field-indi-data-"+scopeSelected+" div.field--name-field-data-chart" ).length){
			$('.indicator-make-points').on('click', function(e) {
			  mapTheIndicator(chartSettings.data);
			});

			//this is to see if the results have been proccessed for the chart. This will happen the first time the chart is turned on. 
			var indicatorWrapper = $(".field--name-field-indi-data-"+scopeSelected);
			var cardError = '';
			
			//check if there's any assigned countries to mask out the others....
			if ($( ".field--name-field-countries" ).length){
				var indicatorCountriesArray = [];
				$(indicatorWrapper).find( ".field--name-field-countries" ).children().each(function () {
					indicatorCountriesArray.push($(this).text().trim())
				});
				selData.info.countries = indicatorCountriesArray;
			}
			
			if ($( ".field--name-field-indi-get-data-from" ).length){
				selData.chart.dataSource = $(indicatorWrapper).find( ".field--name-field-indi-get-data-from.field__item" ).text();
			} else {
				selData.chart.dataSource = "";
				cardError = cardError + "No data Source was Provided<br>"
			}

			//for each of these we work our way up from the active url. then find the field we need. This is due to the way drupal views generates the table
			if ($( ".field--name-field-data-rest-url" ).length){
				restURL = $(indicatorWrapper).find( ".field--name-field-data-rest-url.field__item" ).text();
				selData.chart.RESTurl = restURL;
				if ((restURL.indexOf('ISO2') >= 0) || (restURL.indexOf('ISO3') >= 0) || (restURL.indexOf('NUM') >= 0)) selData.chart.RESTfilter = 'Country';
				if (restURL.indexOf("Group") >= 0) selData.chart.RESTfilter = 'Region';
				if (restURL.indexOf("WDPAID") >= 0) selData.chart.RESTfilter = 'PA';
			} else {
				selData.selDataRESTurl = "";
				cardError = cardError + "No REST URL has been defined<br>"
			}
			if ($( ".field--name-field-data-country" ).length){
				var dataCountriesArray = [];
				$(indicatorWrapper).find( ".field--name-field-data-country" ).children().each(function () {
					dataCountriesArray.push($(this).text().trim())
				});
				selData.data.countries = dataCountriesArray;
			}
			if ($( ".field--name-field-rest-field-context" ).length){
				selData.chart.RESTdataContext = $(indicatorWrapper).find( ".field--name-field-rest-field-context.field__item" ).text();
			} else {
				selData.chart.RESTdataContext = "";
				cardError = cardError + "No REST Context was Provided<br>"
			}
			if ($( ".field--name-field-data-map-attribute-link" ).length){
				selData.chart.mapLayerField = $(indicatorWrapper).find( ".field--name-field-data-map-attribute-link.field__item" ).text();
			}
			if ($( ".field--name-field-data-rest-map-field-link" ).length){
				selData.chart.mappedField = $(indicatorWrapper).find( ".field--name-field-data-rest-map-field-link.field__item" ).text();
			}
			if ($( ".field--name-field-data-map-attribute-link" ).length){
				selData.chart.mapPoints = $(indicatorWrapper).find( ".field--name-field-indicator-make-map-points.field__item" ).text().trim();
			}
			if ($( ".chart-xaxis" ).length){
				var indicatorXaxis = $(indicatorWrapper).find( ".chart-xaxis" ).text().trim();
				try {
					selData.chart.Xaxis = JSON.parse(indicatorXaxis);
				} catch (e) {
					cardError = cardError + "The X Axis is not setup correctly<br>";
					selData.chart.Xaxis = '{}';
				}
			}
			if ($( ".chart-yaxis" ).length){
				var indicatorYaxis = $(indicatorWrapper).find( ".chart-yaxis" ).text().trim();
				try {
					selData.chart.Yaxis = JSON.parse(indicatorYaxis);
				} catch (e) {
					cardError = cardError + "The Y Axis is not setup correctly<br>";
					selData.chart.Yaxis = '{}';
				}			
			}
			if ($( ".chart-series" ).length){
				var indicatorSeries = $(indicatorWrapper).find( ".chart-series" ).text().trim();
				indicatorSeries = indicatorSeries.replace(/(}\s*\s)+/g, "}||").split("||");
				indicatorSeries.forEach(function(object, index){
					try {
						indicatorSeries[index] = JSON.parse(object);
					} catch (e) {
						cardError = cardError + "Series "+ index +" is not setup correctly<br>";
						indicatorSeries = '{}';
					}	
				});		
				selData.chart.chartSeries = indicatorSeries;
			}
			if ($( ".field--name-field-indicator-or-ranking" ).length){
				selData.chart.ranking = $(indicatorWrapper).find( ".field--name-field-indicator-or-ranking.field__item" ).text().trim()
			}
			if ($( ".field--name-field-data-color-inverse" ).length){
				selData.chart.invertColors = $(indicatorWrapper).find( ".field--name-field-data-color-inverse.field__item" ).text().trim()
			}
			if ($( ".field--name-field-chart-bl-sort" ).length){
				selData.chart.sort = $(indicatorWrapper).find( ".field--name-field-chart-bl-sort.field__item" ).text().trim();
			}
			if ($( ".field--name-field-data-classes" ).length){
				selData.chart.breakPoints = $(indicatorWrapper).find( ".field--name-field-data-classes.field__item" ).text().trim();
			}
			if ($( ".field--name-field-data-classification-method" ).length){
				selData.chart.classificationMethod = $(indicatorWrapper).find( ".field--name-field-data-classification-method.field__item" ).text().trim();
			}
			if ($( ".field--name-field-data-color-swatch" ).length){
				selData.chart.colorSwatch = $(indicatorWrapper).find( ".field--name-field-data-color-swatch.field__item" ).text().trim();
			}
			if ($( ".field--name-field-data-area-not-in" ).length){
				selData.chart.areaIn = $(indicatorWrapper).find( ".field--name-field-data-area-not-in.field__item" ).text().trim();
			} else {
				selData.chart.areaIn = '';
			}
			if (cardError != '') console.log(cardError);
			
			addTabLayers(scopeSelected);
			controlLayerOpacity(scopeSelected);
			getRestResults();
		} else {
			getChart();
		}
	}
});

//this function helps us force off the layers from scopes that are not currently a part of the active data card.
function lockScopeLayers(locked = 1){
	//console.log("boom");
	
	//we need to know ALL the scopeAttributes in ALL the tabs, just so we know which layers should be on for the interaction events... 
	var scopeMapAttributes = [];
	if (jQuery(".field--name-field-indi-data-global").length){
		scopeMapAttributes.push(jQuery(".field--name-field-indi-data-global").find( ".field--name-field-data-map-attribute-link.field__item" ).text());
	}
	if (jQuery(".field--name-field-indi-data-regional").length){
		scopeMapAttributes.push(jQuery(".field--name-field-indi-data-regional").find( ".field--name-field-data-map-attribute-link.field__item" ).text());
	}
	if (jQuery(".field--name-field-indi-data-national").length){
		scopeMapAttributes.push(jQuery(".field--name-field-indi-data-national").find( ".field--name-field-data-map-attribute-link.field__item" ).text());
	}
	if (jQuery(".field--name-field-indi-data-local").length){
		scopeMapAttributes.push(jQuery(".field--name-field-indi-data-local").find( ".field--name-field-data-map-attribute-link.field__item" ).text());
	}
	scopeMapAttributes.push(selData.chart.mapLayerField);
	jQuery.unique(scopeMapAttributes);
	if ((scopeMapAttributes.indexOf("Group") >= 0) || (selData.chart.RESTfilter = 'Group')) {
		selData.map.regionActive = 1;
/* 		thisMap.setPaintProperty("regionsFill", "fill-opacity", 0);
		if (selSettings.regionID !== null){
			thisMap.setFilter('regionsFill', ['!=', 'Group', selSettings.regionID]);
		} else {
			thisMap.setFilter('regionsFill', null);
		}
		thisMap.setLayoutProperty("regionsFill", 'visibility', 'visible');
		//if the regional tab is off (no chart defined, turn it on to make a doughnut)
		if (jQuery(".indi-tab-regional.disable-scope").length > 0){
			//jQuery(".indi-tab-regional").removeClass("disable-scope");
		} */
	} else {
		//thisMap.setLayoutProperty("regionsFill", 'visibility', 'none');
	}
	if ((scopeMapAttributes.indexOf('iso2') >= 0) || (scopeMapAttributes.indexOf('iso3') >= 0) || (scopeMapAttributes.indexOf('un_m49') >= 0) || (selData.chart.RESTfilter = 'Country')) {
		thisMap.setPaintProperty("countryFill", "fill-opacity", 0);
		thisMap.setLayoutProperty("countryFill", 'visibility', 'visible');
		if (selData.map.regionActive == 1){
			//if they don't have a region, but the option to have one is available, it must be selected first.
			if (selSettings.regionID !== null){
				thisMap.setFilter('countryFill', ['==', 'Group', selSettings.regionID]);
			} else {
				thisMap.setLayoutProperty("countryFill", 'visibility', 'none');
			}
		} else {
			thisMap.setFilter('countryFill', null);
		}
		//if the country tab is off (no chart defined, turn it on to make a doughnut)
		if (jQuery(".indi-tab-national.disable-scope").length > 0){
			//jQuery(".indi-tab-national").removeClass("disable-scope");
		}
	} else {
		thisMap.setLayoutProperty("countryFill", 'visibility', 'none');
	}
	if ((scopeMapAttributes.indexOf('WDPAID') >= 0) || (selData.chart.RESTfilter = 'PA')) {
		//thisMap.setPaintProperty("wdpaAcpFillHighlighted", "fill-opacity", 0);
		if (selSettings.ISO2 !== null){
			thisMap.setFilter("wdpaAcpFillHighlighted", ['==', 'ISO3', selSettings.ISO3]);
			thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'visible');
		} else {
			//thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'none');
		}
		if (jQuery(".indi-tab-pa.disable-scope").length > 0){
			//jQuery(".indi-tab-pa").removeClass("disable-scope");
		}
	}
}
function controlLayerOpacity(tab){
	switch(tab) {
		case 'regional':
			if (selData.map.regionActive == 1){
				//thisMap.setFilter('regionsFill', ['!=', 'Group', selSettings.regionID]);
				//thisMap.setPaintProperty("regionsFill", "fill-opacity", 0.6);
			}
			thisMap.setPaintProperty("countryFill", "fill-opacity", 0);
			break;
		case 'national':
			if (selData.map.regionActive == 1){
/* 				thisMap.setFilter('regionsFill', ['!=', 'Group', selSettings.regionID]);
				thisMap.setPaintProperty("regionsFill", "fill-opacity", 0.6); */
				thisMap.setFilter('countryFill', [ "all", ['==', 'Group', selSettings.regionName], ['!=', 'iso3', selSettings.ISO3] ]);
			} else {
				thisMap.setFilter('countryFill', ['!=', 'iso3', selSettings.ISO3]);
			}
			thisMap.setPaintProperty("countryFill", "fill-opacity", 0.6);
			break;
		case 'local':
			break;
		default:
			tabLayerKey = null;
	}
}
function checkForLayersToRemove(){
	//console.log(jQuery(".indi-tab-country.ui-tabs-active").length)
	if (jQuery(".indi-tab-global.ui-tabs-active").length === 0) {
		removeCustomLayers('-gl0b4l');
	}
	if (jQuery(".indi-tab-regional.ui-tabs-active").length === 0){
		removeCustomLayers('-r3g10n');
	}
	if (jQuery(".indi-tab-national.ui-tabs-active").length === 0){
		removeCustomLayers('-n4t10n41');
	}
	if (jQuery(".indi-tab-local.ui-tabs-active").length === 0){
		removeCustomLayers('-l0c4l');
	}
}
function addCardLayers(){
	var tabLayerKey;
	checkForLayersToRemove();
	if (jQuery( ".field--name-field-indi-map-layers-all" ).length){
		tabLayerKey = '-b10p4m4';
		//I change the map layer loading to be different
		var mapLayersArray = [];
		var mapLayerName;
		var mapLayer;
		var mapLegend;
		jQuery( ".field--name-field-indi-map-layers-all .field__items" ).children().each(function () {
			mapLayerName = jQuery(this).find(".map-layer-name").text();
			mapLayer = jQuery(this).find(".map-layer").text();
			mapLegend = jQuery(this).find(".map-legend").text();
			try {
				mapLayer = JSON.parse(mapLayer.replace("'", "\""))
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
				jQuery("#map-legend").show();
				jQuery("#wms-map-legend").append("<div class='"+mapLayer.id+"'><div class='map-legend-title'>"+mapLayerName+"</div><img src="+mapLegend+"></div>");
			} catch (e) {
				console.log("You have a messed up layer for the card")
				mapLayer = '{}'; 
			}	
			//console.log(thisMap.style._layers)
		});
	}
}

function addTabLayers(tab){
	var tabLayerKey;
	checkForLayersToRemove();
	if (jQuery( "div.field--name-field-indi-data-"+tab+" div.field--name-field-data-map-layers" ).length){
		//console.log("found")
		switch(tab) {
			case 'global':
				tabLayerKey = '-gl0b4l||a11';
				break;
			case 'regional':
				tabLayerKey = '-r3g10n||a11';
				break;
			case 'national':
				tabLayerKey = '-n4t10n41||a11';
				break;
			case 'local':
				tabLayerKey = '-l0c4l||a11';
				break;
			default:
				tabLayerKey = null;
		}
		if (tabLayerKey != null){
			//I change the map layer loading to be different
			var mapLayersArray = [];
			var mapLayer;
			var mapLayerName;
			var mapLegend;
			jQuery( "div.field--name-field-indi-data-"+tab+" .field--name-field-data-map-layers.field__items" ).children().each(function () {
				mapLayerName = jQuery(this).find(".map-layer-name").text();
				mapLayer = jQuery(this).find(".map-layer").text();
				mapLegend = jQuery(this).find(".map-legend").text();
				try {
					mapLayer = JSON.parse(mapLayer.replace("'", "\""))
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
					jQuery("#map-legend").show();
					jQuery("#wms-map-legend").append("<div class='"+mapLayer.id+"'><div class='map-legend-title'>"+mapLayerName+"</div><img src="+mapLegend+"></div>");
				} catch (e) {
					console.log("You have a messed up layer in the "+tab+" tab")
					mapLayer = '{}'; 
				}	
				//console.log(thisMap.style._layers)
			});
		}
	}
}

function closeIndicatorCard(){
	var mapLayer = thisMap.getLayer('nan-layer');
	if(typeof mapLayer !== 'undefined') {
		thisMap.removeLayer("nan-layer");
	}
	resetMapPoints();
	removelayergroup();
	chartColorInvertedCheck = 0;
	customStopAmnt = 0;
	firstChartRun = 1;
	customStopPoints = [];
	//removes the card layers
	removeCustomLayers();
	//removes whatever other layers from the tabs.
	removeCustomLayers('||a11');
	jQuery("#map-legend").hide();
	jQuery("#wms-map-legend").empty();
	jQuery("#custom-map-legend").empty();
	jQuery('#block-indicatorcard').hide();
	thisMap.setLayoutProperty("wdpaAcpFill", 'visibility', 'visible');
	thisMap.setLayoutProperty("countryFill", 'visibility', 'visible');
	var indicatorName = jQuery("div.indicator-row.activeSelection").find('.field--name-title').text();
	var indicatorClass = indicatorName.replace(/\s/g, "-");
	if (jQuery(".bread-trail-indicator:visible").length)jQuery(".bread-trail-indicator").one().toggle( "slide" );
	thisMap.setPaintProperty("wdpaAcpFillHighlighted", "fill-opacity", 0.6);
	//thisMap.setPaintProperty("regionsFill", "fill-opacity", 0.6);
	thisMap.setPaintProperty("countryFill", "fill-opacity", 0.6);
	//this is just incase someone closed the country in the breadcrumbs before closing the card.
	if (selSettings.regionID != null){
		//thisMap.setFilter('regionsFill', ['!=', 'Group', selSettings.regionID]);
		thisMap.setFilter('countryFill', ['==', 'Group', selSettings.regionID]);
		thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'visible');
	} else {
		//thisMap.setFilter('regionsFill', null);
		thisMap.setLayoutProperty("countryFill", 'visibility', 'none');
	}
	//thisMap.setLayoutProperty("regionsFill", 'visibility', 'visible');
	
	if (selSettings.ISO3 != null){
		thisMap.setFilter("wdpaAcpFillHighlighted", ['==', 'ISO3', selSettings.ISO3]);
		thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'visible');
	} else {
		thisMap.setLayoutProperty("wdpaAcpFillHighlighted", 'visibility', 'none');
	}
	//thisMap.setLayoutProperty("eezACP", 'visibility', 'visible');
	//removeIndicator(indicatorClass);
	jQuery(".activeSelection" ).prev().remove();
	jQuery(".activeSelection" ).removeClass( "activeSelection" );
	//as there are no charts we turn off the 3D toggle option
	jQuery(".mapboxgl-ctrl-icon.mapboxgl-ctrl-chart-3D").addClass("disabled");
    selData.info.countries = '';
	selData.info.name = '';
}

function updateCardTab(){
	var scopeCheckVal = scopeCheck();
	jQuery("#pa-card-tabs").tabs("option", "active", scopeCheckVal);
}