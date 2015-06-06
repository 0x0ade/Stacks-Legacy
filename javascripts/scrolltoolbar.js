var previousTop = $(window).scrollTop();
$(window).on("scroll resize", function() {
    var scrollTop = $(this).scrollTop();
    var scroll = scrollTop - previousTop;
    
    $(".header").css("top", -scrollTop / 2);
    
    if (scroll > 0) {
      $("#toolbar").css("top", Math.max(parseInt($("#toolbar").css("top")), scrollTop-380 - $("#toolbar").outerHeight(true) - 16 - 70));
    }
    if (scroll < 0) {
      $("#toolbar").css("top", Math.max(-60, Math.min(parseInt($("#toolbar").css("top")), scrollTop-320)));
    }
    
    
    if ($(this).width() > 800) {
      if ($("#button-add").attr("menu")) {
        $("#button-add").css("top", 262 + scrollTop + ($(this).height()-370));
      } else {
        $("#button-add").css("top", 262 + scrollTop + ($(this).height()-370) * Math.max(Math.sin(Math.PI * Math.min(scrollTop / ($(this).height()-370), 1) - Math.PI/2) * 0.5 + 0.5, 0));
      }
    } else {
      $("#button-add").css("top", "");
    }
    
    previousTop = scrollTop;
});

$(document).ready(function() {$(window).scroll();});
