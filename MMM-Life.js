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
	useWraparound: true,
	refreshGeneration: 200,
	showGeneration: true,
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
        this.newworld = Array.from(Array(this.config.horizontalCells), () => new Array(this.config.verticalCells));
        this.world = Array.from(Array(this.config.horizontalCells), () => new Array(this.config.verticalCells));
        this.randomizeWorld();
        this.rotateInterval = null;  // <-- sets rotation time (see below)
        this.scheduleUpdate();       // <-- When the module updates (see below)
	this.genCount = 0;
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
	    if (){
                header.innerHTML = this.config.header + " Gen: " + this.genCount.toString();
	    } else {
                header.innerHTML = this.config.header;
	    }
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
                    cell.innerHTML = "&nbsp;";
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
    
    randomizeWorld(){
	for(var horiz = 0; horiz < this.config.horizontalCells; horiz++){
            for(var vert = 0; vert < this.config.verticalCells; vert++){
                if(Math.random() > this.config.randomThreshold){
                    this.world[horiz][vert] = 0;
                } else {
                    this.world[horiz][vert] = 1;
                }
            }
	}
    },
	
    checkCell: function(h, v){
	 var c = 0;
	 if (this.config.useWraparound){
              var modh = h;
	      var modv = v;
		 
	      // Handle wraparound for negative values on the assumption 
	      // that the smallest value will be -1.
              if(h < 0) {
		      modh = h + this.config.horizontalCells;
	      } 
	      if (v < 0) {
		      modv = v + this.config.verticalCells;
	      }
	      modh = modh % this.config.horizontalCells;
	      modv = modv % this.config.verticalCells;
              c = c + this.world[modh][modv];
	 } else {	
             if ((h >= 0) && (h < this.config.horizontalCells)){
    	         if ((v >= 0) && (v < this.config.verticalCells)){
                     c = c + this.world[h][v];     
		     //console.log("MMM-Life:    cs (" + h + ", " + v + ") = " + this.world[h][v] )
    	         }
	     }
	 }
	 return c;
    },
    countNeighbours: function(h, v){
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
	for(var vs = 0; vs < this.config.verticalCells; vs++){
             for(var hs = 0; hs < this.config.horizontalCells; hs++){
	          if (this.world[hs][vs] == 1){
			  if((this.countNeighbours(hs, vs) < 2) || (this.countNeighbours(hs, vs) > 3)){
				  this.newworld[hs][vs] = 0;
			  } else {
				  this.newworld[hs][vs] = 1;
			  }
		  } else {
			  if(this.countNeighbours(hs,vs) == 3 ){
				  this.newworld[hs][vs] = 1;
			  } else {
				  this.newworld[hs][vs] = 0;
			  }
		  }
	     }
	}
	// Copy newworld into oldworld
	for(var vv = 0; vv < this.config.verticalCells; vv++){
		for(var hh = 0; hh < this.config.horizontalCells; hh++){
			this.world[hh][vv] = this.newworld[hh][vv];
		}
	}
	// Increment generation count and re-randomize if neccessary
	this.genCount++;
	if(this.genCount > this.config.refreshGeneration ){
	     this.genCount = 0;
             this.randomizeWorld();
	}
	    
	this.updateDom(this.config.animationSpeed);
      	this.loaded  = true;
    },
	
// this tells module when to update
    scheduleUpdate: function() { 
	//console.log("MMM-Life scheduleUpdate called.");
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
        this.updateDom(this.config.animationSpeed);
    },
});
