/* Magic Mirror
 * Module: Life
 *
 * By Mark Pearce
 *
 */
Module.register("MMM-Life", {

    // Module config defaults.
    defaults: {
        useHeader: true, // false if you don't want a header
        header: "Game Of Life", // Any text you want
        maxWidth: "250px",
        horizontalCells: 20,
        verticalCells:   20,
        randomThreshold: 0.10,
        rotateInterval: 300 * 1000,
        animationSpeed: 10, // fade in and out speed
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 5 * 1 * 1000, // Update every 5 seconds
    },

    getStyles: function() {
        return ["MMM-Life.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",
        console.log("MMM-Life: horiz = " + this.config.horizontalCells)
        console.log("MMM-Life: vert  = " + this.config.verticalCells)
        this.world = Array.from(Array(this.config.horizontalCells), () => new Array(this.config.verticalCells));
        console.info(this.world);
        for(var horiz = 0; horiz < this.config.horizontalCells; horiz++){
            for(var vert = 0; vert < this.config.verticalCells; vert++){
                if(Math.random() > this.config.randomThreshold){
                    this.world[horiz][vert] = 0;
                } else {
                    this.world[horiz][vert] = 1;
                }
            }
	}
        this.rotateInterval = null;  // <-- sets rotation time (see below)
        this.scheduleUpdate();       // <-- When the module updates (see below)
	var self = this;
    },
	
    getDom: function() {
		
		// creating the wrapper
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

		// The loading sequence
        if (!this.loaded) {
            wrapper.innerHTML = "Loading Cells . . !";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

		// creating the header
        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "light", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

		// Rotating the data
        var grid = document.createElement("div");
        for(var vert = 0; vert < config.verticalCells; vert++){
            var row = document.createElement("div")
            for(var horiz = 0; horiz < config.horizontalCells; horiz++){
                var cell = document.createElement("span")
		console.log("MMM-Life: Cell " + vert + ",  " + horiz + " = " + this.world[horiz][vert].toString());
                span.innerHTML = this.world[horiz][vert].toString();
                span.classList.add("small", "bright", "staterow");
                row.appendChild(cell);
            }
            wrapper.appendChild(div);
        } 	
        return wrapper;
	    
    }, // <-- closes the getDom function from above

	// this processes your data
    setDevice: function(d, s) { 
	if ( s === "on" ) {
             console.log("KS-SH: setDevice(" + d + ", " + s + ") Turn Off");
             this.sendSocketNotification('SET_DEVICE_OFF', d);
	     this.getDevices();

	} else {
             console.log("KS-SH: setDevice(" + d + ", " + s + ") Turn On");
             this.sendSocketNotification('SET_DEVICE_ON', d);
	     this.getDevices();
	}
    },
    
    processWorld: function() {
        console.log("Life: Process World");
      	this.loaded  = true;
    },
	
// this tells module when to update
    scheduleUpdate: function() { 
	console.log("MMM-Life scheduleUpdate called.");
        setInterval(() => {
            this.processWorld();
        }, this.config.updateInterval);
        this.processWorld();
    },
	
// this gets data from node_helper
    socketNotificationReceived: function(notification, payload) { 
        if (notification === "DEVICES_RESULT") {
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
