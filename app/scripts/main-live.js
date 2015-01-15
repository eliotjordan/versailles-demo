/*jslint browser: true*/
/*global L */
(function(window, document, L, undefined) {
  'use strict';

  L.Icon.Default.imagePath = 'images/';

  var BASE_ITEM_URL = 'http://libphp-prod.princeton.edu/versailles/item/',
    BASE_MAP = 'http://libimages.princeton.edu/loris2/' +
      'exhibits%2FVersailles%2Fversailles_13%2FImage00120_vert.jp2/info.json',
    THUMBNAIL_SIZE = 250,
    GEOJSON_URL =  'http://libphp-prod.princeton.edu/versailles/map.json';

  // create leaflet-iiif map
  var map = L.map('map', {
    center: [0, 0],
    crs: L.CRS.Simple,
    zoom: 0
  });

  // add Versailles iiif tile layer
  var tileLayer = L.tileLayer.iiif(BASE_MAP, {}).addTo(map);

  // load geojson from server  https://gist.github.com/mazell/8843945
  function loadJSON(jsonUrl,callback) {   
      var xobj = new XMLHttpRequest();
          xobj.overrideMimeType("application/json");
    xobj.open('GET', jsonUrl, true);
    xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
              callback(xobj.responseText);
            }
      };
      xobj.send(null);  
   }

   // parse features in geosjon
  function onEachFeature(feature, layer) {
    var imageUrl = feature.properties.field_image_id,
      thumbnailUrl = '',
      rotation = feature.properties.rotation.trim() || 0,
      title = feature.properties.name || '',
      itemUrl = BASE_ITEM_URL + feature.properties.nid,
      thumbnailParams = '';

    // generate thumbnail params
    if (rotation !== 0) {
      // if image needs rotation, swap width and height in image request
      thumbnailParams = 'full/' + ',' + THUMBNAIL_SIZE +
        '/' + rotation + '/native.jpg';
    } else {
      thumbnailParams = 'full/' + THUMBNAIL_SIZE +',' +
        '/' + rotation + '/native.jpg';
    }

    // generate thumbnail url
    if (imageUrl) {

      // strip 'info.json' from iiif url and add thumbnail params
      thumbnailUrl = imageUrl.replace(new RegExp('(.*/)[^/]+$'), '$1') +
        thumbnailParams;
    }

    // format popup
    var popupContent = '<div style="width:' + THUMBNAIL_SIZE + 'px;"">' +
      '<a class="popup" href=' + itemUrl + '>' +
      '<h3 class="popup-text">' + title + '</h3>' +
      '<img src=' + thumbnailUrl + '>' +
      '</a>' + '</div>';
    layer.bindPopup(popupContent, {
      minWidth: THUMBNAIL_SIZE
    });
  }

  // add markers to map after all tiles loaded
  function onTilesLoaded() {

    // load geojson from server
    loadJSON(GEOJSON_URL, function(response) {

      // when ready, parse into JSON object
      var itemJSON = JSON.parse(response);

      // create geojson layer 
      var geoJsonLayer = L.geoJson(itemJSON, {
        style: function(feature) {
          return feature.properties && feature.properties.style;
        },

        onEachFeature: onEachFeature
      });

      // create marker cluster with non-default params
      var markers = L.markerClusterGroup({
        spiderfyDistanceMultiplier: 3,
        showCoverageOnHover: false
      });

      // add geojson layer to map
      markers.addLayer(geoJsonLayer);
      map.addLayer(markers);
    });
  }
  tileLayer.on('load', onTilesLoaded);
}(window, document, L));
