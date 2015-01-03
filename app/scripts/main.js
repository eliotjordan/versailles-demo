/*jslint browser: true*/
/*global L */
(function(window, document, L, undefined) {
  'use strict';

  L.Icon.Default.imagePath = 'images/';

  var BASE_ITEM_URL = 'http://libphp-dev.princeton.edu/versailles/item/',
    BASE_LAYER = 'http://libimages.princeton.edu/loris2/' +
      'exhibits%2FVersailles%2Fversailles_13%2FImage00120_vert.jp2/info.json',
    THUMBNAIL_SIZE = 250;

  // create leaflet-iiif map
  var map = L.map('map', {
    center: [0, 0],
    crs: L.CRS.Simple,
    zoom: 0
  });

  // add Versaille iiif tile layer
  var tileLayer = L.tileLayer.iiif(BASE_LAYER, {}).addTo(map);

  function onEachFeature(feature, layer) {
    var imageUrl = feature.properties.iiif,
      thumbnailUrl = '',
      itemUrl = BASE_ITEM_URL + feature.id;

    if (imageUrl) {

      // Strip 'info.json' from iiif url and add thumbnail params
      thumbnailUrl = imageUrl.replace(new RegExp('(.*/)[^/]+$'), '$1') +
        'full/' + THUMBNAIL_SIZE + ',' + '/0/native.jpg';
    }

    var popupContent = '<a href=' + itemUrl + '>' +
      '<img src=' + thumbnailUrl + '>' +
      '</a>';
    layer.bindPopup(popupContent, {
      minWidth: THUMBNAIL_SIZE
    });
  }

  var geoJsonLayer = L.geoJson(sectionA, {
    style: function(feature) {
      return feature.properties && feature.properties.style;
    },
    onEachFeature: onEachFeature
  });

  var markers = L.markerClusterGroup({
    spiderfyDistanceMultiplier: 3
  });
  markers.addLayer(geoJsonLayer);

  // add markers to map after all tiles loaded
  function onTilesLoaded() {
    map.addLayer(markers);
  }
  tileLayer.on('load', onTilesLoaded);
}(window, document, L));
