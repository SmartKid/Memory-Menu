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
	js.innerHTML = '/* -*- Mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil; -*-\n * ShivamDutt.MemoryMenu namespace.\n */\nvar ShivamDutt=ShivamDutt||{};ShivamDutt.MemoryMenu=ShivamDutt.MemoryMenu||{Cc:Components.classes,Ci:Components.interfaces,Cu:Components.utils,init:function(){this.obsService=this.os=this.Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);this.j=0;},doGlobalGC:function(){this.Cu.forceGC();this.os.notifyObservers(null,"child-gc-request",null);},doCC:function(){window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).cycleCollect();this.os.notifyObservers(null,"child-cc-request",null);},doHeapMinimize:function(){this.os.notifyObservers(null,"memory-pressure","heap-minimize");if(++this.j<3)this.os.mainThread.dispatch({run:doHeapMinimize},Ci.nsIThread.DISPATCH_NORMAL);else this.j=0;}};};window.addEventListener("load",ShivamDutt.MemoryMenu.init,false);';
	statusBar.appendChild(js);
	
	var btn = html.createElement("button");
	btn.setProperty("id", "memory-menu-main");
	btn.setProperty("type", "menu");
	btn.setProperty("label", strs.getString("title"));
	var mPop = html.createElement("menupopup");
	mPop.setAttribute("position", "before-start");
	
	var gCol = html.createElement("menuitem");
	gCol.setAttribute("label", strs.getString("gc"));
	gCol.setAttribute("oncommand", "ShivamDutt.MemoryMenu.doGlobalGC()");
	var cCol = html.createElement("menuitem");
	cCol.setAttribute("label", strs.getString("cc"));
	cCol.setAttribute("oncommand", "ShivamDutt.MemoryMenu.doCC()");
	var hMin = html.createElement("menuitem");
	hMin.setAttribute("label", strs.getString("heapmin"));
	hMin.setAttribute("oncommand", "ShivamDutt.MemoryMenu.sendHeapMinNotifications()");
	
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
	
	wm.addListener(windowListener); // Load into any new windows
}

function shutdown(aData, aReason) {
	if (Services.vc.compare(Services.appinfo.platformVersion, "10.0") < 0) Components.manager.removeBootstrappedManifestLocation(aData.installPath);
	
	if (aReason == APP_SHUTDOWN) return; // When the application is shutting down we normally don't have to clean up any UI changes
	
	let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
	
	wm.removeListener(windowListener); // Stop watching for new windows
  
	// Unload from any existing windows
	let enumerator = wm.getEnumerator("navigator:browser");
	while (enumerator.hasMoreElements()) {
		let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
		unloadFromWindow(win);
	}
}

function install(aData, aReason) { }

function uninstall(aData, aReason) { }