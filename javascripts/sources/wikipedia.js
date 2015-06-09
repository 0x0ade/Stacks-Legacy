window.wikipedia = {};
wikipedia.colorThief = new ColorThief();

wikipedia.handleQuery = function(query, success, fail) {
  if (!query) {
    fail();
    return;
  }
  
  $.getJSON("https://"+loc.lang+".wikipedia.org/w/api.php?continue=&format=json&action=query&prop=extracts&titles="+encodeURIComponent(query)+"&callback=?", function(response) {
    if (!response.query || !response.query.pages) {
      fail();
      return;
    }
    response = response.query.pages;
    var result;
    for (var i in response) {
        if (response.hasOwnProperty(i) && typeof(i) !== "function") {
            result = response[i];
            break;
        }
    }
    if (result.missing == "" || result.pageid == undefined) {
      fail();
      return;
    }
    var data = {title: result.title, id: result.pageid, link: "https://"+loc.lang+".wikipedia.org/wiki/"+encodeURI(result.title)};
    data.content = $("<div>"+result.extract+"</div>").find("p").first().html();
    if (data.content == undefined) {
      fail();
      return;
    }
    $.getJSON("https://"+loc.lang+".wikipedia.org/w/api.php?continue=&format=json&action=query&prop=pageimages&pithumbsize=650&titles="+encodeURIComponent(query)+"&callback=?", function(response) {
      var page = response.query.pages[data.id.toString()];
      if (page.thumbnail) {
        data.image = page.thumbnail.source;
      }
      wikipedia.addCard(data, success, fail);
    }).fail(function() {wikipedia.addCard(data, success, fail);});
  }).fail(function() {
    fail();
  });
};

wikipedia.addCard = function(data, success, fail) {
  if ($("#"+data.id+"-wikipedia").length > 0) {
    success();
    return;
  }
  var card;
  if (data.image) {
    card = $("<div class=\"card card-wikipedia\" id=\""+data.id+"-wikipedia\"><h2><a href=\""+data.link+"\">"+data.title+"</a></h2><p><span style=\"max-height: 400px; display: block; overflow: hidden; margin: 0 -12px -8px -12px;\"><img src=\""+data.image+"\" style=\"display: inline-block; width: 650px;\"></span><span style=\"position: absolute; bottom: 0; color: white; text-shadow: 0 0 4px rgba(255, 255, 255, 0.725); margin: -128px 0 0 -12px; padding: 128px 12px 8px 12px; background: linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.625) 30%, rgba(0, 0, 0, 0) 100%)\">"+data.content+"</span></p></div>");
    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var blob = new Blob([new Uint8Array(xhr.response)], {type: "image/" + data.image.substr(data.image.length - 3)});
            var img = $("<img>");
            img[0].src = (window.URL || window.webkitURL).createObjectURL(blob);
            img.on("load", function() {
              var bg = tinycolor({h: 0, s: 0, v: 0});
              var bg_hsv = bg.toHsv();
              var colors = wikipedia.colorThief.getPalette(this, 16);
              for (var i = 0; i < colors.length; i++) {
                var color = tinycolor({r: colors[i][0], g: colors[i][1], b: colors[i][2]});
                var color_hsv = color.toHsv();
                if ((color_hsv.s + color_hsv.v) >= (bg_hsv.s + bg_hsv.v)) {
                  bg = color;
                  bg_hsv = color_hsv;
                }
              }
              
              card.css("background-color", bg.toRgbString());
              if (bg.toHsv().v <= 0.77) {
                card.find("h2 a").css("color", "white");
              }
              
              $(this).remove();
            });
            $("#hidden").append(img);
          }
      };
      xhr.open("GET", "https://cors-anywhere.herokuapp.com/"+data.image.replace(new RegExp("https://", "g"), ""), true);
      xhr.responseType = "arraybuffer";
      xhr.setRequestHeader("x-requested-with", "gnowwebmockup");
      xhr.send();
      
  } else {
    card = $("<div class=\"card card-wikipedia\" id=\""+data.id+"-wikipedia\"><h2><a href=\""+data.link+"\">"+data.title+"</a></h2><p><span>"+data.content+"</span></p></div>");
  }
  appendCard(card);
  animateCard(card);
  if (!data.reloader) {
    data.reloader = "wikipedia";
    pinCard(data);
  }
  success();
};

wikipedia.colors = {bg: "#ffffff", fg: "-dark"};
wikipedia.name = "wikipedia";

window.sources = window.sources || [];
window.sources.push(wikipedia);
localize.addTranslation("en", "sources.wikipedia", "Wikipedia");
localize.addTranslation("de", "sources.wikipedia", "Wikipedia");
