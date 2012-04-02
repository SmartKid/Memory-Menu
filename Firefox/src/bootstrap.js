var Cc = Components.classes;
var Ci = Components.interfaces;

function loadIntoWindow(window) {
  if (!window) return;
  var html = window.document;
  
  var statusBar = html.getElementById("status-bar");
  if (!statusBar) return;
  
  var strSet = html.createElement("stringbundleset");
  strSet.setProperty("id", "memory-menu-strSet");
  var strs = html.createElement("stringbundle");
  strs.setProperty("id", "memory-meu-strBundle");
  strs.setProperty("src", "chrome://memorymenu/locale/memorymenu.properties");
  strSet.appendChild(strs);
  statusBar.appendChild(strSet);
  
  var js = html.createElemt("script");
  js.setAttribute("id", "memory-menu-js");
  js.setAttribute("type", "text/javascript");
  js.innerHTML = '/* -*- Mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil; -*-\n * ShivamDutt.MemoryMenu namespace.\n */\n\nif (typeof ShivamDutt == "undefined") ShivamDutt = {};\n\nif (typeof ShivamDutt.MemoryMenu == "undefined")\n{\n\tShivamDutt.MemoryMenu = {\n\tCc: Components.classes,\n\tCi: Components.interfaces,\n\tCu: Components.utils,\n\n\t/**\n\t * Initializes this object.\n\t */\n\tinit: function() {\n\t\t\tthis.os = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);\n\t\t\tthis.obsService = os;\n\t\t\tthis.j = 0;\n\t\t},doGlobalGC: function() {\n\t\t\tthis.Cu.forceGC();\n\t\t\tthis.os.notifyObservers(null, "child-gc-request", null);\n\t\t},doCC: function() {\n\t\t\twindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).cycleCollect();\n\t\t\tthis.os.notifyObservers(null, "child-cc-request", null);\n\t\t},\n\tdoHeapMinimize: function() {\n\t\t\tthis.os.notifyObservers(null, "memory-pressure", "heap-minimize");\n\t\t\tif (++this.j < 3) this.os.mainThread.dispatch({run: doHeapMinimize}, Ci.nsIThread.DISPATCH_NORMAL);\n\t\t\telse this.j = 0;\n\t\t}\n\t};\n\n\t/**\n\t * Constructor.\n\t */\n\twindow.addEventListener("load", function() { ShivamDutt.MemoryMenu.init(); }, false);\n};';
  statusBar.appendChild(js);
  
  var btn = html.createElement("button");
  btn.setProperty("id", "memory-menu-main");
  btn.setProperty("type", "menu");
  btn.setProperty("label", strs.getString("title"));
  var mPop = html.createElement("menupopup");
  mPop.setAttribute("position", "before-start");
  
  var gCol = html.createElement("menuitem");
  gCol.setAttribute("label", strs.getString("gc"));
  var cCol = html.createElement("menuitem");
  cCol.setAttribute("label", strs.getString("cc"));
  var hMin = html.createElement("menuitem");
  hMin.setAttribute("label", strs.getString("heapmin"));
  
  mPop.appendChild(gCol);
  mPop.appendChild(cCol);
  mPop.appendChild(hMin);
  btn.appendChild(mPop);
  statusBar.appendchild(btn);
}

function unloadFromWindow(window) {
  if (!window) return;
  var removeId = function(id) {
      var elem = window.document.getElementById(id);
      elem.parentNode.removeChild(elem);
    };
  removeId("memory-menu-strSet");
  removeId("memory-menu-js");
  removeId("memory-menu-main");
}

/*
 bootstrap.js API
*/

var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  onCloseWindow: function(aWindow) { },
  onWindowTitleChange: function(aWindow, aTitle) { }
};

function startup(aData, aReason) {
  if (Services.vc.compare(Services.appinfo.platformVersion, "10.0") < 0)
    Components.manager.addBootstrappedManifestLocation(aData.installPath);
  
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
  
  // Load into any existing windows
  let enumerator = wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(win);
  }
  
  // Load into any new windows
  wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  if (Services.vc.compare(Services.appinfo.platformVersion, "10.0") < 0)
    Components.manager.removeBootstrappedManifestLocation(aData.installPath);
  
  // When the application is shutting down we normally don't have to clean up any UI changes
  if (aReason == APP_SHUTDOWN) return;
  
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
  
  // Stop watching for new windows
  wm.removeListener(windowListener);
  
  // Unload from any existing windows
  let enumerator = wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(win);
  }
}

function install(aData, aReason) { }

function uninstall(aData, aReason) { }