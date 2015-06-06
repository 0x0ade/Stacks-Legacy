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

window.langs = {
  "en": {
    "search": "Search",
    "search.voice": "Voice Search",
    "search.sayog": "Say \"Ok Google\"",
    "search.voice.now": "Speak now...",
    "search.voice.example": "For example: \"Weather\"",
    "search.voice.allow": "Please allow voice recognition.",
    "search.voice.error": "Something went wrong.",
    "card.add": "Add Card",
    "card.add.close": "Close",
    "card.clear": "Clear All",
    "card.top": "Top",
    "card.down": "Down",
    "card.remove": "Remove",
    "cbar.me": "+Me",
    "cbar.gmail": "Gmail",
    "cbar.images": "Images",
    "gcard.in": " in ",
    "doodle.enable": "Google Doodle",
    sources: {}
  }, "de": {
    "search": "Suchen",
    "search.voice": "Sprachsuche",
    "search.sayog": "\"Ok Google\" sagen",
    "search.voice.now": "Jetzt sprechen...",
    "search.voice.example": "Beispiel: \"Wetter\"",
    "search.voice.allow": "Bitte die Spracherkennung aktivieren.",
    "search.voice.error": "Irgendetwas ging schief.",
    "card.add": "Karte hinzufügen",
    "card.add.close": "Schließen",
    "card.clear": "Alle entfernen",
    "card.top": "Nach ganz oben",
    "card.down": "Nach unten",
    "card.remove": "Entfernen",
    "cbar.me": "+Ich",
    "cbar.gmail": "Gmail",
    "cbar.images": "Bilder",
    "gcard.in": " in ",
    "doodle.enable": "Google Doodle",
    sources: {}
  }
};

function getLocalized(key) {
  var lang = langs[loc.lang]
  if (!lang) {
    lang = langs["en"];
  }
  return lang[key] || lang.sources[key] || ("["+key+"]");
};

var localizedAll = false;
function localizeAll() {
  if (localizedAll) {
    return;
  }
  localizedAll = true;
  
  $("[locale-key]").each(function() {
    var key = $(this).attr("locale-key");
    var attr = $(this).attr("locale-attr");
    if (!attr) {
      $(this).text(getLocalized(key));
    } else {
      $(this).attr(attr, getLocalized(key));
    }
  });
}

