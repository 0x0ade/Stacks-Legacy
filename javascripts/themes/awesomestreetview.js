window.astreetview = {};

astreetview.id = "astreetview";
astreetview.name = "Awesome Street-View (WIP)";
astreetview.stylesheet = "./stylesheets/themes/astreetview.css";

astreetview.locations = [];
astreetview.refreshLocations_cb = null;

astreetview.refreshLocations = function(data, cb) {
  if (!data) {
    astreetview.refreshLocations_cb = cb;
    $.ajax({
      url: "https://peaceful-shelf-4149.herokuapp.com/?callback=astreetview.refreshLocations&url=https://raw.githubusercontent.com/Jam3/awesome-streetview/master/locations.json?callback=?",
      type: "GET",
      cache: true,
      dataType: "jsonp text json",
      crossDomain: true,
      jsonp: false,
      jsonpCallback: "astreetview.refreshLocations"
    });
    return;
  }
  
  astreetview.locations = data;
  if (astreetview.refreshLocations_cb) {astreetview.refreshLocations_cb(data);};
  astreetview.refreshLocations_cb = null;
}

astreetview.showRandomLocation = function(locations) {
  if (!locations) {
    astreetview.refreshLocations(null, function(data) {astreetview.showRandomLocation(data);});
    return;
  }
  
  var location = locations[Math.floor(Math.random() * (locations.length - 1))];
  
  var latlng = new google.maps.LatLng(location[0], location[1]);
  var mapOptions = {
    center: latlng,
    zoom: 14
  };
  var map = new google.maps.Map($("#astreetview-pano")[0], mapOptions);
  var panoramaOptions = {
    position: latlng,
    pov: {
      heading: 0,
      pitch: 0
    }
  };
  var panorama = new google.maps.StreetViewPanorama($("#astreetview-pano")[0], panoramaOptions);
  map.setStreetView(panorama);
  
  console.log(locations);
}

astreetview.init = function() {
  $(".header").append($("<div id=\"astreetview-pano\" class=\"theme-astreetview\"></div>"));
  
  astreetview.showRandomLocation();
};

astreetview.unload = function() {
  $(".theme-astreetview").remove();
};

window.themes = window.themes || [];
window.themes.push(astreetview);
