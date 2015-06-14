window.settings = {};
settings.menuVisible = false;

settings.show = function() {
  if (settings.menuVisible) {
    return;
  }
  settings.menuVisible = true;
  
  $("#button-settings>img").css("transform", "rotate(60deg)");
  
  var menu = $("#menu-settings");
  menu.css("right", 0);
  var menuOuter = $("#menu-settings-outer");
  menuOuter.css("pointer-events", "auto");
  var menuLight = menuOuter.find(".light");
  menuLight.css("opacity", 1);
  menuLight.click(function() {settings.hide();});
  menu.find(".button-header-main").click(function() {settings.hide();});
};

settings.hide = function() {
  if (!settings.menuVisible) {
    return;
  }
  settings.menuVisible = false;
  
  $("#button-settings>img").css("transform", "rotate(0deg)");
  
  $("#menu-settings").css("right", -800);
  var menuOuter = $("#menu-settings-outer");
  menuOuter.css("pointer-events", "none");
  menuOuter.find(".light").css("opacity", 0);
};

$(document).ready(function() {
  $("#button-settings").click(settings.show);
});
