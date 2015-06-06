var colorDark = "rgba(0, 0, 0, 0.87)";
var colorWhite = "rgba(255, 255, 255, 0.87)";
var times = [
  {name: "dawn", hour: 4, color: colorDark, fg: "https://www.google.com/images/srpr/logo11w.png", bg: "https://lh5.ggpht.com/LeDpxkfCDssG2jwo20Tg01UxnUc4-PZUojwKsPzIQoGJ_CgbXc7KVko8o3nk5zA=w9999-h9999"},
  {name: "day", hour: 10, color: colorDark, fg: "https://www.google.com/images/srpr/logo11w.png", bg: "https://lh5.ggpht.com/bosDZkBJxNdwo-dXGZeBkYtfCVnTFq96zqC08UV4dmIccI4YBr5p0CyCE7vmj2w=w9999-h9999"},
  {name: "dusk", hour: 18, color: colorWhite, fg: "./images/logo11w-white.png", bg: "https://lh4.ggpht.com/DCGfFj7ILzkFXXDgCliyTAq-cjKs8eyoTstREjhB2grAzzjYnlelGfpIQ4cEX4c=w9999-h9999"},
  {name: "night", hour: 21, color: colorWhite, fg: "./images/logo11w-white.png", bg: "https://lh6.ggpht.com/QgqUFGYoAxRkyvbl_5Hq2L6CTsaGXt9kaqrMdSxga-462Uyv2IViGw7OBzDMWNI=w9999-h9999"}
];

var date = new Date();
var hour = date.getHours();

function headerDefault() {
  var currentTime = times[times.length-1];
  for (var i = 0; i < times.length; i++) {
    var time = times[i];
    if (time.hour > hour) {
      continue;
    }
    var start = time.hour;
    var end = 0;
    if (i == times.length-1) {
      end = 24;
    } else {
      end = times[i+1].hour;
    }
    if (start <= hour && hour < end) {
      currentTime = time;
      break;
    }
  }
  $(".header").css("background-image", "url(\""+currentTime.bg+"\")");
  $(".doodle").css("background-image", "url(\""+currentTime.fg+"\")");
  $(".doodle-shadow").css("display", "block");
  $("#chromebar a, #checkbox-doodle-form").css("color", currentTime.color);
};

$(document).ready(headerDefault);
