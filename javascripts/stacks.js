window.stacks = window.stacks || {
  animating: 0,
  
  menuAdd: {
    isVisible: false,
    show: function() {
      if (stacks.menuAdd.isVisible) {
        return true;
      }
      stacks.menuAdd.isVisible = true;
      
      var buttonAdd = $("#button-add");
      var buttonAddBackground = buttonAdd.css("background-color");
      
      $("#button-add>img").css("transform", "rotate(45deg)");
      
      var menu = $("#menu-add");
      menu.empty();
      var menuOuter = $("#menu-add-outer");
      menuOuter.css("pointer-events", "auto");
      var menuLight = menuOuter.find(".light");
      menuLight.css("opacity", 1);
      menuLight.click(function() {buttonAddMenuHide();});
      
      var showButtons = function() {
        var right = $(window).width() - (buttonAdd.offset().left + buttonAdd.outerWidth());
        for (var i = 0; i < sources.length; i++) {
          if (!sources[i].name) {
            continue;
          }
          var text = localized("sources."+sources[i].name);
          var item = $("<div class=\"button-round button-add-source waves-effect waves-circle\" label=\""+text+"\" label-position=\"left\" label-fixed=\"true\" style=\"bottom: "+(48+(i+1)*64)+"px; right: "+right+"px; background-color: "+(sources[i].colors.bg)+"; opacity: 0;\" source=\""+sources[i].name+"\"><img src=\"./images/icon-source-"+sources[i].name+(sources[i].colors.fg)+".png\"></div>");
          menu.append(item);
          setTimeout((function(item, i) {return function() {
            item.css("opacity", 1);
            item.css("transform", "scale(1)");
          }})(item, i), 25*i);
          addLabelListener(item);
          item.click(function() {
            var query = $("#fkbx>input").val();
            $("#fkbx>input").val("");
            stacks.handleQuery(query, $(this).attr("source"));
            stacks.menuAdd.hide();
          });
        }
      };
      
      if ($(window).width() > 800) {
        buttonAdd.velocity({
          top: 262 + $(window).scrollTop() + ($(window).height()-370)
        }, 300);
        setTimeout(showButtons, 250);
      } else {
        showButtons();
      }
      buttonAdd.attr("menu", "true");
      buttonAdd.css("background-color", "#FF1744");
      buttonAdd.attr("label", localized("card.close"));
      $("#button-add").attr("label-position", "left");
      
      return false;
    },
    hide: function() {
      if (!stacks.menuAdd.isVisible) {
        return;
      }
      stacks.menuAdd.isVisible = false;
      
      $("#button-add>img").css("transform", "rotate(0deg)");
      
      var menuOuter = $("#menu-add-outer");
      menuOuter.css("pointer-events", "none");
      menuOuter.find(".light").css("opacity", 0);
      
      var buttons = $(".button-add-source");
      buttons.each(function(i) {
        setTimeout((function(item, i) {return function() {
          item = $(item);
          item.css("opacity", 0);
          item.css("transform", "scale(0)");
        }})(this, i), 25*(buttons.length-1)*i);
      });
      
      
      if ($(window).width() > 800) {
        $("#button-add").velocity({
          top: 262 + $(window).scrollTop() + ($(window).height()-370) * Math.max(Math.sin(Math.PI * Math.min($(window).scrollTop() / ($(window).height()-370), 1) - Math.PI/2) * 0.5 + 0.5, 0)
        }, 300);
      }
      $("#button-add").attr("menu", null);
      $("#button-add").css("background-color", "#00E676");
      $("#button-add").attr("label", localized("card.add"));
      $("#button-add").attr("label-position", null);
    },
    timeout: null
  },
  
  idify: function(str) {
    return encodeURIComponent(str).replace(/\%|\(|\)|\#|\.|\[|\]|\(|\}|\:/g, "");
  },
  
  setupAutocomplete: function() {
    $("#fkbx>input").autocomplete({
      source: function(request, response) {
        $.ajax({
          url: "https://suggestqueries.google.com/complete/search?client=chrome&q="+encodeURIComponent(request.term),
          dataType: "jsonp",
          cache: true,
          success: function(data) {
            response(data[1]);
          }
        });
      },
      minLength: 3,
      delay: 0,
      appendTo: "#toolbar"
    });
  },
  
  init: function() {
    stacks.setupAutocomplete();
    setTimeout(stacks.refreshCards, 2000);
    $(".card").each(function() {
      stacks.animateCard($(this));
    });
    
    $("#button-add").click(function() {
      if (stacks.menuAdd.isVisible) {
        stacks.menuAdd.hide();
        return;
      }
      
      if ($("#fkbx").offset().top < $(window).scrollTop()) {
        $("body, html").velocity({scrollTop: 0}, 300);
        return;
      }
      
      var query = $("#fkbx>input").val();
      $("#fkbx>input").val("");
      stacks.handleQuery(query);
    });
    
    $("#button-clear").click(function() {
      $(".tooltip-label").remove();
      $(".card").each(function() {
        stacks.removeCard($(this));
      });
      $("html, body").velocity({
        scrollTop: 0
      }, 300);
    });
    
    if ($(".card").length < 3) {
      $("#button-clear").css("display", "none");
    }
    
    $("#button-add").on("contextmenu", stacks.menuAdd.show);
    $("#button-add").bind("touchstart", function() {
      stacks.menuAdd.timeout = setTimeout(stacks.menuAdd.show, 1000);
    });
    $("#button-add").bind("touchend", function() {
      clearTimeout(stacks.menuAdd.timeout);
    });
  },
  
  handleQuery: function(query, i) {
    var success = function() {
      $("#progress").css("background-color", "rgba(255, 255, 255, 0)");
      $("#progress .indeterminate").css("background-color", "rgba(255, 255, 255, 0)");
    };
    var single = false;
    if (typeof i == "string") {
      i = sources.indexOf(window[i]);
      single = true;
    }
    if (i == undefined) {
      i = 0;
    }
    if (i < 0 || i >= sources.length) {
      success();
      return;
    }
    if (!sources[i].handleQuery) {
      stacks.handleQuery(query, i+1);
      return;
    }
    $("#progress").css("background-color", sources[i].colors.bg);
    if ((sources[i].colors.fg || "-dark") == "-dark") {
      $("#progress .indeterminate").css("background-color", tinycolor(sources[i].colors.bg).darken(20).toRgbString());
    } else {
      $("#progress .indeterminate").css("background-color", tinycolor(sources[i].colors.bg).lighten(20).toRgbString());
    }
    sources[i].handleQuery(query, success, single ? success : function() {
      stacks.handleQuery(query, i+1);
    });
  },
  
  handleSearch: function(query) {
    if (query) {
      localStorage.setItem("searched", query);
      return true;
    }
    
    stacks.handleQuery(localStorage.getItem("searched"));
    localStorage.removeItem("searched");
  },
  
  pinCard: function(card) {
    var cards = [];
    try {
      cards = JSON.parse(localStorage.getItem("pinned") || "[]");
    } catch (e) {
      cards = [];
    };
    if (!cards) {
      cards = [];
    }
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].id == card.id && cards[i].reloader == card.reloader) {
        return;
      }
    }
    cards.push(card);
    localStorage.setItem("pinned", JSON.stringify(cards));
  },
  
  unpinCard: function(card) {
    var cards = [];
    try {
      cards = JSON.parse(localStorage.getItem("pinned") || "[]");
    } catch (e) {
      cards = [];
    };
    if (!cards) {
      cards = [];
    }
    var id = card.attr("id");
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].id+"-"+cards[i].reloader == id) {
        cards.splice(i, 1);
        break;
      }
    }
    localStorage.setItem("pinned", JSON.stringify(cards));
  },
  
  animateCard: function(card) {
    if (card.css("opacity") != "0") {
      return;
    }
    card.css("opacity", "0.01");
    card.css("marginTop", $(window).height()*0.6);
    card.css("marginBottom", 30-$(window).height()*0.6);
    card.delay(75*stacks.animating).velocity({
      marginTop: 8,
      marginBottom: 0,
      opacity: 1
    }, 400,
    function() {stacks.animating--;});
    stacks.animating++;
  },
  
  swapCards: function(cardUp, cardDown) {
    cardUp.before(cardDown);
    var cards = [];
    try {
      cards = JSON.parse(localStorage.getItem("pinned") || "[]");
    } catch (e) {
      cards = [];
    };
    if (!cards || cards.length == 0) {
      return;
    }
    var ids = {up: cardUp.attr("id"), down: cardDown.attr("id")};
    var indexes = {up: -1, down: -1};
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].id+"-"+cards[i].reloader == ids.up) {
        indexes.up = i;
      }
      if (cards[i].id+"-"+cards[i].reloader == ids.down) {
        indexes.down = i;
      }
    }
    if (indexes.up < 0 || indexes.up >= cards.length || indexes.down < 0 || indexes.down >= cards.length) {
      return;
    }
    var card = cards[indexes.down];
    cards[indexes.down] = cards[indexes.up];
    cards[indexes.up] = card;
    localStorage.setItem("pinned", JSON.stringify(cards));
  },
  
  appendCard: function(card) {
    $("#emptystate").css("display", "none");
    $("#cards").prepend(card);
    //card buttons
    var buttons = $("<div class=\"card-buttons\"></div>");
    //card button down
    var buttonTop = $("<div class=\"card-button card-button-top\" label=\""+localized("card.top")+"\"><img src=\"./images/icon-top-small-dark.png\" class=\"card-button-img-dark\"><img src=\"./images/icon-top-small.png\" class=\"card-button-img-white\"></div>");
    buttonTop.click(function() {
      stacks.swapCards($(".card").first(), card);
    });
    addLabelListener(buttonTop);
    buttons.append(buttonTop);
    //card button down
    var buttonDown = $("<div class=\"card-button card-button-down\" label=\""+localized("card.down")+"\"><img src=\"./images/icon-down-small-dark.png\" class=\"card-button-img-dark\"><img src=\"./images/icon-down-small.png\" class=\"card-button-img-white\"></div>");
    buttonDown.click(function() {
      stacks.swapCards(card, card.next(".card"));
    });
    addLabelListener(buttonDown);
    buttons.append(buttonDown);
    //card button remove
    var buttonRemove = $("<div class=\"card-button card-button-clear\" label=\""+localized("card.remove")+"\"><img src=\"./images/icon-remove-small-dark.png\" class=\"card-button-img-dark\"><img src=\"./images/icon-remove-small.png\" class=\"card-button-img-white\"></div>");
    buttonRemove.click(function() {
       card.velocity({
          marginLeft: $(window).width()*0.6,
          marginRight: -$(window).width()*0.6,
          opacity: 0,
        }, 300,
        function() {stacks.removeCard(card);});
    });
    addLabelListener(buttonRemove);
    buttons.append(buttonRemove);
    card.append(buttons);
    //card swipe
    var swiped = false;
    var swiping = false;
    var swipeStartX = 0;
    var swipeStartY = 0;
    var cardXStart = card.offset().left;
    card.bind("mousedown touchstart", function(event) {
      if (swiped) {
        return;
      }
      event = (event.originalEvent.touches || [event])[0];
      swiping = true;
      swipeStartX = event.pageX;
      swipeStartY = event.pageY;
    });
    $(document).bind("mousemove touchmove", function(event) {
      if (swiped) {
        return;
      }
      if (swiping) {
        event = (event.originalEvent.touches || [event])[0];
        if (Math.max(event.pageY- swipeStartY, -(event.pageY - swipeStartY)) > 24) {
          card.css("marginLeft", 0);
          card.css("marginRight", 0);
          card.css("opacity", 1);
          swiping = false;
          return;
        }
        card.css("marginLeft", Math.round(event.pageX - swipeStartX));
        card.css("marginRight", -Math.round(event.pageX - swipeStartX));
        card.css("opacity", Math.cos(((card.offset().left - cardXStart) / $(window).width())*2*Math.PI)*0.75+0.25);
      }
    });
    $(document).bind("mouseup touchend", function(event) {
      if (swiped) {
        return;
      }
      if (!swiping) {
        return;
      }
      event = (event.originalEvent.touches || [event])[0];
      swiping = false;
      if (card.css("opacity") > 0.5) {
        card.velocity({
          marginLeft: 0,
          marginRight: 0,
          opacity: 1
        }, 300);
      } else {
        swiped = true;
        stacks.removeCard(card);
      }
    });
    //card clear
    if ($(".card").length >= 3) {
      $("#button-clear").css("opacity", "0");
      $("#button-clear").css("display", "inline-block");
      $("#button-clear").css("opacity", 1);
    }
  },
  
  removeCard: function(card) {
    var height = card.outerHeight();
    stacks.unpinCard(card);
    var cards = $(".card");
    var index = cards.length;
    if (index <= 1) {
      $("#emptystate").css("display", "block");
    }
    var cardId = card.attr("id");
    for (var i = 0; i < cards.length; i++) {
      var card_ = $(cards[i]);
      if (card_.attr("id") == cardId) {
        index = i;
        continue;
      }
      if (i < index) {
        continue;
      }
      card_.css("marginTop", height);
      card_.css("marginBottom", 30 - height);
      card_.velocity({
        marginTop: 8,
        marginBottom: 0
      }, 400);
    }
    card.remove();
    if ($(".card").length < 3) {
      $("#button-clear").css("opacity", 0);
    }
  },
  
  refreshCards: function() {
    $("#emptystate").css("display", "block");
    $("#cards").children().remove();
    var cookie = localStorage.getItem("pinned");
    if (cookie && cookie.indexOf("[") == 0) {
      var pinned = JSON.parse(cookie);
      for (var i = 0; i < pinned.length; i++) {
        var card = pinned[i];
        window[card.reloader].addCard(card, function() {}, function() {});
      }
    }
    $("#progress").css("background-color", "rgba(255, 255, 255, 0)");
    $("#progress .indeterminate").css("background-color", "rgba(255, 255, 255, 0)");
    stacks.handleSearch();
  }
  
};


$(document).ready(stacks.init);
