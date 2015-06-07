window.localize = {};
window.localize.langs = {};
window.localize.dynamic = {};
window.localize.onstart = true;
window.localize.delay = 1000;
window.localize.path = "./languages/";
window.localize.detected = navigator.language || navigator.userLanguage;
window.localize.fallbacklang = "en";
window.localize.listeners = {get: [], geterror: [], add: []};

function localized(key) {
  var val = null;
  try {
    if ((val = eval("localize.lang."+key)) != null) {
      return val;
    }
  } catch (e) {};
  try {
    if ((val = eval("localize.fallback."+key)) != null) {
      return val;
    }
  } catch (e) {};
  try {
    if ((val = eval("localize.dynamic."+localize.detected+"."+key)) != null) {
      return val;
    }
  } catch (e) {};
  try {
    if ((val = eval("localize.dynamic."+localize.fallbacklang+"."+key)) != null) {
      return val;
    }
  } catch (e) {};
  console.log("localize: not found: ["+key+"]");
  return "["+key+"]";
};

function localizeAll() {
  var localize_ = function() {
    $("[localize]").each(function() {
      var key = $(this).attr("localize");
      var attr = $(this).attr("localize-attr");
      if (!attr) {
        $(this).text(localized(key));
      } else {
        $(this).attr(attr, localized(key));
      }
    });
  };
  
  if (localize.lang != null) {
    localize_();
    return;
  }
  
  localize.getLanguage(localize.fallbacklang, function(data) {
    localize.fallback = data;
    localize_();
  }, function(jqxhr, textStatus, error) {
    console.log("Failed loading locale: "+localize.fallbacklang);
    console.log(textStatus+", "+error);
    alert("Failed loading the website texts. Please contact the site administrator.");
  });
  
  localize.getLanguage(navigator.language || navigator.userLanguage, function(data) {
    localize.lang = data;
    localize_();
  });
};

localize.getLanguage = function(lang, cb, fail) {
  $.getJSON(localize.path+lang+".json", function(data) {
    localize.langs[lang] = data;
    if (cb) {
      cb(data);
    }
    localize.callListeners(localize.listeners.get, lang, data);
  }).fail(fail || function(jqxhr, textStatus, error) {
    console.log("Failed loading locale: en");
    console.log(textStatus+", "+error);
    localize.callListeners(localize.listeners.geterror, lang, jqxhr, textStatus, error);
  });
}

localize.addTranslation = function(lang, key, value) {
  localize.dynamic[lang] = localize.dynamic[lang] || {};
  
  var subkeys = key.split(".");
  var subkey = "";
  for (var i = 0; i < subkeys.length; i++) {
    subkey += subkeys[i];
    eval("localize.dynamic."+lang+"."+subkey+" = localize.dynamic."+lang+"."+subkey+" || {}");
    subkey += ".";
  }
  eval("localize.dynamic."+lang+"."+key+" = value");
  
  localize.callListeners(localize.listeners.add, lang, key, value);
}

localize.callListeners = function() {
  var listeners = arguments[0];
  
  var args = new Array(arguments.length - 1);
  for (var i = 0; i < args.length; i++) {
    args[i] = arguments[i+1];
  }
  
  for (var i = 0; i < listeners.length; i++) {
    listeners[i].apply(this, args);
  }
}

if (localize.onstart) {
  setTimeout(localizeAll, localize.delay);
}
