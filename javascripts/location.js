window.loc = {};
loc.country = "US";
loc.lang = navigator.language || navigator.userLanguage;
loc.temp = "F";
loc.lat = 37.422;
loc.lng = -122.084058;
loc.city = "Mountain View";
$(document).ready(function() {
  var fail = function() {
    $.getJSON("https://freegeoip.net/json/", function(response) {
      locationProcess({coords: {latitude: response.latitude, longitude: response.longitude}});
    });
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(locationProcess, fail, {timeout: 15000});
  } else {
    fail();
  }
  
  setTimeout(localizeAll, 1000);
});

function locationProcess(position) {
  loc.lat = position.coords.latitude;
  loc.lng = position.coords.longitude;
  
  $.ajax({
    url: "https://peaceful-shelf-4149.herokuapp.com/?callback=locationMapsProcess&url=https://maps.googleapis.com/maps/api/geocode/json?latlng="+loc.lat+","+loc.lng+"&sensor=false&key=AIzaSyAnSkhrnJBwqfO_zSSRyqWVjkbHFGXXrZE",
    type: "GET",
    cache: true,
    dataType: "jsonp text json",
    crossDomain: true,
    jsonp: false,
    jsonpCallback: "locationMapsProcess"
  });
}

function locationMapsProcess(data) {
  for (var i = 0; i < data.results.length; i++) {
    var address_components = data.results[i].address_components;
    if (!address_components) {
      continue;
    }
    for (var ii = 0; ii < address_components.length; ii++) {
      var component = address_components[ii];
      if (component.types[0] == "locality") {
        loc.city = component.long_name;
      }
      if (component.types[0] == "country") {
        loc.country = component.short_name;
      }
    }
  }
  
  if (loc.country !== "US") {
    loc.temp = "C";
  }
  
  return data;
};
