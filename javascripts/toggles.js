function addToggleListener(elem) {
  var inner = elem.find(".button-toggle-inner");
  var hold = elem.find(".button-toggle-inner-hold");
  var swiping = false;
  var swipeStartX = 0;
  var swipeStartY = 0;
  var innerXStart = inner.offset().left;
  
  var colorDisabled = tinycolor("#bdbdbd");
  var colorEnabled = tinycolor(inner.css("background-color"));
  var colorDisabledBG = tinycolor("rgba(255, 255, 255, 0.3)");
  var colorEnabledBG = tinycolor(inner.css("background-color"));
  
  inner.bind("mousedown touchstart", function(event) {
    event = (event.originalEvent.touches || [event])[0];
    swiping = true;
    swipeStartX = event.pageX;
    swipeStartY = event.pageY;
    innerXStart = inner.offset().left;
    hold.css("transform", "scale(1)");
  });
  $(document).bind("mousemove touchmove", function(event) {
    if (swiping) {
      event = (event.originalEvent.touches || [event])[0];
      if (Math.max(event.pageY- swipeStartY, -(event.pageY - swipeStartY)) > 24) {
        inner.css("left", 0);
        swiping = false;
        return;
      }
      inner.css("left", Math.round(event.pageX - swipeStartX));
      inner.css("background-color", tinycolor.mix(colorDisabled, colorEnabled, Math.cos(((inner.offset().left - innerXStart) / 36)*2*Math.PI)*0.75+0.25));
    }
  });
  $(document).bind("mouseup touchend", function(event) {
    if (!swiping) {
      return;
    }
    hold.css("transform", "scale(0)");
    swiping = false;
  });
}

$(document).ready(function() {
  $(".button-toggle").each(function() {
    addToggleListener($(this));
  });
});
