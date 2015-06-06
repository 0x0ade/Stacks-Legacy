window.wikipedia = {};

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
    card = $("<div class=\"card card-wikipedia\" id=\""+data.id+"-wikipedia\"><h2><a href=\""+data.link+"\">"+data.title+"</a></h2><p><span style=\"max-height: 400px; display: block; overflow: hidden; margin: 0 -12px -8px -12px;\"><img src=\""+data.image+"\" style=\"display: inline-block; width: 650px;\"></span><span style=\"position: absolute; bottom: 0; color: white; text-shadow: 0 0 2px rgba(255, 255, 255, 0.5); margin: -114px 0 0 -12px; padding: 114px 12px 8px 12px; background: linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.50) 30%, rgba(0, 0, 0, 0) 100%)\">"+data.content+"</span></p></div>");
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
