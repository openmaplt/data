var iconBlue = '#0000FF';
var iconRed = '#FF0000';
var iconGreen = '#008000';

// Global registry for active maps
var osmHistoryMaps = {};

function getMapForDiv(divId) {
  return osmHistoryMaps[divId];
}

// WebGL Context Management (Lazy Loading)
var MapLazyLoader = {
  observer: null,
  registry: {}, // divId -> { renderFn }

  init: function () {
    if (this.observer) return;
    var self = this;
    this.observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var divId = entry.target.id;
        var item = self.registry[divId];
        if (!item) return;

        if (entry.isIntersecting) {
          if (!osmHistoryMaps[divId]) {
            // console.log("Creating map:", divId);
            item.renderFn();
          }
        } else {
          if (osmHistoryMaps[divId]) {
            // console.log("Removing map:", divId);
            osmHistoryMaps[divId].remove();
            delete osmHistoryMaps[divId];
          }
        }
      });
    }, { rootMargin: '400px' });
  },

  register: function (divId, renderFn) {
    this.init();
    var el = document.getElementById(divId);
    if (!el) return;
    this.registry[divId] = { renderFn: renderFn };
    this.observer.observe(el);
  }
};

function createOsmMap(divId) {
  var map = new maplibregl.Map({
    container: divId,
    style: 'https://openmap.lt/styles/map.json',
    center: [23.9, 55.0],
    zoom: 6,
    maxZoom: 22,
    trackResize: false // Performance boost
  });

  map.addControl(new maplibregl.NavigationControl());

  osmHistoryMaps[divId] = map;

  // Custom properties to store data for when styles load
  map.osmHistoryData = {
    featuresToAdd: [],
    markers: [],
    bounds: new maplibregl.LngLatBounds()
  };

  map.on('load', function () {
    if (map.osmHistoryData.featuresToAdd.length > 0) {
      addStoredFeatures(map);
    }
  });

  return map;
}

function processMapBounds(map) {
  if (map.osmHistoryData.boundsTimer) clearTimeout(map.osmHistoryData.boundsTimer);
  map.osmHistoryData.boundsTimer = setTimeout(function () {
    if (!map.osmHistoryData.bounds.isEmpty()) {
      map.fitBounds(map.osmHistoryData.bounds, { padding: 50, maxZoom: 15, animate: false });
    }
  }, 100);
}

function addNodeToMap(map, nodeId, lat, lon, color) {
  var colorHex = iconBlue;
  if (color == 'red') colorHex = iconRed;
  else if (color == 'green') colorHex = iconGreen;
  else if (color == 'blue') colorHex = iconBlue;
  else if (color) colorHex = color;

  var popupHtml = '<div class="osm-popup-header"><a href="/node/' + nodeId + '">Node ' + nodeId + '</a></div>' +
    '<div class="osm-popup-coords"><div>Lat: ' + lat.toFixed(6) + '</div><div>Lon: ' + lon.toFixed(6) + '</div></div>';

  var marker = new maplibregl.Marker({ color: colorHex })
    .setLngLat([lon, lat])
    .setPopup(new maplibregl.Popup({ offset: 5 }).setHTML(popupHtml))
    .addTo(map);

  map.osmHistoryData.markers.push(marker);
  map.osmHistoryData.bounds.extend([lon, lat]);
  processMapBounds(map);
}

function _storeAndRenderFeatures(map, feature) {
  map.osmHistoryData.featuresToAdd.push(feature);
  if (map.loaded() || map.isStyleLoaded()) {
    addStoredFeatures(map);
  } else {
    // Only register once if not already added
    if (!map.osmHistoryData.loadEventAdded) {
      map.osmHistoryData.loadEventAdded = true;
      map.once('load', function () { addStoredFeatures(map); });
    }
  }
}

function addWayToMap(map, wayId, points, color) {
  var colorHex = iconBlue;
  if (color == 'red') colorHex = iconRed;
  else if (color == 'green') colorHex = iconGreen;
  else if (color == 'blue') colorHex = iconBlue;
  else if (color) colorHex = color;

  var coords = [];
  for (var i = 0; i < points.length; i++) {
    coords.push([points[i][1], points[i][0]]); // MapLibre takes [lng, lat]
    map.osmHistoryData.bounds.extend([points[i][1], points[i][0]]);
  }

  if (coords.length > 0) {
    var feature = {
      'type': 'Feature',
      'properties': {
        'id': String(wayId),
        'color': colorHex,
        'popupHtml': '<a href="/way/' + wayId + '">Way ' + wayId + '</a>'
      },
      'geometry': {
        'type': 'LineString',
        'coordinates': coords
      }
    };
    _storeAndRenderFeatures(map, feature);
    processMapBounds(map);
  }
}

function addStoredFeatures(map) {
  var sourceId = 'osmhistory-lines';
  var layerId = 'osmhistory-lines-layer';

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': map.osmHistoryData.featuresToAdd
      }
    });

    map.addLayer({
      'id': layerId,
      'type': 'line',
      'source': sourceId,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': ['get', 'color'],
        'line-width': 4
      }
    });

    // Add click event for popup
    map.on('click', layerId, function (e) {
      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.popupHtml)
        .addTo(map);
    });

    // Change cursor
    map.on('mouseenter', layerId, function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', layerId, function () {
      map.getCanvas().style.cursor = '';
    });
  } else {
    map.getSource(sourceId).setData({
      'type': 'FeatureCollection',
      'features': map.osmHistoryData.featuresToAdd
    });
  }

  processMapBounds(map);
}

function addRelationToMap(map, relationId, nodes, ways, color) {
  var colorHex = iconBlue;
  if (color == 'red') colorHex = iconRed;
  else if (color == 'green') colorHex = iconGreen;
  else if (color == 'blue') colorHex = iconBlue;
  else if (color) colorHex = color;

  var popupHtml = '<a href="/relation/' + relationId + '">Relation ' + relationId + '</a>';

  for (var i = 0; i < nodes.length; i++) {
    var marker = new maplibregl.Marker({ color: colorHex })
      .setLngLat([nodes[i][1], nodes[i][0]])
      .setPopup(new maplibregl.Popup({ offset: 10 }).setHTML(popupHtml))
      .addTo(map);
    map.osmHistoryData.markers.push(marker);
    map.osmHistoryData.bounds.extend([nodes[i][1], nodes[i][0]]);
  }

  for (var i = 0; i < ways.length; i++) {
    var coords = [];
    for (var j = 0; j < ways[i].length; j++) {
      coords.push([ways[i][j][1], ways[i][j][0]]);
      map.osmHistoryData.bounds.extend([ways[i][j][1], ways[i][j][0]]);
    }

    if (coords.length > 0) {
      var feature = {
        'type': 'Feature',
        'properties': {
          'id': String(relationId) + '-' + i,
          'color': colorHex,
          'popupHtml': popupHtml
        },
        'geometry': {
          'type': 'LineString',
          'coordinates': coords
        }
      };
      map.osmHistoryData.featuresToAdd.push(feature);
    }
  }

  if (map.loaded() || map.isStyleLoaded()) {
    addStoredFeatures(map);
  } else {
    if (!map.osmHistoryData.loadEventAdded) {
      map.osmHistoryData.loadEventAdded = true;
      map.once('load', function () { addStoredFeatures(map); });
    }
  }
  processMapBounds(map);
}

function createPolyline(nodes, color) {
  return null;
}
