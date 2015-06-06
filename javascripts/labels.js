var tooltipMap = {};
function setTooltip(elem, label, visible) {
  if (!visible) {
    tooltipMap[label].velocity({opacity: 0}, 300, function() {tooltipMap[label].remove(); tooltipMap[label] = null;});
    return;
  }
  if (tooltipMap[label]) {
    tooltipMap[label].remove();
  }
  var position = elem.attr("label-position") || "top";
  var top;
  var left;
  if (position == "bottom") {
    top = elem.offset().top + elem.outerHeight();
    left = elem.offset().left + elem.outerWidth() / 2;
  } else if (position == "top") {
    top = elem.offset().top - 20;
    left = elem.offset().left + elem.outerWidth() / 2;
  } else if (position == "left") {
    top = elem.offset().top + elem.outerHeight() / 2;
    left = elem.offset().left - 36;
  } else if (position == "right") {
    top = elem.offset().top + elem.outerHeight() / 2;
    left = elem.offset().left + elem.outerWidth() + 20;
  }
  var tooltip = $("<div class=\"tooltip-label tooltip-label-"+position+"\" style=\"z-index: 148; position: absolute; top: "+Math.round(top)+"px; left: "+Math.round(left)+"px;\">"+label+"</div>");
  $("body").append(tooltip);
  tooltipMap[label] = tooltip;
  if (position == "bottom") {
    tooltip.css("left", left = Math.round(left - tooltip.outerWidth() / 2));
    tooltip.css("top", (top = Math.round(top)) - 4);
    tooltip.css("margin", "16px 0 0 0");
  } else if (position == "top") {
    tooltip.css("left", left = Math.round(left - tooltip.outerWidth() / 2));
    tooltip.css("top", (top = Math.round(top - tooltip.outerHeight())) + 4);
    tooltip.css("margin", "0 0 16px 0");
  } else if (position == "left") {
    tooltip.css("left", (left = Math.round(left - tooltip.outerWidth())) + 4);
    tooltip.css("top", top = Math.round(top - tooltip.outerHeight() / 2));
    tooltip.css("margin", "0 0 0 16px");
  } else if (position == "right") {
    tooltip.css("left", (left = Math.round(left)) - 4);
    tooltip.css("top", top = Math.round(top - tooltip.outerHeight() / 2));
    tooltip.css("margin", "0 16px 0 0");
  }
  tooltip.velocity({
    left: Math.round(left),
    top: Math.round(top),
    opacity: 1
  }, 150);
  elem.on("remove", function() {
    setTooltip(elem, label, false);
  });
};

function addLabelListener(elem) {
  var label;
  elem.hover(function() {
    label = elem.attr("label") || elem.attr("aria-label");
    setTooltip(elem, label, true);
  }, function() {
    setTooltip(elem, label, false);
  });
}

function removeLabelListener(elem) {
  elem.off("mouseenter mouseleave");
}

$(document).ready(function() {
  $("[label], [aria-label]").each(function() {
    addLabelListener($(this));
  });
});
