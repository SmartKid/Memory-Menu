/* -*- Mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil; -*-
 * ShivamDutt.MemoryMenu namespace.
 */

if (typeof ShivamDutt == "undefined") var ShivamDutt = {};

if (typeof ShivamDutt.MemoryMenu == "undefined")
{
	ShivamDutt.MemoryMenu = {
	Cc: Components.classes,
	Ci: Components.interfaces,
	Cu: Components.utils,
	/**
	 * Initializes this object.
	 */
	init: function() {
			this.os = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
			this.obsService = os;
			this.j = 0;
		},
	doGlobalGC: function() {
			this.Cu.forceGC();
	    	this.os.notifyObservers(null, "child-gc-request", null);
		},
	doCC: function() {
	    	window.QueryInterface(Ci.nsIInterfaceRequestor)
	    	    .getInterface(Ci.nsIDOMWindowUtils)
	    	    .cycleCollect();
	    	this.os.notifyObservers(null, "child-cc-request", null);
		},
	doHeapMinimize: function() {
	    	this.os.notifyObservers(null, "memory-pressure", "heap-minimize");
	    	if (++this.j < 3) this.os.mainThread.dispatch({run: doHeapMinimize}, Ci.nsIThread.DISPATCH_NORMAL);
	    	else this.j = 0;
		}
	};
	
	/**
	 * Constructor.
	 */
	window.addEventListener('load', function() { ShivamDutt.MemoryMenu.init(); }, false);
};