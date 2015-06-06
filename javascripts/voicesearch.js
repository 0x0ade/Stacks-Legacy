var speech = new webkitSpeechRecognition();
var speechTimeout;
var hotword = new webkitSpeechRecognition();
var spoke = false;
var animFloatShow;

$(document).ready(function() {
  $("#fkbx-spch, #fkbx-hspch").click(function(event) {
    showSpeechOverlay();
    startListening();
  });
  $("#dark").click(function() {
    hideSpeechOverlay();
    stopListening(false);
  });
  $("#button-g").click(function() {
    hideSpeechOverlay();
    stopListening(true);
  });
  
  startHotword();
});

function showSpeechOverlay() {
  var floatOuter = $("#float-outer");
  floatOuter.css("pointer-events", "auto");
  var startElem = $("#fkbx-spch");
  if (startElem.css("display") == "none") {
    startElem = $("#fkbx-hspch");
  }
  var startX = Math.round(startElem.offset().left + startElem.outerWidth()/2);
  var startY = Math.round(startElem.offset().top + startElem.outerHeight()/2);
  floatOuter.css("webkitAnimationName", null);
  floatOuter.css("display", "block");
  floatOuter.css("opacity", 1);
  if (!animFloatShow) {
    var styles = document.styleSheets;
    for (var i = 0; i < styles.length; i++) {
      if (!styles[i].cssRules) {
        continue;
      }
      for (var ii = 0; ii < styles[i].cssRules.length; ii++) {
        if (styles[i].cssRules[ii].type == window.CSSRule.WEBKIT_KEYFRAMES_RULE && styles[i].cssRules[ii].name == "float-show") {
          animFloatShow = styles[i].cssRules[ii];
          animFloatShow.deleteRule("0%");
    animFloatShow.deleteRule("50%");
    animFloatShow.deleteRule("100%");
    animFloatShow.appendRule("0% {top: "+(startY-$(window).scrollTop()-1)+"px; left: "+(startX-$(window).scrollLeft()-1)+"px; width: 2px; height: 2px; border-radius: "+Math.round(Math.max($(window).width(), $(window).height())/2)+"px;}");
    animFloatShow.appendRule("50% {top: "+Math.round($(window).height()/2 - Math.round(Math.max($(window).width(), $(window).height())/2))+"px; left: "+Math.round($(window).width()/2 - Math.round(Math.max($(window).width(), $(window).height())/2))+"px; width: "+Math.round(Math.max($(window).width(), $(window).height()))+"px; height: "+Math.round(Math.max($(window).width(), $(window).height()))+"px;}");
    animFloatShow.appendRule("100% {border-radius: 0;}");
          break;
        }
      }
    }
  }
  floatOuter.css("webkitAnimationName", "float-show");
  setTimeout(function() {
    floatOuter.css("width", "100%");
    floatOuter.css("height", "100%");
    floatOuter.css("top", 0);
    floatOuter.css("left", 0);
  }, 500);
};

function hideSpeechOverlay() {
  $("#float-outer").css("pointer-events", "none");
  $("#float-outer").velocity({
    opacity: 0
  }, 300, function() {
    $("#float-outer").css("display", "none");
  });
};

function startListening() {
  $("#speech").text(getLocalized("search.voice.allow"));
  $("#speech-approx").text("");
  spoke = false;
  
  speech.continuous = true;
  speech.interimResults = true;
  speech.onresult = function(event) {
    if (typeof(event.results) == "undefined") {
      stopListening(true);
      return;
    }
    var final = "";
    var approx = "";
    var isFinal = true;
    for (var i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal || event.results[i][0].confidence >= 0.3) {
        final += event.results[i][0].transcript;
      } else {
        approx += event.results[i][0].transcript;
        isFinal = false;
      }
    }
    
    if (isFinal && !speechTimeout) {
      if (speechTimeout) {
        clearTimeout(speechTimeout);
      }
      speechTimeout = setTimeout(function() {stopListening(true)}, 2000);
    } else if (!isFinal && speechTimeout) {
      clearTimeout(speechTimeout);
      speechTimeout = null;
    }
    $("#speech").text(final);
    $("#speech-approx").text(approx);
    spoke = true;
  };
  speech.onerror = function(event) { 
    $("#speech").text(getLocalized("search.voice.error"));
    $("#speech-approx").text("");
    setTimeout(hideSpeechOverlay, 2000);
    stopListening(false);
  };
  speech.onstart = function(event) {
    $("#speech").text(getLocalized("search.voice.now"));
    $("#speech-approx").text(getLocalized("search.voice.example"));
  };
  speech.lang = loc.lang+"-"+loc.country;
  speech.start();
}

function stopListening(parseQuery) {
  if (speechTimeout) {
    clearTimeout(speechTimeout);
    speechTimeout = null;
  }
  speech.onresult = null;
  speech.stop();
  if (parseQuery && spoke) {
    var query = $("#speech").text()+" "+$("#speech-approx").text();
    location.href = "https://www.google.com/search?gs_ivs=1&q="+encodeURIComponent(query).replace(new RegExp("%20", "g"), " ");
  } else {
    startHotword();
  }
  spoke = false;
}

function startHotword() {
  hotword.continuous = true;
  hotword.interimResults = true;
  hotword.onresult = function(event) {
    if (typeof(event.results) == "undefined") {
      stopHotword();
      return;
    }
    var final = "";
    var approx = "";
    for (var i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal || event.results[i][0].confidence >= 0.3) {
        final += event.results[i][0].transcript;
      } else {
        approx += event.results[i][0].transcript;
      }
    }
    var text = final.toLowerCase()+" "+approx.toLowerCase();
    if (text.indexOf("okay google") >= 0 || text.indexOf("ok google") >= 0) {
      showSpeechOverlay();
      startListening();
      stopHotword();
    }
  };
  hotword.onstart = function() {
    $("#fkbx-spch").css("display", "none");
    $("#fkbx-hspch, #fkbx-hht").css("display", "block");
  };
  hotword.onend = stopHotword;
  hotword.lang = loc.lang+"-"+loc.country;
  hotword.start();
};

function stopHotword() {
  hotword.stop();
  $("#fkbx-spch").css("display", "block");
  $("#fkbx-hspch, #fkbx-hht").css("display", "none");
};
