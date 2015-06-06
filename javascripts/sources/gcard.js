var gcardSelector = ".vk_c";

window.gcard = {};

gcard.handleQuery = function(query, success, fail) {
  if (!query) {
    fail();
    return;
  }
    
  $.ajax({
    url: "https://cors-anywhere.herokuapp.com/google.com/search?pws=0&gl="+loc.country+"&hl="+loc.country+"&fheit="+(loc.temp=="F"?1:0)+"&gll="+Math.round(1000000*loc.lat)+","+Math.round(1000000*loc.lng)+"&q="+encodeURIComponent(query).replace(new RegExp("%20", "g"), " "),
    type: "GET",
    success: function(data) {gcardProcess(query, data, success, fail);},
    error: function(jqXHR, status, error) {fail();},
    beforeSend: gcardHeader
  });
};

function gcardHeader(xhr) {
  xhr.setRequestHeader("x-requested-with", "gnowwebmockup");
};

function gcardProcess(query, data, success, fail) {
  var html = $("<div></div>").append(data);
  var card = html.find(gcardSelector);
  if (card.length == 0) {
    fail();
    return;
  }
  var cardTitle = card.find("#wob_loc").text() || query;
  if (cardTitle.indexOf("Ashburn") >= 0 && !(query.indexOf("Ashburn") >= 0 || loc.city.indexOf("Ashburn") >= 0)) {
    gcard.handleQuery(query+getLocalized("gcard.in")+loc.city, success, fail);
    return;
  }
  card.find("#wob_loc").remove(); //TITLE
  card.find("#wob_gsp").remove(); //WEATHER GRAPH
  card.find("#wob_temp").parent().remove(); //WEATHER GRAPH BUTTONS
  if (card.find("._Fx").length > 0) {
    //Check for bottom-right link
    var link = card.find("._Fx").find("a").attr("href");
    if (link.indexOf("maps.google.") >= 0) { //MAPS (DIRECTIONS)
      var saddr = link.substring(link.indexOf("saddr=")+6, link.indexOf("&", link.indexOf("saddr=")+6));
      var daddr = link.substring(link.indexOf("daddr=")+6, link.indexOf("&", link.indexOf("daddr=")+6));
      mapsDirections.handleQuery(query, success, fail, {title: cardTitle, content: card, id: idify(cardTitle), gcard_query: query, map_query: query, map_saddr: saddr, map_daddr: daddr}, card);
      return;
    }
  }
  card = card.wrap("<div/>").parent().html();
  gcard.addCard({title: cardTitle, content: card, id: idify(cardTitle), gcard_query: query}, success, fail);
};

gcard.addCard = function(data, success, fail) {
  $("#"+data.id+"-gcard").remove();
  var card = $("<div class=\"card card-gcard\" id=\""+data.id+"-gcard\"><h2><a href=\"https://google.com/search?q="+encodeURIComponent(data.gcard_query).replace(new RegExp("%20", "g"), " ")+"\">"+data.title+"</a></h2></div>");
  card.append(data.content);
  appendCard(card);
  animateCard(card);
  if (!data.reloader) {
    data.reloader = "gcard";
    pinCard(data);
    success();
  } else {
    gcard.handleQuery(data.gcard_query, success, fail);
  }
};

gcard.colors = {bg: "#0266c8", fg: ""};
gcard.name = "gcard";

window.sources = window.sources || [];
window.sources.push(gcard);
langs["en"].sources["gcard"] = "Google";
langs["de"].sources["gcard"] = "Google";
