var mapsKey = "AIzaSyAnSkhrnJBwqfO_zSSRyqWVjkbHFGXXrZE";

window.maps = {};

//DEFAULT

maps.handleQuery = function(query, success, fail) {
  if (!query) {
    fail();
    return;
  }
  
  var cardmap = $("<div style=\"display: none;\"></div>");
  $("body").append(cardmap);
  
  var map = new google.maps.Map(cardmap[0], {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: new google.maps.LatLng(37.422, -122.084058),
    zoom: 12
  });
  var service = new google.maps.places.PlacesService(map);
  service.textSearch({
    location: new google.maps.LatLng(loc.lat, loc.lng),
    radius: "500",
    query: query
  }, function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      var place = results[0];
      maps.addCard({title: place.name || place.formatted_address, content: place, id: idify(place.formatted_address), map_query: query}, success, fail);
    } else {
      fail();
    }
  });
  
  cardmap.remove();
};

maps.addCard = function(data, success, fail) {
  if ($("#"+data.id+"-maps").length > 0) {
    success();
    return;
  }
  var card = $("<div class=\"card card-maps\" id=\""+data.id+"-maps\"><h2><a href=\"https://maps.google.com/maps/search/"+encodeURI(data.map_query).replace(new RegExp("%20", "g"), " ")+"\">"+data.title+"</a></h2></div>");
  var cardmap = $("<div style=\"height: 320px; margin: 0 -12px -4px -12px; pointer-events: none;\"></div>");
  card.append(cardmap);
  appendCard(card);
  animateCard(card);
  var pos = new google.maps.LatLng(data.content.geometry.location.k, data.content.geometry.location.D);
  var map = new google.maps.Map(cardmap[0], {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: pos,
    zoom: 12,
  });
  var marker = new google.maps.Marker({
    position: pos,
    title: data.content.formatted_address
  });
  marker.setMap(map);
  if (!data.reloader) {
    data.reloader = "maps";
    pinCard(data);
  }
  success();
};

//DIRECTIONS

mapsDirections = {};

mapsDirections.handleQuery = function(query, success, fail, data, card) {
  var cardmap = $("<div style=\"display: none;\"></div>");
  $("body").append(cardmap);
  
  var map = new google.maps.Map(cardmap[0], {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: new google.maps.LatLng(37.422, -122.084058),
    zoom: 12
  });
  var service = new google.maps.DirectionsService(map);
  service.route({
    origin: data.map_saddr,
    destination: data.map_daddr,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(directions, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      data.content = directions;
      data.id = idify(directions.ic.origin+"+-+"+directions.ic.destination);
      data.map_query = query;
      mapsDirections.addCard(data, success, fail);
    } else {
      fail();
    }
  });
  
  cardmap.remove();
};

mapsDirections.addCard = function(data, success, fail) {
  if ($("#"+data.id+"-mapsDirections").length > 0) {
    success();
    return;
  }
  var card = $("<div class=\"card card-maps-dir\" id=\""+data.id+"-mapsDirections\"><h2><a href=\"https://maps.google.com/maps/search/"+encodeURI(data.map_query)+"\">"+data.title+"</a></h2></div>");
  var cardmap = $("<div style=\"height: 320px; margin: 0 -12px -4px -12px; pointer-events: none;\"></div>");
  card.append(cardmap);
  appendCard(card);
  animateCard(card);
  //var pos = new google.maps.LatLng(data.content.geometry.location.k, data.content.geometry.location.D);
  var pos = new google.maps.LatLng(0, 0);
  var map = new google.maps.Map(cardmap[0], {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: pos,
    zoom: 12,
  });
  var directions = new google.maps.DirectionsRenderer();
  directions.setMap(map);
  directions.setDirections(data.content);
  map.fitBounds(data.content.routes[0].bounds);
  if (!data.reloader) {
    data.reloader = "mapsDirections";
    pinCard(data);
  }
  success();
};

maps.colors = {bg: "#F90101", fg: ""};
maps.name = "maps";

window.sources = window.sources || [];
window.sources.push(maps);
localize.addTranslation("en", "sources.maps", "Google Maps");
localize.addTranslation("de", "sources.maps", "Google Maps");
