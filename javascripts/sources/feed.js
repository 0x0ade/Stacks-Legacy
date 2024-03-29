google.load("feeds", "1");

window.feed = {};

feed.handleQuery = function(query, success, fail) {
  if (!query) {
    fail();
    return;
  }
  
  var feed = new google.feeds.Feed(query);
  feed.load(function(result) {
    if (!result.error) {
      for (var i = 0; i < result.feed.entries.length && i < 3; i++) {
        var entry = result.feed.entries[i];
        window.feed.addCard({title: entry.title, content: entry.content, id: idify(result.title)+"_"+i, feed_query: query, link: entry.link}, success, fail);
      }
    } else {
      fail();
    }
  });
};

feed.addCard = function(data, success, fail) {
  if ($("#"+data.id+"-feed").length > 0) {
    success();
    return;
  }
  var card = $("<div class=\"card card-feed\" id=\""+data.id+"-feed\"><h2><a href=\""+data.link+"\">"+data.title+"</a></h2><p>"+data.content+"</p></div>");
  stacks.appendCard(card);
  stacks.animateCard(card);
  if (!data.reloader) {
    data.reloader = "feed";
    stacks.pinCard(data);
  } else {
    var feed = new google.feeds.Feed(data.query);
    feed.load(function(result) {
      if (!result.error) {
        for (var i = 0; i < result.feed.entries.length; i++) {
          var entry = result.feed.entries[i];
          if (entry.link == data.link && i >= 3) {
            stacks.unpinCard(card);
            stacks.removeCard(card);
            return;
          }
        }
        feed(data.feed_query);
      }
    });
  }
  success();
};

feed.colors = {bg: "#ff9800", fg: ""};
feed.name = "feed";

window.sources = window.sources || [];
window.sources.push(feed);
localize.addTranslation("en", "sources.feed", "RSS Feed");
localize.addTranslation("de", "sources.feed", "RSS-Feed");
