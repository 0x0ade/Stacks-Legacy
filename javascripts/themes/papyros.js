window.papyros = {};

papyros.id = "papyros";
papyros.name = "Papyros (WIP)";
papyros.stylesheet = "./stylesheets/themes/papyros.css";

papyros.init = function() {
  $(".header").after($("<div class=\"logo theme-papyros\"><h1><img src=\"./images/papyros/papyros-icon-large-shadow.png\" id=\"papyros-icon-shadow\"><img src=\"./images/papyros/papyros-icon-large.png\" id=\"papyros-icon\">Stacks</h1></div>"));
};

papyros.unload = function() {
  $(".theme-papyros").remove();
};

window.themes = window.themes || [];
window.themes.push(papyros);
