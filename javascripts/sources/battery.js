window.battery = {};

battery.refresh = function() {
  var oldcard = $("#battery");
  if (oldcard.length > 0) {
    removeCard(oldcard);
  }
  
  if (battery.battery.level > 0.5 || (battery.battery.level > 0.9 && battery.battery.charging)) {
    return;
  }
  var data = {charging: battery.battery.charging, chargingTime: battery.battery.chargingTime, dischargingTime: battery.battery.dischargingTime, level: battery.battery.level};
  
  battery.addCard(data, function() {}, function() {});
};

battery.addCard = function(data, success, fail) {
  if (!battery.battery) {
    success();
    return;
  }
  
  if (battery.battery.level > 0.5 || (battery.battery.level > 0.9 && battery.battery.charging)) {
    var oldcard = $("#battery");
    if (oldcard.length > 0) {
      removeCard(oldcard);
    }
    success();
    return;
  }
  
  if ($("#battery").length > 0) {
    success();
    return;
  }
  
  var colorfg = tinycolor({h: data.level * 120, s: 0.75, v: 0.75});
  var colorbg = tinycolor({h: data.level * 120, s: 0.75, v: 0.5});
  
  var timeleft = new Date(0, 0, 0, 0, 0, data.charging ? data.chargingTime : data.dischargingTime);
  var timeleft_s = timeleft.getMinutes() + ":" + timeleft.getSeconds();
  if (timeleft.getHours() > 0) {
    timeleft_s = timeleft.getHours() + ":" + timeleft_s;
  };
  
  var card = $("<div class=\"card card-battery\" id=\"battery\"><div class=\"progress\" style=\"position: absolute; left: 0; top: 0; background-color: "+colorbg.toRgbString()+";\"><div class=\""+(data.charging ? "in" : "")+"determinate\" style=\"background-color: "+colorfg.toRgbString()+";"+(data.charging ? "" : " width: "+Math.floor(data.level * 100)+"%; ")+"\"></div></div><h2>"+localized("battery.title."+(data.charging ? "charging" : "normal"))+"</h2><p><span>"+localized("battery.level[0]")+Math.floor(data.level * 100)+localized("battery.level[1]")+(data.chargingTime != Infinity && data.dischargingTime != Infinity ? "<br>"+localized("battery.timeleft."+(data.charging ? "" : "dis")+"charging[0]")+timeleft_s+localized("battery.timeleft."+(data.charging ? "" : "dis")+"charging[1]") : "")+"</span></p></div>");
  appendCard(card);
  animateCard(card);
  if (!data.reloader) {
    data.reloader = "battery";
    pinCard(data);
  }
  success();
};

battery.colors = {bg: "#ffffff", fg: ""};

window.sources = window.sources || [];
window.sources.push(battery);

$(document).ready(function() {
  setTimeout(function() {
    navigator.getBattery().then(function(battery) {
      window.battery.battery = battery;
      window.battery.battery.onchargingchange = window.battery.refresh;
      window.battery.battery.onchargingtimechange = window.battery.refresh;
      window.battery.battery.ondischargingtimechange = window.battery.refresh;
      window.battery.battery.onlevelchange = window.battery.refresh;
      window.battery.refresh();
    });
  }, 2500);
});
