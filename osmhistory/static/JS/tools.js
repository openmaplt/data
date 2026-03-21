L.LatLngBounds.prototype.expand = function (that) {
  if (!this._southWest && !this._northEast) {
    this._southWest = new L.LatLng(that._southWest.lat, that._southWest.lng, true);
    this._northEast = new L.LatLng(that._northEast.lat, that._northEast.lng, true);
  } else {
    this._southWest.lat = Math.min(that._southWest.lat, this._southWest.lat);
    this._southWest.lng = Math.min(that._southWest.lng, this._southWest.lng);
    this._northEast.lat = Math.max(that._northEast.lat, this._northEast.lat);
    this._northEast.lng = Math.max(that._northEast.lng, this._northEast.lng);
  }
};

var iconBlue = L.Icon.Default;
var iconRed = new L.Icon({
    iconUrl: '/static/leaflet-0.4/images/marker-red.png',
    iconSize: new L.Point(25, 41),
    iconAnchor: new L.Point(13, 41),
    popupAnchor: new L.Point(1, -34),
    shadowSize: new L.Point(41, 41)

  });
var iconGreen = new L.Icon({
    iconUrl: '/static/leaflet-0.4/images/marker-green.png',
    iconSize: new L.Point(25, 41),
    iconAnchor: new L.Point(13, 41),
    popupAnchor: new L.Point(1, -34),
    shadowSize: new L.Point(41, 41)
  });

function createOsmMap(divId) {
  var map = new L.Map(divId);
  
  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib = 'Map data (c) OpenStreetMap contributors';
  var osm = new L.TileLayer(osmUrl, {minZoom: 2, maxZoom: 18, attribution: osmAttrib});   
  map.addLayer(osm);
  return map;
}

function addNodeToMap(map, nodeId, lat, lon, color) {
  var options = {};
  if(color == 'red') options['icon'] = iconRed;
  else if(color == 'green') options['icon'] = iconGreen;

  var markerLocation = new L.LatLng(lat, lon);
  var marker = new L.Marker(markerLocation, options);
  var htmlPopup = '<a href="/node/'+nodeId+'"><b>Node '+nodeId+'</b></a>'+
  	'<pre>Lat:'+lat+'\nLon:'+lon+'</pre>';
  marker.bindPopup(htmlPopup);
  map.addLayer(marker);
  map.setView(markerLocation, 15);
}

function addWayToMap(map, wayId, points, color) {
  var options = {};
  if(color) options['color'] = color;

  var bounds;
  try {
    bounds = map.getBounds();
  }
  catch (error) {
    //Left bounds uninitialized
  }

  if(points.length > 0) {
    var mapPoints = [];
    for (var i = 0; i <points.length; i++) {
      var p1 = new L.LatLng(points[i][0], points[i][1]);
      mapPoints.push(p1);
    };

    var polyline = new L.Polyline(mapPoints, options);
    var htmlPopup = '<a href="/way/'+wayId+'"><b>Way '+wayId+'</b></a>';
    polyline.bindPopup(htmlPopup);
    map.addLayer(polyline);

    if(bounds) {
      bounds.expand(polyline.getBounds());
    }
    else {
      bounds = polyline.getBounds();
    }
    map.fitBounds(bounds);
  }
}

function addRelationToMap(map, relationId, nodes, ways, color) {
  var options = {};
  if(color) options['color'] = color;

  var bounds = null;
  try {
    bounds = map.getBounds();
  }
  catch (error) {
    //Left bounds uninitialized
  }
  var htmlPopup = '<a href="/relation/'+relationId+'"><b>Relation '+relationId+'</b></a>';

  for(var i=0; i<nodes.length; i++) {
    var markerLocation = new L.LatLng(nodes[i][0], nodes[i][1]);
    var marker = new L.Marker(markerLocation, options);
    marker.bindPopup(htmlPopup);
    map.addLayer(marker);
    if(bounds === null) {
      bounds = new L.LatLngBounds(markerLocation, markerLocation);
    }
    else {
      bounds.extend(markerLocation)
    }
  }

  for(var i=0; i<ways.length; i++) {
    var polyline = createPolyline(ways[i]);
    polyline.bindPopup(htmlPopup);
    map.addLayer(polyline);
    if(bounds === null) {
      bounds = polyline.getBounds();
    }
    else {
      bounds.expand(polyline.getBounds());
    }
  }

  if(bounds !== null) {
    map.fitBounds(bounds);
  }
}

function createPolyline(nodes, color) {
  var options = {};
  if(color) options['color'] = color;

  var mapPoints = [];
  for (var i = 0; i <nodes.length; i++) {
    var p1 = new L.LatLng(nodes[i][0], nodes[i][1]);
    mapPoints.push(p1);
  }
  var polyline = new L.Polyline(mapPoints, options);
  return polyline;
}
