var proxyURL = "https://peaceful-shelf-4149.herokuapp.com/?callback=doodleProcess&url=";
var doodlesURL = "https://www.google.com/doodles/json";///YEAR/MONTH";

var date = new Date();
var dateArray = [date.getFullYear(), date.getMonth()+1, date.getUTCDate()];

var doodle;

function doodleProcess(data) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].run_date_array[2] == dateArray[2]) {
      var doodlePrev = doodle;
      doodle = data[i];
      if (!doodlePrev) {
        setDoodleEnabled(localStorage.getItem("doodleEnabled"));
      }
      return data;
    }
  }
  return data;
};

function setDoodleEnabled(enabled) {
  if (enabled == "false") {
    enabled = false;
  }
  if (doodle &&$("#checkbox-doodle-form").css("display") != "block") {
    $("#checkbox-doodle-form").css("display", "block");
  }
  if (enabled && doodle) {
    $(".doodle").css("background-image", "url(\"https:"+doodle.url+"\")");
    $(".doodle").css("background-size", "contain");
    $(".doodle").attr("label", doodle.title);
    addLabelListener($(".doodle"));
    $(".doodle").css("cursor", "pointer");
    $(".doodle").click(function() {
      location.href = "https://www.google.com/search?q="+doodle.title;
    });
    $(".doodle-shadow").css("display", "none");
    $(".header").css("background-image", "url(\"\")");
    $("#chromebar a, #checkbox-doodle-form").css("color", "#000000");
  } else {
    headerDefault();
    removeLabelListener($(".doodle"));
    $(".doodle").css("cursor", "default");
    $(".doodle").off("click");
  }
  $("#checkbox-doodle").prop("checked", enabled);
  localStorage.setItem("doodleEnabled", (enabled=="false"||!enabled)?"false":"true");
};

$(document).ready(function() {
  $.ajax({
    url: proxyURL+doodlesURL+"/"+date.getFullYear()+"/"+(date.getMonth()+1)+"?callback=?",
    type: "GET",
    cache: true,
    dataType: "jsonp text json",
    crossDomain: true,
    jsonp: false,
    jsonpCallback: "doodleProcess"
  });
});

