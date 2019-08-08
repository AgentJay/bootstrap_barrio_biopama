var filters;
var cql_filters = {'region':'%','country_na':'%','pame_source_year':'%','pame_methodology':'%','marine':'%'};
var cql_filters_type = {'region':'text','country_na':'text','pame_source_year':'text','pame_methodology':'text','marine':'numeric'};

var table_fileds = ['wdpaid','region','country_na','iso3','name','desig','pame_source_year','pame_methodology','marine'];

var preselect = {};

var dt_table;

// function parseResponse(data) {
//       //console.log(data); // outputs 'Foo'
//
//       filters={'region':{},'country':{},'year':{},'tool':{}};
//
//       for (var key in data.features){
//         filters["region"][ data.features[key].properties["region"] ] = true;
//         filters["country"][ data.features[key].properties["country_na"] ] = true;
//         filters["year"][ data.features[key].properties["pame_source_year"] ] = true;
//         filters["tool"][ data.features[key].properties["pame_methodology"] ] = true;
//       }
//       setTimeout(pop_filters(filters),500);
//
//       //return data.features;
//
// }

jQuery(document).ready(function($) {

  Drupal.attachBehaviors($("#pame_assessments_table"));
  Drupal.attachBehaviors($(".cql_filters"));

  $('#spinner').show();

  function set_cql_filters(key,val){

    cql_filters[key] = val;
    cql_filter = [];
    for (k in cql_filters){ 
      if (cql_filters_type[k]=='numeric'){
        if (cql_filters[k] != '%'){
         cql_filter.push( k + "=" + cql_filters[k] );        
        }
      }else{
        cql_filter.push( k + " LIKE '" + cql_filters[k] + "'" );        
      }
    }
    query = {'query':cql_filter.join(' AND '), 'reset':false};
    //console.log(query['query']);

    if (Object.values(cql_filters).join('') == '%%%%%'){
      query['reset'] = true;
    }

    console.log(query);
    return query;

  }

  function pop_filters(data){

      $('#spinner').show();

    //empty filters
    //$('.cql_filters option').remove();
    $.each($('.cql_filters'),function(){
      $(this).find('option').not(':first').remove();
    });
    filters={'region':{},'country':{},'year':{},'tool':{}, 'marine':{}};

    for (var key in data.features){
      filters["region"][ data.features[key].properties["region"] ] = true;
      filters["country"][ data.features[key].properties["country_na"] ] = true;
      filters["year"][ data.features[key].properties["pame_source_year"] ] = true;
      filters["tool"][ data.features[key].properties["pame_methodology"] ] = true;
      filters["marine"][ data.features[key].properties["marine"] ] = true;
    }
        //Create and append the options
        var selec_tools = document.getElementById("assessment_tools");
        for (key in filters["tool"]) {
            var option = document.createElement("option");
            option.value = key;
            option.text = key;
            selec_tools.appendChild(option);
        }

        var select_year = document.getElementById("assessment_year");
        for (key in filters["year"]) {
            var option = document.createElement("option");
            option.value = key;
            option.text = key;
            select_year.appendChild(option);
        }

        var select_region = document.getElementById("assessment_region");
        for (key in filters["region"]) {
            var option = document.createElement("option");
            option.value = key;
            option.text = key;
            select_region.appendChild(option);
        }

        var select_country = document.getElementById("assessment_country");
        for (key in filters["country"]) {
            var option = document.createElement("option");
            option.value = key;
            option.text = key;
            select_country.appendChild(option);
        }

        var select_marine = document.getElementById("assessment_marine");
        for (key in filters["marine"]) {
            var option = document.createElement("option");
            option.value = key;
            option.text = key;
            select_marine.appendChild(option);
        }

          $('#spinner').hide();

  }

   function resetTableData( cql_filter ){

      $('#spinner').show();


     $('#table_assessments thead').empty();
     $('#table_assessments tbody').empty();

     var url = "https://geospatial.jrc.ec.europa.eu/geoserver/biopama/ows?service=WFS&version=1.3.0&request=GetFeature&typeName=biopama%3Awdpa_acp_jul2018_pame_centroids&outputFormat=application%2Fjson";
     url += '&CQL_FILTER='+ encodeURI(cql_filter);
     //console.log(url);
     $.getJSON(url,function(response){
      console.log(response.features);
      var headers = Object.keys(response.features[0].properties);

      // thead
      var thead = $("<tr></tr>");
      $.each(headers,function(idx,lab){
        if( table_fileds.indexOf(lab) > -1){
          thead.append($("<th />").html(lab));
        }
      });
      $('#table_assessments thead').append(thead);

      // tbody
      $.each(response.features,function(idx,obj){

        var row = $('<tr rown="'+idx+'" bbox="'+obj.properties['bbox'].toString()+'" class="assessment_link"></tr>');
        $.each(obj.properties,function(key,val){
         if( table_fileds.indexOf(key) > -1){
          row.append($('<td />').html(val));
         }
        });
        $('#table_assessments tbody').append(row);
      });

      //map.panTo(new L.LatLng(47, 15));
      $('.assessment_link').on('click',function(){
        var bbox = $(this).attr('bbox').split(',').map(Number);
        console.log($(this).attr('bbox').split(','));
        mymap.setView([bbox[1], bbox[0]], 8);

        $('.assessment_link').removeClass('selected');
        $(this).addClass('selected');

        var marqueur = L.marker([bbox[1], bbox[0]]).addTo(mymap);
        //mymap.fitBounds([[bbox[1],bbox[0]],[bbox[3],bbox[2]]]);
        mymap.on('click',function(){
          mymap.removeLayer(marqueur);
        },200);
      });

      pop_filters(response);
      //$('#table_assessments').DataTable();

     });


   }


  /*  -- retrieve json data -- */
//   var ass_url = "https://geospatial.jrc.ec.europa.eu/geoserver/biopama/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=biopama%3Awdpa_acp_jul2018_pame_centroids&outputFormat=text%2Fjavascript&jsonp=parseResponse&callback=?";
   var ass_url = "https://geospatial.jrc.ec.europa.eu/geoserver/biopama/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=biopama%3Awdpa_acp_jul2018_pame_centroids&outputFormat=application%2Fjson";
   //$.getJSON(ass_url);

   $.getJSON(ass_url,function(data){
     pop_filters(data);
     resetTableData('pame_methodology is not null');
   });


  var mymap = L.map('pame_assessments_map').setView([0, 0], 2);

  var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(mymap);
  // WDPA WMS GEOSERVER LAYER - SETUP
  var url = 'https://geospatial.jrc.ec.europa.eu/geoserver/biopama/wms';
  var wdpa_base=L.tileLayer.wms(url, {layers: 'biopama:wdpa_acp_jul2018_pame',transparent: true,format: 'image/png', featureInfoFormat: 'text/javascript',opacity:'0.2', makeLayerQueryable: true,zIndex: 33}).addTo(mymap);

  var wdpa=L.tileLayer.wms(url, {layers: 'biopama:wdpa_acp_jul2018_pame',transparent: true,format: 'image/png',featureInfoFormat: 'text/javascript',opacity:'1', makeLayerQueryable: true,zIndex: 33}).addTo(mymap);

  // WDPA filter
  wdpa.setParams({CQL_FILTER:"pame_methodology  is not null"});





  mymap.on('click', function(e) {
   if (mymap.hasLayer(wdpa)) {
               var latlng= e.latlng;
               var url = getFeatureInfoUrl(
                               mymap,
                               wdpa,
                               e.latlng,
                               {
                                   'info_format': 'text/javascript',  //it allows us to get a jsonp
                                   'propertyName': 'wdpaid,pame_source_year,pame_methodology,name,region,country_na,marine',
                                   'query_layers': 'biopama:wdpa_acp_jul2018_pame',
                                   'format_options':'callback:getJson'
                               }
                           );
                           //console.log(wdpa);
                $.ajax({
                        jsonp: false,
                        url: url,
                        dataType: 'jsonp',
                        jsonpCallback: 'getJson',
                        success: handleJson_featureRequest
                      });

                   function handleJson_featureRequest(data)
                   {
                      if (typeof data.features[0]!=='undefined')
                          {
                             var prop=data.features[0].properties;
                             var filter="wdpaid='"+prop['wdpaid']+"'";
                             hi_highcharts_pa(prop,latlng);

                       }
                       else {
                       }
                  }
    } else{}
  });

  //------------------------------------------------------------------------------
  //  WMS LAYER - GET FEATUREINFO FUNCTION
  //------------------------------------------------------------------------------
  function getFeatureInfoUrl(map, layer, latlng, params) {
      var point = map.latLngToContainerPoint(latlng, map.getZoom()),
          size = map.getSize(),
          bounds = map.getBounds(),
          sw = bounds.getSouthWest(),
          ne = bounds.getNorthEast();
      var defaultParams = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: '',
          version: layer._wmsVersion,
          format: layer.options.format,
          bbox: bounds.toBBoxString(),
          height: size.y,
          width: size.x,
          layers: layer.options.layers,
          info_format: 'text/javascript'
      };

      params = L.Util.extend(defaultParams, params || {});
      params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
      params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
      return layer._url + L.Util.getParamString(params, layer._url, true);
  }



  //---------------------------------------------------------------
  // ONCLICK RESPONSE ON HIGLIGHTED WDPA
  //--------------------------------------------------------------
  function hi_highcharts_pa(info,latlng){
   var wdpaid=info['wdpaid'];
   var name=info['name'];
   var pame_source_year = info['pame_source_year'];
   var pame_methodology = info['pame_methodology'];
   var region = info['region'];
   var country_na = info['country_na'];

if (  pame_methodology !== null ) {
    var popupContentwdpa = '<center class="available"><i class="fas fa-2x fa-paste"></i><p>'+wdpaid+'</p><i>'+name+'</i><hr><i>'+pame_methodology+'</i><hr><i>'+pame_source_year+'</i><hr></center>';
}else{
  var popupContentwdpa = '<center><i class="fas fa-2x fa-spinner"></i><p>'+wdpaid+'</p><i>'+name+'</i><hr><p>PA not yet assessed</p></center>';
}
   var popup = L.popup()
        .setLatLng([latlng.lat, latlng.lng])
        .setContent(popupContentwdpa)
        .openOn(mymap);

  }

  $('.cql_filters').on('change', function() {
    var parameter = $(this).attr('param');
    var value = $(this).val();

      $('#spinner').show();


  //  $(this).hide();
  //  $(this).after('<button class="btn btn-success remove-me" target="'+$(this).attr('id')+'"><i class="fas fa-times-circle"></i> '+value+'</button>');
  //   $('.remove-me').on('click',function(){
  //     var target = '#' + $(this).attr('target');
  //     $(this).remove();
  //     $(target).show();
  //     // $(target+'>option:eq(1)').prop('selected', true);
  //   });

      var cql_filter = set_cql_filters( parameter, value );

    if (cql_filter['reset'] == true){
      wdpa.setParams({styles:"pame_acp_wdpa_all"});
      preselect = {};
    }else{
      wdpa.setParams({styles:"pame_selection"});
    }
    wdpa.setParams({CQL_FILTER:cql_filter['query']});

//    $.when( function(){
      resetTableData(cql_filter['query']);
//    } ).done(function(){
      preselect[$(this).attr('id')] = value;
      setTimeout(function(){
        // console.log(preselect);
        // $('#'+preselect).prop('selectedIndex', 1);
        $.each(preselect,function(key,val){
          $('#'+key).val(val);
        });
      },800);
//    })

  });


});
