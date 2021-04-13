//the global variables that we use in other scripts
var thisMap;  //the map
var tTipDelay = 100;
var mapContainer = 'map-container';
var mapboxTour;
var activeData;
var globalMapObject;
var customStopAmnt = 0;
var customClassMethod = '';
var mapColors;
var firstChartRun = 1;
var chartSeriesGlobal = [];
var mapCustomSwatchCat = "diverging";
var mapCustomSwatchColors = 7;
var selectedStopPoints = [];
var dataHighCurve = [0,1,2,5,8,12,17,30,50];
var customNumStopPoints = 0;
var customStopPoints = [];
var customChartStart;
var customChartStop;
var customColorInvert = null;
var chartColorInvertedCheck = 0;
var customStops;
var mapMarkers = [];
var userPointToggle = 0;
var regionCurrentlyHovered = '';
var countryCurrentlyHoverediso2 = '';
var countryCurrentlyHoverediso3 = '';
var countryCurrentlyHoveredUn = '';
var pasCurrentlyHovered = [];
var countryHover2 = null;
var countryHover3 = null;
var countryHoverNum = null;
var regionHover = null;
var currentTab;
var paintProp;		//this is for the Data layer to have the paint property toggleable
var currentCardScope;
var currentIndicatorNodeURL;
/* 
 * 
 * Tippecanoe Map Layer Names 
 * Search String = BIOPAMA-map-tiles
 *
 */
var mapNonACPCountryLayer = "non_acp_countries";
var mapCountryLayer = "ACP_Countries";
var mapCountryPointLayer = "ACP_Countries_points";
var mapPaLayer = "WDPA2019MayPoly";
var mapPaLabelsLayer = "WDPA2019MayPolyPoints";
var mapPaPointLayer = "WDPA2019MayPoints";
var mapRegionLayer = "ACP_Groups";
var mapSubRegionLayer = "ACP_SubGroups";
var mapRegionPointLayer = "ACP_Groups_points";
var mapSubRegionPointLayer = "ACP_SubGroups_points";
var mapEEZLayer = "ACP_EEZ";
var mapGAULLayer = "ACP_GAUL";

var mapLoader;
var mapGeneric;
var mapZoom;
var paFill;
var mapInfo;
var mapLegend;

var selData = {
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
	},
};

/* 
Chart 
*/
var indicatorChart;
var chartSettings = {};
var chartToolbox = {
	show: true,
	feature: {
		restore: {
			title: 'Restore'
		},
		saveAsImage: {
			title: 'Image',
			name: "Indicator_chart"
		}
	}
};

var chartLegend = {
	show: true,
	orient: 'horizontal',
	align: 'left',
	top: '2%',
	left: '5%',
	width: '80%',
	itemGap: 4,
	itemHeight: 7,
	itemWidth: 15,
	padding: 1,
};
var tourSelectCountry, tourSpatialScale, tourSelectPolicy, tourSelectTarget, tourSelectIndicator;
//We create the object that holds our Global settings 
//!!important!! For the country change, as we need to 'fly' to the country we will not always have the needed map features visible (with the corresponding ISO lookup) in the map the moment the user selects the new country. So we update country settings in 2 parts. First we take the ISO2 code the moment the user changes the setting. THEN we take the other values AFTER the map is done moving
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
var globalScope = {
	scope: '',
	policy: '',
	target: '',
	spr: '',
	sprCat: '',
};

//this is to flag if the user is coming in directly to a country URL to help highlight that country.
var firstVisit = 1;
var regionChanged = 0;
var countryChanged = 0;
var paChanged = 0;
var chart3D = false;
var myCharts = [];
var parts = [];
jQuery(window).resize(function(){
    //resizeChart();
	var height = getWindowHeight();
	resizeMap(height);
    if(jQuery(".indicator-chart")){
      myCharts.forEach(function(object, index){
        myCharts[index].resize();
      });
    }
});
function resizeChart(){
  var chartWidth;
  if(jQuery(".indicator-wrapper")){
    chartWidth = jQuery('.map-menu').outerWidth();
    //chartWidth = document.getElementById(id).clientWidth;
    jQuery('.indicator-chart').css('width', chartWidth);
  }
}
function getWindowHeight(){
	var height = jQuery(window).height();// - $('#admin-menu-wrapper').outerHeight(true) + $('#messages').outerHeight(true);
	if (jQuery('#toolbar-item-administration-tray')[0]){
		var adminHeight = jQuery('#toolbar-item-administration-tray').height() + jQuery('#toolbar-bar').height();
		jQuery('#map-container').css('top', adminHeight);
		height = height - adminHeight;
	}
	return height;
}
function resizeMap(height){
	jQuery('#map-container').css('height', height);
	thisMap.resize();
}
jQuery.fn.extend({
    toggleText: function(a, b){
        return this.text(this.text() == b ? a : b);
    }
});
jQuery.fn.scrollTo = function(elem, speed) { 
    jQuery(this).animate({
        scrollTop:  jQuery(this).scrollTop() - jQuery(this).offset().top + jQuery(elem).offset().top 
    }, speed == undefined ? 1000 : speed); 
    return this; 
};
jQuery.fn.rotate = function(degrees) {
    jQuery(this).css({'transform' : 'rotate('+ degrees +'deg)'});
    return jQuery(this);
};
jQuery.fn.extend({
	formatNumber: function(options){
		var defaults = {
			cents: '.',
			decimal: ','
			}
		var o =  jQuery.extend(defaults, options);
		return this.each(function() {
			var thiz = jQuery(this), values, x, x1, x2;
				values = jQuery.trim(thiz.html());
				values += '';
				x = values.split(o.cents);
				x1 = x[0];
				x2 = x.length > 1 ? o.cents + x[1] : '';
				var rgx = /(\d+)(\d{3})/;
				while (rgx.test(x1)) {
					x1 = x1.replace(rgx, '$1' + o.decimal + '$2');
				}
				thiz.html(x1 + x2);
		});
	}
});
function buildFilter(arr, arg, filter) {
	var filter = [arg, filter];
	if (arr.length === 0) {
		return filter;
	}
	for(var i = 0; i < arr.length; i += 1) {
		filter.push(arr[i]);
	}
	return filter;
}
function precise(x, precision) {
  return Number.parseFloat(x).toFixed(precision);
}
//this function is to fix the issue of the empty DIV being created in D8 templates
function menuDivFix(){
	//detach the result
	var filteredPolicies = jQuery(".active-scope:visible").next().find(".view-id-menu_level_1_policies_").detach();
	//empty the parent (to remove the empty divs)
	jQuery("#block-mapmenuscope .active-scope").next().find("div.views-element-container.col-auto:visible").empty();
	//reattach the result
	filteredPolicies.appendTo(jQuery("#block-mapmenuscope .active-scope").next().find("div.views-element-container.col-auto:visible")).show();
}
function scopeCheck(){
	//if nothing happens in the below check the global tab will be open. This means the global check is not needed as it's the default
	var scopeCheck = null;
	//go down the list of possible combinations and to open the correct tab by default
	//if the variable is set and it hasn't been disabled as a tab, set it
	if((selSettings.WDPAID > 0) && (!jQuery("ul.indicator-card-tabs").children(".indi-tab-local").hasClass("disable-scope"))){
		return 3;
	}else if((selSettings.ISO2 != null) && (!jQuery("ul.indicator-card-tabs").children(".indi-tab-national").hasClass("disable-scope"))){
		return 2;
	}else if((selSettings.regionID != null) && (!jQuery("ul.indicator-card-tabs").children(".indi-tab-regional").hasClass("disable-scope"))){
		return 1;
	}else if(!jQuery("ul.indicator-card-tabs").children(".indi-tab-global").hasClass("disable-scope")){
		return 0;
	}
	//if nothing was found (because the user doesn't have any applicable scope selected) select the highest scope available to give the error message
	if (scopeCheck == null) {
		return 4;
	}
}
function initiateToolTips(){
	jQuery('.ui-accordion-content a[data-toggle="tooltip"]').tooltip({
            template: tipTopTemplate,
            placement: "top",
            container: '#accordion_right_side',
            delay: 200,
            trigger:"hover",
			      html: true,
        });
  
}
