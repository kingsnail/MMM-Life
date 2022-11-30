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
        for(var vert = 0; vert < this.config.verticalCells; vert++){
            var row = document.createElement("div")
	    row.classList.add("liferow");
            for(var horiz = 0; horiz < this.config.horizontalCells; horiz++){
                var cell = document.createElement("span")
		if(this.world[horiz][vert] == 1){
                    cell.innerHTML = "o";
                    cell.classList.add("xsmall", "bright", "cell1");
		} else {
                    cell.innerHTML = "&nbsp;";
                    cell.classList.add("xsmall", "bright", "cell0");
		}
                row.appendChild(cell);
            }
            wrapper.appendChild(row);
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
    
    checkCell(h, v){
	 var c = 0;
         if ((h >= 0) && (h < this.config.horizontalCells)){
	     if ((v >= 0) && (v < this.config.verticalCells)){
                  c = c + this.world[h][v];     
		  //console.log("MMM-Life:    cs (" + h + ", " + v + ") = " + this.world[h][v] )
	     }
	 }
	 return c;
    },
    countNeighbours(h, v){
	  var n = 0;
	  n = n + this.checkCell(h - 1, v + 1);
	  n = n + this.checkCell(h,     v + 1);
	  n = n + this.checkCell(h + 1, v + 1);

	  n = n + this.checkCell(h - 1, v);
	  n = n + this.checkCell(h + 1, v);
	  
	  n = n + this.checkCell(h - 1, v - 1);
	  n = n + this.checkCell(h,     v - 1);
	  n = n + this.checkCell(h + 1, v - 1);
	  //console.log("MMM-Life: n[" + h + "][" + v + "] = " + n);
	  return n
    },
	
    processWorld: function() {
        console.log("Life: Process World");
	for(var vs = 0; vs < this.config.verticalCells; vs++){
             for(var hs = 0; hs < this.config.horizontalCells; hs++){
	          if (this.world[hs][vs] == 1){
			  if((this.countNeighbours(hs, vs) < 2) || (this.countNeighbours(hs, vs) > 3)){
				  this.world[hs][vs] = 0;
			  }
		  } else {
			  if(this.countNeighbours(hs,vs) == 3 ){
				  this.world[hs][vs] = 1;
			  }
		  }
	     }
	}
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
