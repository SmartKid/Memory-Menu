/* -*- Mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil; -*-
 * ShivamDutt.MemoryMenu namespace.
 */

var ShivamDutt = ShivamDutt || {};
ShivamDutt.MemoryMenu = ShivamDutt.MemoryMenu || {
	Cc: Components.classes,
	Ci: Components.interfaces,
	Cu: Components.utils,
	/** Initializes this object. */
	init: function() {
			this.obsService = this.os = this.Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
			this.j = 0;
		},
	doGlobalGC: function() {
			this.Cu.forceGC();
			this.os.notifyObservers(null, "child-gc-request", null);
		},
	doCC: function() {
			window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).cycleCollect();
			this.os.notifyObservers(null, "child-cc-request", null);
		},
	doHeapMinimize: function() {
			this.os.notifyObservers(null, "memory-pressure", "heap-minimize");
			if (++this.j < 3) this.os.mainThread.dispatch({run: doHeapMinimize}, Ci.nsIThread.DISPATCH_NORMAL);
			else this.j = 0;
		}};

/** Constructor. */
window.addEventListener("load", ShivamDutt.MemoryMenu.init, false);