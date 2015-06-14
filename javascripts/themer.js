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
  
  var select = $("#themer-select");
  select.empty();
  for (var i = 0; i < themes.length; i++) {
    select.append("<option value=\"" + themes[i].id + "\" " + (themes[i].id == themer.themeid ? "selected" : "") + ">" + themes[i].name + "</option>");
  }
  select.material_select();
  select.parent().find("li").each(function(i) {
    $(this).click(function() {
      themer.setTheme(themes[i]);
    });
  });
};

themer.setTheme = function(theme) {
  if (typeof theme == "string") {
    themer.themeid = theme;
  } else if (theme && theme.id) {
    themer.themeid = theme.id;
  } else {
    console.log("themer: invalid theme", theme);
  }
  themer.refresh();
}

$(document).ready(function() {
  themer.refresh();
});
