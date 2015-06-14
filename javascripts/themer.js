window.themer = {};
window.themes = window.themes || [];

themer.themeid = localStorage.getItem("theme") || "gnow";

themer.theme = null;
themer.themeid_ = null;

themer.refresh = function() {
  if (themer.themeid != themer.themeid_ && themer.theme && themer.theme.unload) {
    themer.theme.unload();
  }
  
  $(".themer-stylesheet").remove();
  
  themer.theme = window[themer.themeid];
  
  if (themer.theme && themer.theme.init) {
    themer.theme.init();
  }
  
  if (themer.theme.stylesheet) {
    $("head").append($("<link rel=\"stylesheet\" href=\""+themer.theme.stylesheet+"\" class=\"themer-stylesheet\">"));
  }
  
  localStorage.setItem("theme", themer.themeid);
};

$(document).ready(function() {
  themer.refresh();
});
