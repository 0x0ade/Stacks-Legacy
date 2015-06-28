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
  
  console.log("sync: pre-authentication");
  
  gapi.signin2.render("settings-sync-signin-hidden", {
    "scope": ""
  });
  
  stacks.sync.auth(false);
}

stacks.sync.auth = stacks.sync.auth || function(active) {
  if (!gapi.auth2 || !gapi.client) {
    setTimeout(function() {stacks.sync.auth(active);}, 100);
    return;
  }
  
  console.log("sync: authentication" + (active ? " (active)" : ""));
  
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
  
  gapi.client.load("drive", "v2");
}

stacks.sync.signIn = stacks.sync.signIn || function() {
  console.log("sync: Signing in...");
  stacks.sync.auth2.signIn({"scope": "https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/drive"});
};

stacks.sync.signOut = stacks.sync.signOut || function() {
  console.log("sync: Signing out...");
  stacks.sync.auth2.currentUser.get().disconnect();
};

stacks.sync.onSignIn = stacks.sync.onSignIn || function() {
  console.log("sync: Signed in.");
  $("#settings-sync-signin").css("display", "none");
  $("#settings-sync-signout").css("display", "");
  
  stacks.sync.load(function() {stacks.sync.save();});
};

stacks.sync.onSignOut = stacks.sync.onSignOut || function() {
  console.log("sync: Signed out.");
  $("#settings-sync-signout").css("display", "none");
  $("#settings-sync-signin").css("display", "");
};

stacks.sync.newGDriveFile_running = false;

stacks.sync.newGDriveFile = stacks.sync.newGDriveFile || function(cb) {
  cb = cb || function() {};
  
  if (stacks.sync.gdriveid) {
    cb(stacks.sync.gdriveid);
    return;
  }
  if (!gapi.client) {
    setTimeout(function() {stacks.sync.newGDriveFile(cb);}, 100);
    return;
  }
  if (!gapi.client.drive) {
    gapi.client.load("drive", "v2", function() {stacks.sync.newGDriveFile(cb);});
    return;
  }
  if (!stacks.sync.auth2.currentUser.get().hasGrantedScopes("https://www.googleapis.com/auth/drive")) {
    cb(null);
    return;
  }
  if (stacks.sync.newGDriveFile_running) {
    setTimeout(function() {stacks.sync.newGDriveFile(cb);}, 100);
    return;
  }
  
  console.log("sync: Creating a new Stacks Sync file in GDrive...");
  
  stacks.sync.newGDriveFile_running = true;
  gapi.client.drive.files.insert({"uploadType": "multipart", "title": "Stacks Sync", "mimeType": "application/json"}).execute(function(result) {
    stacks.sync.gdriveid = result.id;
    stacks.sync.newGDriveFile_running = false;
    console.log("sync: New Stacks Sync file created.");
    cb(result.id);
  });
};

stacks.sync.getGDriveFile = stacks.sync.getGDriveFile || function(cb) {
  cb = cb || function() {};
  
  if (stacks.sync.gdriveid) {
    cb(stacks.sync.gdriveid);
    return;
  }
  if (!gapi.client) {
    setTimeout(function() {stacks.sync.getGDriveFile(cb);}, 100);
    return;
  }
  if (!gapi.client.drive) {
    gapi.client.load("drive", "v2", function() {stacks.sync.getGDriveFile(cb);});
    return;
  }
  if (!stacks.sync.auth2.currentUser.get().hasGrantedScopes("https://www.googleapis.com/auth/drive")) {
    cb(null);
    return;
  }
  
  console.log("sync: Searching for the Stacks Sync file in GDrive...");
  
  gapi.client.drive.files.list({"q": "title = 'Stacks Sync'"}).execute(function(result) {
    if (!result.items) {
      console.log("sync: WARNING: Something went wrong with the getGDriveFile result.");
      stacks.sync.getGDriveFile(cb);
      return;
    }
    
    if (result.items.length == 0) {
      console.log("sync: WARNING: No file found with getGDriveFile.");
      stacks.sync.newGDriveFile(cb);
      return;
    }
    
    stacks.sync.gdriveid = result.items[0].id;
    console.log("sync: Stacks Sync file found in GDrive.");
    cb(result.items[0].id);
  });
};

stacks.sync.load = stacks.sync.load || function(cb) {
  cb = cb || function() {};
  
  if (!gapi.client) {
    setTimeout(function() {stacks.sync.load(cb);}, 100);
    return;
  }
  if (!gapi.client.drive) {
    gapi.client.load("drive", "v2", function() {stacks.sync.load(cb);});
    return;
  }
  if (!stacks.sync.auth2.currentUser.get().hasGrantedScopes("https://www.googleapis.com/auth/drive")) {
    cb(null);
    return;
  }
  
  console.log("sync: Loading data from GDrive...");
  
  stacks.sync.gdriveid = stacks.sync.gdriveid;
  if (!stacks.sync.gdriveid) {
    stacks.sync.getGDriveFile(function() {stacks.sync.load(cb);});
    return;
  }
  
  gapi.client.drive.files.get({"fileId": stacks.sync.gdriveid}).execute(function(file) {
    console.log("sync: File found; Downloading...");
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
          console.log("sync: Downloaded data from GDrive; Applying changes...");
          var pinnedOld = localStorage.pinned;
          var themeOld = localStorage.theme;
          for (var key in (data || {})) {
            localStorage[key] = data[key];
          }
          if (localStorage.pinned != pinnedOld) {
            refreshCards();
          }
          if (localStorage.theme != themeOld) {
            themer.refresh();
          }
          voicesearch.setAlwaysListening(localStorage.getItem("voicesearch:alwaysListening"));
          settings.refreshHotwords();
          //stacks.refresh();//TODO create stacks.js
          cb(data);
        },
        error: function() {
          console.log("sync: WARNING: GDrive Stacks Sync file did not download properly.");
          cb(null);
        }
      });
    } else {
      console.log("sync: WARNING: GDrive Stacks Sync file cannot be downloaded.");
    }
  });
};

stacks.sync.save = stacks.sync.save || function(cb) {
  cb = cb || function() {};
  
  if (!gapi.client) {
    setTimeout(function() {stacks.sync.save(cb);}, 100);
    return;
  }
  if (!gapi.client.drive) {
    gapi.client.load("drive", "v2", function() {stacks.sync.save(cb);});
    return;
  }
  if (!stacks.sync.auth2.currentUser.get().hasGrantedScopes("https://www.googleapis.com/auth/drive")) {
    cb(null);
    return;
  }
  
  console.log("sync: Saving data to GDrive...");
  
  stacks.sync.gdriveid = stacks.sync.gdriveid;
  if (!stacks.sync.gdriveid) {
    stacks.sync.getGDriveFile(function() {stacks.sync.save(cb);});
    return;
  }
  
  var auth = stacks.sync.auth2.currentUser.get().getAuthResponse();
  $.ajax({
    url: "https://www.googleapis.com/upload/drive/v2/files/" + stacks.sync.gdriveid + "?uploadType=media&newRevision=false",
    cache: false,
    method: "PUT",
    headers: {
      "Authorization": auth.token_type + " " + auth.access_token
    },
    data: JSON.stringify(localStorage),
    success: function(data) {
      console.log("sync: Stacks Sync file uploaded to GDrive.");
      cb(data);
    },
    error: function() {
      console.log("sync: WARNING: Stacks Sync file could not be uploaded to GDrive.");
      cb(null);
    }
  });
};

$(document).ready(function() {
  stacks.sync.preauth();
  $("#settings-sync-signin").click(stacks.sync.signIn);
  $("#settings-sync-signout").click(stacks.sync.signOut);
});


localStorage_setItem_ = localStorage.setItem;
localStorage.setItem = function() {
  localStorage_setItem_.apply(this, arguments);
  stacks.sync.save();
};

localStorage_removeItem_ = localStorage.removeItem;
localStorage.removeItem = function() {
  localStorage_removeItem_.apply(this, arguments);
  stacks.sync.save();
};
