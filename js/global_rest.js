/* 
REST  Endpoints
*/
var DOPAgetWdpaExtent = "https://rest-services.jrc.ec.europa.eu/services/d6biopamarest/d6biopama/get_wdpa_extent?format=json&wdpa_id=";
var DOPAgetCountryExtent = "https://rest-services.jrc.ec.europa.eu/services/d6biopamarest/administrative_units/get_country_extent_by_iso?format=json&a_iso=";
var DOPAcountriesGroupExtent = "https://rest-services.jrc.ec.europa.eu/services/d6biopamarest/d6biopama/get_bbox_for_countries_dateline_safe?format=json&iso3codes=";
//Old Radar Plot address?
//var DOPAradarPlot = "https://dopa-services.jrc.ec.europa.eu/services/d6dopa/protected_sites/get_radarplot_all?format=json&wdpaid=";
var DOPAgetRadarPlot = "https://rest-services.jrc.ec.europa.eu/services/d6dopa40/protected_sites/get_wdpa_terrestrial_radarplot?format=json&wdpaid=";
var DOPAgetMarineRadarPlot = "https://rest-services.jrc.ec.europa.eu/services/d6dopa40/protected_sites/get_wdpa_marine_radarplot?format=json&includemetadata=false&wdpaid=";
//var DOPAgetCountryProtCon = "https://rest-services.jrc.ec.europa.eu/services/d6dopa/administrative_units/get_country_protection_protconn?format=json&includemetadata=false&b_iso2=";
//var DOPAgetCountryProtCon = "https://rest-services.jrc.ec.europa.eu/services/d6dopa40/administrative_units/get_country_all_inds?format=json&includemetadata=false&fields=protconn&b_iso2=";
var DOPAgetCountryProtCon = "https://rest-services.jrc.ec.europa.eu/services/d6dopa40/administrative_units/get_country_all_inds?format=json&fields=area_terr_km2,area_terr_perc,area_mar_km2,area_mar_perc,area_prot_km2,area_prot_perc,area_prot_terr_km2,area_prot_terr_perc,area_prot_mar_km2,area_prot_mar_perc,protconn&b_iso2=";
var DOPAgetPaNums = "https://rest-services.jrc.ec.europa.eu/services/d6dopa40/administrative_units/get_country_pa_count?format=json&includemetadata=false&b_iso2=";
var DOPAavgClimate = "https://rest-services.jrc.ec.europa.eu/services/d6dopa40/climate/get_worldclim_pa?format=json&wdpaid=";