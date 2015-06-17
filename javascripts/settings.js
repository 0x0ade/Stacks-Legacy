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

settings.removeHotword = function(elem) {
  var field = $(elem).parent();
  field.velocity({
    opacity: 0,
    maxHeight: 0
  }, {
    duration: 300,
    complete: function() {
      field.remove();
    }
  });
};

$(document).ready(function() {
  $("#button-settings").click(settings.show);
  
  for (var i = 0; i < voicesearch.hotwordsCustom.length; i++) {
    console.log("settings: found hotword: " + voicesearch.hotwordsCustom[i]);
    var field = $("<div class=\"settings-hotword-item input-field col s12\" style=\"opacity: 1; max-height: 128px;\">\n"+
      "<a href=\"#\" class=\"waves-effect waves-red waves-circle red-text text-lighten-2 create-answer-remove suffix\" onclick=\"settings.removeHotword(this)\"><i class=\"mdi-action-highlight-remove\"></i></a>\n"+
      "<input type=\"text\">\n"+
    "</div>");
    field.find("input").val(voicesearch.hotwordsCustom[i]);
    $("#settings-hotword-items").append(field);
  }
  
  $("#settings-hotword-add").on("click", function() {
    var field = $("<div class=\"settings-hotword-item input-field col s12\" style=\"opacity: 0; max-height: 0;\">\n"+
      "<a href=\"#\" class=\"waves-effect waves-red waves-circle red-text text-lighten-2 create-answer-remove suffix\" onclick=\"settings.removeHotword(this)\"><i class=\"mdi-action-highlight-remove\"></i></a>\n"+
      "<input type=\"text\">\n"+
    "</div>");
    $("#settings-hotword-items").append(field);
    field.velocity({
      opacity: 1,
      maxHeight: 128
    }, {
      duration: 300
    });
  });
  
  $("#settings-hotword-apply").on("click", function() {
    voicesearch.hotwordsCustom = [];
    $("#settings-hotword-items").children().each(function() {
      voicesearch.hotwordsCustom.push($(this).find("input").val());
    });
    
    localStorage.setItem("hotwords", JSON.stringify(voicesearch.hotwordsCustom));
    
    Materialize.toast(localized("settings.hotword.applied"), 2000);
  });
  
});
