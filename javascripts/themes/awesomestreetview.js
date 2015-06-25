window.astreetview = {};

astreetview.id = "astreetview";
astreetview.name = "Awesome Street-View (WIP)";
astreetview.stylesheet = "./stylesheets/themes/astreetview.css";

astreetview.init = function() {
  $(".header").append($("<iframe id=\"astreetview-pano\" class=\"theme-astreetview\" src=\"https://mattdesl.github.io/google-panorama-equirectangular/demo/\"></iframe>"));
};

astreetview.unload = function() {
  $(".theme-astreetview").remove();
};

window.themes = window.themes || [];
window.themes.push(astreetview);
