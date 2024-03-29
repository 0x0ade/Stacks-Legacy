window.voicesearch = {};
voicesearch.hotwords = [
  "ok google",
  "okay google",
  "ok papyrus",
  "okay papyrus",
  "hi papyrus",
  "hey papyrus"
];
voicesearch.hotwordsCustom = JSON.parse(localStorage.getItem("voicesearch:hotwords") || "[]") || [];
voicesearch.alwaysListening = (localStorage.getItem("voicesearch:alwaysListening") || "false") == "true";
voicesearch.alwaysListeningTimeoutTime = 1000;
voicesearch.alwaysListeningPhase = -1;
voicesearch.speechTimeoutTime = 250;

voicesearch.handlers = [
  {id: "google", handler: function(query) {
    handleSearch(query);
    location.href = "https://www.google.com/search?gs_ivs=1&q="+encodeURIComponent(query).replace(new RegExp("%20", "g"), " ");
    return true;
  }}
];

if (localize) {
  console.log("voicesearch.js found localize.js; adding listeners...");
  localize.listeners.get.push(function(lang, data) {
    if (data.hotwords) {
      voicesearch.hotwords = voicesearch.hotwords.concat(data.hotwords);
    }
  });
}

voicesearch.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition)();
voicesearch.active = false;
voicesearch.ignore = "";
voicesearch.ignoreRegexp = null;

voicesearch.override = {
  onerror: function() {
    voicesearch.active = false;
    if (voicesearch.alwaysListening && voicesearch.alwaysListeningPhase == -1) {
      voicesearch.alwaysListeningPhase = 1;
      setTimeout(function() {voicesearch.recognition.start();}, voicesearch.alwaysListeningTimeoutTime);
    } else if (voicesearch.context.onerror) {voicesearch.context.onerror.apply(this, arguments)};
  },
  onstart: function() {
    voicesearch.active = true;
    if (voicesearch.context.onstart && voicesearch.alwaysListeningPhase > -1) {voicesearch.context.onstart.apply(this, arguments)};
    voicesearch.alwaysListeningPhase = -1;
  },
  onend: function() {
    voicesearch.active = false;
    if (voicesearch.alwaysListening && voicesearch.alwaysListeningPhase == -1) {
      voicesearch.alwaysListeningPhase = 1;
      setTimeout(function() {voicesearch.recognition.start();}, voicesearch.alwaysListeningTimeoutTime);
    } else if (voicesearch.context.onend) {voicesearch.context.onend.apply(this, arguments)};
  }
};
voicesearch.speech = {
  name: "speech",
  continuous: true,
  interimResults: true,
  onresult: function(event) {
    if (typeof(event.results) == "undefined") {
      voicesearch.stopListening(true);
      return;
    }
    var final = "";
    var approx = "";
    var isFinal = true;
    var backdrop = $("#button-g-backdrop");
    backdrop.css("transition-duration", "");
    backdrop.css("transition-property", "");
    backdrop.css("transition-timing-function", "");
    var convidenceSum = 0;
    for (var i = event.resultIndex; i < event.results.length; i++) {
      convidenceSum += event.results[i][0].confidence;
      var transcript = event.results[i][0].transcript;
      if (transcript.toLowerCase().indexOf(voicesearch.ignore) >= 0) {
        transcript = transcript.substr(transcript.toLowerCase().indexOf(voicesearch.ignore) + voicesearch.ignore.length);
      } else if (i > event.resultIndex) {
        var transcriptTmp = transcript + event.results[i-1][0].transcript;
        if (transcriptTmp.toLowerCase().indexOf(voicesearch.ignore) >= 0) {
          transcriptTmp = transcriptTmp.substr(transcriptTmp.toLowerCase().indexOf(voicesearch.ignore) + voicesearch.ignore.length);
        }
        if (transcriptTmp.length <= 1) {
          isFinal = false;
          continue;
        }
      } else if (i < event.results.length-1) {
        var transcriptTmp = transcript + event.results[i+1][0].transcript;
        if (transcriptTmp.toLowerCase().indexOf(voicesearch.ignore) >= 0) {
          transcriptTmp = transcriptTmp.substr(transcriptTmp.toLowerCase().indexOf(voicesearch.ignore) + voicesearch.ignore.length);
        }
        if (transcriptTmp.length <= 1) {
          isFinal = false;
          continue;
        }
      }
      backdrop.css("transform", "scale("+(1.0 + (1.0 - (convidenceSum / (event.results.length - event.resultIndex))) + Math.sin(new Date().getTime() / 300 + Math.random() * 0.3) * 0.2 )+")");
      /*backdrop.css("transition-duration", "0.1s");
      backdrop.css("transition-property", "transform");
      backdrop.css("transition-timing-function", "cubic-bezier(0, 0, 0.2, 1)");
      backdrop.css("transform", "scale(1.0)");*/
      if (transcript.length <= 1) {
        isFinal = false;
        continue;
      }
      if (event.results[i].isFinal || event.results[i][0].confidence >= 0.2) {
        final += transcript;
      } else {
        approx += transcript;
        isFinal = false;
      }
    }
    
    voicesearch.spoke = true;
    
    if (final.length > 0 || approx.length > 0) {
      $("#speech").text(final);
      $("#speech-approx").text(approx);
    } else {
      $("#speech").text(localized("search.voice.now"));
      $("#speech-approx").text(localized("search.voice.example"));
      isFinal = false;
    }
    
    if (isFinal && !voicesearch.speechTimeout) {
      if (voicesearch.speechTimeout) {
        clearTimeout(voicesearch.speechTimeout);
      }
      voicesearch.speechTimeout = setTimeout(function() {voicesearch.ignore = final; voicesearch.ignoreRegexp = new RegExp(voicesearch.ignore, "i"); voicesearch.stopListening(true)}, voicesearch.speechTimeoutTime);
    } else if (!isFinal && voicesearch.speechTimeout) {
      clearTimeout(voicesearch.speechTimeout);
      voicesearch.speechTimeout = null;
    }
  },
  onerror: function(event) { 
    $("#speech").text(localized("search.voice.error"));
    $("#speech-approx").text("");
    setTimeout(voicesearch.hideSpeechOverlay, 5000);
    voicesearch.stopListening(false);
    voicesearch.startHotword(true);
  },
  onstart: function(event) {
    $("#speech").text(localized("search.voice.now"));
    $("#speech-approx").text(localized("search.voice.example"));
  },
  onend: function(event) { 
    voicesearch.hideSpeechOverlay();
    voicesearch.stopListening(false);
  }
};
voicesearch.hotword = {
  name: "hotword",
  continuous: true,
  interimResults: true,
  onresult: function(event) {
    if (typeof(event.results) == "undefined") {
      voicesearch.stopHotword();
      return;
    }
    var final = "";
    var approx = "";
    for (var i = event.resultIndex; i < event.results.length; i++) {
      var transcript = event.results[i][0].transcript;
      if (transcript.toLowerCase().indexOf(voicesearch.ignore) >= 0) {
        transcript = transcript.substr(transcript.toLowerCase().indexOf(voicesearch.ignore) + voicesearch.ignore.length);
      }
      if (event.results[i].isFinal || event.results[i][0].confidence >= 0.2) {
        final += transcript;
      } else {
        approx += transcript;
      }
    }
    var text = final.toLowerCase()+" "+approx.toLowerCase();
    var hotword = null;
    for (var i = 0; i < voicesearch.hotwords.length && !hotword; i++) {
      if (text.indexOf(voicesearch.hotwords[i]) >= 0) {
        hotword = voicesearch.hotwords[i];
        break;
      }
    }
    for (var i = 0; i < voicesearch.hotwordsCustom.length && !hotword; i++) {
      if (text.indexOf(voicesearch.hotwordsCustom[i].toLowerCase()) >= 0) {
        hotword = voicesearch.hotwordsCustom[i].toLowerCase();
        break;
      }
    }
    if (hotword) {
      console.log("voicesearch: found hotword " + hotword);
      voicesearch.ignore = hotword;
      voicesearch.ignoreRegexp = new RegExp(voicesearch.ignore, "i");
      voicesearch.showSpeechOverlay();
      voicesearch.stop(false, true);
      voicesearch.startListening(true);
    }
  },
  onstart: function(event) {voicesearch.showHotwordHint();},
  onend: function(event) {voicesearch.hideHotwordHint();}
};

voicesearch.speechTimeout = null;
voicesearch.spoke = false;
voicesearch.animFloatShow = null;

voicesearch.context = voicesearch.hotword;

voicesearch.showSpeechOverlay = function() {
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
  if (!voicesearch.animFloatShow) {
    var styles = document.styleSheets;
    for (var i = 0; i < styles.length; i++) {
      if (!styles[i].cssRules) {
        continue;
      }
      for (var ii = 0; ii < styles[i].cssRules.length; ii++) {
        if (styles[i].cssRules[ii].type == window.CSSRule.WEBKIT_KEYFRAMES_RULE && styles[i].cssRules[ii].name == "float-show") {
          voicesearch.animFloatShow = styles[i].cssRules[ii];
          voicesearch.animFloatShow.deleteRule("0%");
          voicesearch.animFloatShow.deleteRule("50%");
          voicesearch.animFloatShow.deleteRule("100%");
          voicesearch.animFloatShow.appendRule("0% {top: "+(startY-$(window).scrollTop()-1)+"px; left: "+(startX-$(window).scrollLeft()-1)+"px; width: 2px; height: 2px; border-radius: "+Math.round(Math.max($(window).width(), $(window).height())/2)+"px;}");
          voicesearch.animFloatShow.appendRule("50% {top: "+Math.round($(window).height()/2 - Math.round(Math.max($(window).width(), $(window).height())/2))+"px; left: "+Math.round($(window).width()/2 - Math.round(Math.max($(window).width(), $(window).height())/2))+"px; width: "+Math.round(Math.max($(window).width(), $(window).height()))+"px; height: "+Math.round(Math.max($(window).width(), $(window).height()))+"px;}");
          voicesearch.animFloatShow.appendRule("100% {border-radius: 0;}");
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

voicesearch.hideSpeechOverlay = function() {
  $("#float-outer").css("pointer-events", "none");
  $("#float-outer").velocity({
    opacity: 0
  }, 300, function() {
    $("#float-outer").css("display", "none");
  });
};

voicesearch.showHotwordHint = function() {
  $("#fkbx-spch").css("display", "none");
  $("#fkbx-hspch, #fkbx-hht").css("display", "block");
}

voicesearch.hideHotwordHint = function() {
  $("#fkbx-spch").css("display", "block");
  $("#fkbx-hspch, #fkbx-hht").css("display", "none");
}

voicesearch.startListening = function(keepSession) {
  $("#speech").text(localized("search.voice.allow"));
  $("#speech-approx").text("");
  voicesearch.spoke = false;
  
  voicesearch.start(voicesearch.speech, keepSession);
}

voicesearch.stopListening = function(parseQuery) {
  if (voicesearch.speechTimeout) {
    clearTimeout(voicesearch.speechTimeout);
    voicesearch.speechTimeout = null;
  }
  voicesearch.stop(true, true);
  if (parseQuery && voicesearch.spoke) {
    var query = $("#speech").text()+" "+$("#speech-approx").text();
    for (var i = 0; i < voicesearch.handlers.length; i++) {
      if (voicesearch.handlers[i].handler(query)) {
        break;
      }
    }
  } else {
    voicesearch.startHotword(true);
  }
  voicesearch.spoke = false;
}

voicesearch.startHotword = function(keepSession) {
  voicesearch.start(voicesearch.hotword, keepSession);
};

voicesearch.stopHotword = function(keepSession) {
  voicesearch.stop(false, keepSession);
};

voicesearch.start = function(context, keepSession) {
  console.log("voicesearch: start with new context " + (context || {name: "undefined"}).name + " while" + (keepSession ? "" : " not") + " keeping the session");
  
  for (var key in (voicesearch.context || {})) {
    voicesearch.recognition[key] = null;
  }
  if (context) {
    voicesearch.context = context;
  }
  for (var key in (voicesearch.context || {})) {
    voicesearch.recognition[key] = voicesearch.context[key];
  }
  
  voicesearch.recognition.lang = loc.lang+"-"+loc.country;
  
  for (var key in (voicesearch.override || {})) {
    voicesearch.recognition[key] = voicesearch.override[key];
  }
  
  if (!keepSession || !voicesearch.active) {
    voicesearch.recognition.start();
  } else if (voicesearch.recognition.onstart && voicesearch.context) {
    voicesearch.recognition.onstart();
  }
};

voicesearch.stop = function(force, keepSession) {
  console.log("voicesearch: stop on context " + (voicesearch.context || {name: "undefined"}).name + (force ? ", enforcing it" : "") + " while" + (keepSession ? "" : " not") + " keeping the session");
  
  if (force) {
    voicesearch.recognition.onend = null;
    voicesearch.active = !keepSession;
  }
  
  if (!keepSession) {
    voicesearch.recognition.stop();
  } else if (voicesearch.recognition.onend && voicesearch.context) {
    voicesearch.recognition.onend();
  }
  
  voicesearch.active = keepSession;
};

voicesearch.setAlwaysListening = function(value) {
  voicesearch.alwaysListening = value;
  localStorage.setItem("voicesearch:alwaysListening", value);
  $("#settings-hotword-alwayslistening").prop("checked", value);
};

$(document).ready(function() {
  $("#fkbx-spch, #fkbx-hspch").click(function(event) {
    voicesearch.showSpeechOverlay();
    voicesearch.startListening(true);
  });
  //TODO initialize and remove when listening
  $(".dark").click(function() {
    voicesearch.hideSpeechOverlay();
    voicesearch.stopListening(false);
  });
  $("#button-g").click(function() {
    voicesearch.hideSpeechOverlay();
    voicesearch.stopListening(true);
  });
  
  voicesearch.startHotword();
});
