window.stacks = window.stacks || {};
stacks.sync = stacks.sync || {};

stacks.sync.client_id = stacks.sync.client_id || "815060055713-or8bqdnlear2ua7d0s51toc71bllfn1t.apps.googleusercontent.com";

stacks.sync.auth2 = stacks.sync.auth2 || null;
stacks.sync.auth2listening = stacks.sync.auth2listening || false;
stacks.sync.gdriveid = null;

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
  
  stacks.sync.load(function() {stacks.sync.save();});
};

stacks.sync.onSignOut = stacks.sync.onSignOut || function() {
  $("#settings-sync-signout").css("display", "none");
  $("#settings-sync-signin").css("display", "");
};

stacks.sync.newGDriveFile = stacks.sync.newGDriveFile || function(cb) {
  cb = cb || function() {};
  gapi.client.drive.files.insert({"uploadType": "multipart", "title": "Stacks Sync Data"}).execute(function(result) {
    stacks.sync.gdriveid = result.id;
    cb(result.id);
  });
};

stacks.sync.getGDriveFile = stacks.sync.getGDriveFile || function(cb) {
  cb = cb || function() {};
  gapi.client.drive.files.list({"q": "title = 'Stacks Sync Data'"}).execute(function(result) {
    if (result.items.length == 0) {
      stacks.sync.newGDriveFile(cb);
      return;
    }
    
    stacks.sync.gdriveid = result.items[0].id;
    cb(result.items[0].id);
  });
};

stacks.sync.load = stacks.sync.load || function(cb) {
  if (!gapi.client.drive) {
    gapi.client.load("drive", "v2", function() {stacks.sync.load(cb);});
    return;
  }
  
  stacks.sync.gdriveid = stacks.sync.gdriveid;
  if (!stacks.sync.gdriveid) {
    stacks.sync.getGDriveFile(function() {stacks.sync.load(cb);});
    return;
  }
  
  gapi.client.drive.files.get({"fileId": stacks.sync.gdriveid}).execute(function(file) {
    if (file.downloadUrl) {
      var auth = stacks.sync.auth2.currentUser.get().getAuthResponse();
      $.ajax({
        url: file.downloadUrl,
        cache: false,
        method: "GET",
        headers: {
          "Authorization": auth.token_type + " " + auth.access_token
        },
        success: function(data) {
          //TODO apply data
          cb(data);
        }
      });
    }
  });
};

stacks.sync.save = stacks.sync.save || function(cb) {
  if (!gapi.client.drive) {
    gapi.client.load("drive", "v2", function() {stacks.sync.load(cb);});
    return;
  }
  
  stacks.sync.gdriveid = stacks.sync.gdriveid;
  if (!stacks.sync.gdriveid) {
    stacks.sync.getGDriveFile(function() {stacks.sync.save(cb);});
    return;
  }
  
  //TODO store to GDrive
};

$(document).ready(function() {
  stacks.sync.preauth();
  $("#settings-sync-signin").click(stacks.sync.signIn);
  $("#settings-sync-signout").click(stacks.sync.signOut);
});
