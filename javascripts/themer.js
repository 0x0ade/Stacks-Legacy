window.themer = {};
window.themes = window.themes || [];

themer.themeid = "gnow";

themer.theme = null;
themer.themeid_ = null;

themer.refresh = function() {
  if (themer.themeid != themer.themeid_ && themer.theme && themer.theme.unload) {
    themer.theme.unload();
    $("#themer-stylesheet").remove();
  }
  
  themer.theme = window[themer.themeid];
  
  if (themer.theme.init) {
    themer.theme.init();
  }
  
  if (themer.theme.stylesheet) {
    $("head").append($("<link rel=\"stylesheet\" href=\""+themer.theme.stylesheet+"\" id=\"themer-stylesheet\">"));
  }
};

$(document).ready(function() {
  themer.refresh();
});
