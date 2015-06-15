window.gnow = {};

gnow.id = "gnow";
gnow.name = "Google Now (Default)";
gnow.stylesheet = "./stylesheets/themes/gnow.css";

gnow.doodle = {};
gnow.doodle.date = new Date();
gnow.doodle.dateArray = [gnow.doodle.date.getFullYear(), gnow.doodle.date.getMonth()+1, gnow.doodle.date.getUTCDate()];
gnow.doodle.doodle = null;

gnow.doodle.setDoodleEnabled = function(enabled, unload) {
  if (enabled == "false") {
    enabled = false;
  }
  if (enabled && gnow.doodle.doodle) {
    $(".doodle").css("background-image", "url(\"https:"+gnow.doodle.doodle.hires_url+"\")");
    $(".doodle").css("background-size", "contain");
    $(".doodle").attr("label", gnow.doodle.doodle.title);
    addLabelListener($(".doodle"));
    $(".doodle").css("cursor", "pointer");
    $(".doodle").click(function() {
      location.href = "https://www.google.com/search?q="+gnow.doodle.doodle.title;
    });
    $(".doodle-shadow").css("display", "none");
    $(".header").css("background-image", "url(\"\")");
    $("#chromebar a").css("color", "#000000");
  } else {
    gnow.background.refresh();
    removeLabelListener($(".doodle"));
    $(".doodle").css("cursor", "default");
    $(".doodle").off("click");
  }
  $("#checkbox-doodle").prop("checked", enabled);
  if (!unload) {
    localStorage.setItem("doodleEnabled", (enabled=="false"||!enabled)?"false":"true");
  }
};

gnow.doodle.process = function(data) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].run_date_array[2] == gnow.doodle.dateArray[2]) {
      var doodlePrev = gnow.doodle.doodle;
      gnow.doodle.doodle = data[i];
      if (!doodlePrev) {
        gnow.doodle.setDoodleEnabled(localStorage.getItem("doodleEnabled"));
      }
      return data;
    }
  }
  return data;
};

gnow.background = {};
gnow.background.hour = new Date().getHours();
gnow.background.colorDark = "rgba(0, 0, 0, 0.87)";
gnow.background.colorWhite = "rgba(255, 255, 255, 0.87)";
gnow.background.times = [
  {name: "dawn", hour: 4, color: gnow.background.colorDark, fg: "https://www.google.com/images/srpr/logo11w.png", bg: "https://lh5.ggpht.com/LeDpxkfCDssG2jwo20Tg01UxnUc4-PZUojwKsPzIQoGJ_CgbXc7KVko8o3nk5zA=w9999-h9999"},
  {name: "day", hour: 10, color: gnow.background.colorDark, fg: "https://www.google.com/images/srpr/logo11w.png", bg: "https://lh5.ggpht.com/bosDZkBJxNdwo-dXGZeBkYtfCVnTFq96zqC08UV4dmIccI4YBr5p0CyCE7vmj2w=w9999-h9999"},
  {name: "dusk", hour: 18, color: gnow.background.colorWhite, fg: "./images/logo11w-white.png", bg: "https://lh4.ggpht.com/DCGfFj7ILzkFXXDgCliyTAq-cjKs8eyoTstREjhB2grAzzjYnlelGfpIQ4cEX4c=w9999-h9999"},
  {name: "night", hour: 21, color: gnow.background.colorWhite, fg: "./images/logo11w-white.png", bg: "https://lh6.ggpht.com/QgqUFGYoAxRkyvbl_5Hq2L6CTsaGXt9kaqrMdSxga-462Uyv2IViGw7OBzDMWNI=w9999-h9999"}
];

gnow.background.refresh = function() {
  var currentTime = gnow.background.times[gnow.background.times.length-1];
  for (var i = 0; i < gnow.background.times.length; i++) {
    var time = gnow.background.times[i];
    if (time.hour > gnow.background.hour) {
      continue;
    }
    var start = time.hour;
    var end = 0;
    if (i == gnow.background.times.length-1) {
      end = 24;
    } else {
      end = gnow.background.times[i+1].hour;
    }
    if (start <= gnow.background.hour && gnow.background.hour < end) {
      currentTime = time;
      break;
    }
  }
  $(".header").css("background-image", "url(\""+currentTime.bg+"\")");
  $(".doodle").css("background-image", "url(\""+currentTime.fg+"\")");
  $(".doodle-shadow").css("display", "block");
  $("#chromebar a").css("color", currentTime.color);
};

gnow.init = function() {
  var top = $("<div class=\"theme-gnow\" id=\"gnow-top\">"+
    "<div id=\"chromebar\">"+
      "<a href=\"https://plus.google.com/\" id=\"cbar_me\" localize=\"cbar.me\">"+localized("cbar.me")+"</a>"+
      "<a href=\"https://mail.google.com/mail/\" id=\"cbar_gmail\" localize=\"cbar.gmail\">"+localized("cbar.gmail")+"</a>"+
      "<a href=\"https://images.google.com/\" id=\"cbar_images\" localize=\"cbar.images\">"+localized("cbar.images")+"</a>"+
      "<a href=\"https://www.google.com/\" id=\"cbar_google\">google.com</a>"+
    "</div>"+
  "</div>");
  
  $(".header").after(top);
  
  top.after($("<div class=\"doodle theme-gnow\"></div>"));
  top.after($("<div class=\"doodle-shadow theme-gnow\"></div>"));
  
  $("#settings-theme-custom").append($("<div class=\"settings-item\">"+
      "<p class=\"settings-item-text\" localize=\"doodle.enable\">"+localized("doodle.enable")+"</p>"+
      "<div class=\"settings-item-toggle switch\">"+
        "<label>"+
          "<input type=\"checkbox\" id=\"checkbox-doodle\" checked=\"checked\" onclick=\"gnow.doodle.setDoodleEnabled(this.checked)\"/>"+
          "<span class=\"lever\"></span>"+
        "</label>"+
      "</div>"+
    "</div>"));
    
  $.ajax({
    url: "https://peaceful-shelf-4149.herokuapp.com/?callback=gnow.doodle.process&url=https://www.google.com/doodles/json/"+gnow.doodle.date.getFullYear()+"/"+(gnow.doodle.date.getMonth()+1)+"?callback=?",
    type: "GET",
    cache: true,
    dataType: "jsonp text json",
    crossDomain: true,
    jsonp: false,
    jsonpCallback: "gnow.doodle.process"
  });
  
  gnow.background.refresh();
};

gnow.unload = function() {
  gnow.doodle.setDoodleEnabled(false, true);
  gnow.doodle.doodle = null;
  
  $(".theme-gnow").remove();
  
  $(".header").css("background-image", "");
  $(".doodle").css("background-image", "");
  $(".doodle-shadow").css("display", "");
  $("#chromebar a").css("color", "");
};

window.themes = window.themes || [];
window.themes.push(gnow);
