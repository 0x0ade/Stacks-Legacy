window.stacks = window.stacks || {};
stacks.sync = stacks.sync || {};

stacks.sync.client_id = stacks.sync.client_id || "815060055713-or8bqdnlear2ua7d0s51toc71bllfn1t.apps.googleusercontent.com";

stacks.sync.auth2 = stacks.sync.auth2 || null;
stacks.sync.auth2listening = stacks.sync.auth2listening || false;
stacks.sync.gdriveid = localStorage.getItem("sync:gdriveid");

stacks.sync.preauth = stacks.sync.preauth || function() {
  if (!gapi || !gapi.signin2) {
    setTimeout(function() {stacks.sync.preauth();}, 100);
    return;
  }
  
  gapi.signin2.render("settings-sync-signin-hidden", {
    "scope": ""
  });
  
  stacks.sync.auth(false);
}

stacks.sync.auth = stacks.sync.auth || function(active) {
  if (!gapi.auth2) {
    setTimeout(function() {stacks.sync.auth(active);}, 100);
    return;
  }
  
  if (!stacks.sync.auth2) {
    stacks.sync.auth2 = gapi.auth2.getAuthInstance();
  }
  
  if (!stacks.sync.auth2listening) {
    stacks.sync.auth2listening = true;
    stacks.sync.auth2.isSignedIn.listen(function(status) {if (status) {stacks.sync.onSignIn();} else {stacks.sync.onSignOut();}});
  }
  
  if (stacks.sync.auth2.isSignedIn.get()) {
    stacks.sync.onSignIn();
  } else if (active) {
    stacks.sync.signIn();
  }
}

stacks.sync.signIn = stacks.sync.signIn || function() {
  stacks.sync.auth2.signIn({"scope": "https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/drive"});
};

stacks.sync.signOut = stacks.sync.signOut || function() {
  stacks.sync.auth2.currentUser.get().disconnect();
};

stacks.sync.onSignIn = stacks.sync.onSignIn || function() {
  $("#settings-sync-signin").css("display", "none");
  $("#settings-sync-signout").css("display", "");
  
  stacks.sync.load();
  stacks.sync.save();
};

stacks.sync.onSignOut = stacks.sync.onSignOut || function() {
  $("#settings-sync-signout").css("display", "none");
  $("#settings-sync-signin").css("display", "");
};

stacks.sync.load = stacks.sync.load || function(cb) {
  gapi.client.load("drive", "v2");
  stacks.sync.gdriveid = stacks.sync.gdriveid || localStorage.getItem("sync:gdriveid");
  if (!stacks.sync.gdriveid) {
    return;
  }
  
  //TODO load from GDrive
  
  gapi.client.drive.files.get({"fileId": stacks.sync.gdriveid}).execute(function(file) {
    if (file.downloadUrl) {
      var accessToken = gapi.auth.getToken().access_token;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', file.downloadUrl);
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.onload = function() {
        callback(xhr.responseText);
      };
      xhr.onerror = function() {
        callback(null);
      };
      xhr.send();
    } else {
      callback(null);
    }
  });
};

stacks.sync.save = stacks.sync.save || function(cb) {
  gapi.client.load("drive", "v2");
  stacks.sync.gdriveid = stacks.sync.gdriveid || localStorage.getItem("sync:gdriveid");
  if (!stacks.sync.gdriveid) {
    return;
  }
  
  //TODO store to GDrive
};

$(document).ready(function() {
  stacks.sync.preauth();
  $("#settings-sync-signin").click(stacks.sync.signIn);
  $("#settings-sync-signout").click(stacks.sync.signOut);
});
