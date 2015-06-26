window.stacks = window.stacks || {};
stacks.sync = stacks.sync || {};

stacks.sync.client_id = "815060055713-or8bqdnlear2ua7d0s51toc71bllfn1t.apps.googleusercontent.com";
stacks.sync.scope = "https://www.googleapis.com/auth/drive";

stacks.sync.auth2 = null;

stacks.sync.preauth = function() {
  gapi.signin2.render("settings-sync-signin-hidden", {
    "scope": "https://www.googleapis.com/auth/plus.login"
  });
  
  var x = function() {
    if (!gapi.auth2) {
      setTimeout(x, 100);
      return;
    }
    
    stacks.sync.auth(false);
  };
  setTimeout(x, 100);
}

stacks.sync.auth = function(active) {
  
  if (!stacks.sync.auth2) {
    stacks.sync.auth2 = gapi.auth2.getAuthInstance();
  }
    
  if (stacks.sync.auth2.isSignedIn().get()) {
    console.log("sync: User already signed in");
  } else if (active) {
    stacks.sync.auth2.signIn({"scope": "profile email drive"});
  }
}

stacks.sync.onSignIn = function(user) {
  var profile = user.getBasicProfile();
  console.log("Name: " + profile.getName());
  console.log("Image URL: " + profile.getImageUrl());
  console.log("Email: " + profile.getEmail());

  var id_token = user.getAuthResponse().id_token;
  console.log("ID Token: " + id_token);
};

stacks.sync.load = stacks.sync.load || function() {
  
};

stacks.sync.save = stacks.sync.save || function() {
  
};

stacks.sync.onClientLoad = stacks.sync.onClientLoad || function() {
  stacks.sync.onClientLoaded = true;
  setTimeout(function() {
    stacks.sync.preauth();
  }, 100);
};

$(document).ready(function() {
  if (!stacks.sync.onClientLoaded && gapi) {
    stacks.sync.onClientLoad();
  }
  $("#settings-sync-signin").click(function() {stacks.sync.preauth();});
});
