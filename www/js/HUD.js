HUD = {
	initialized : false,
	canvasId : null,
	canvas : null,
	ctx : null,
	containerId : null,
	poisets : [],
	pois : [],
	width : 100,
	height : 100,
	radius : 50,
	scale : 1,
	cx : 50,
	cy : 50,
	r : 20,
	g : 128,
	b : 20,
	alpha : 1,
	hudCoverage : 5, // miles
	borderWidth : 2,
	redrawIntervalId : null,
	redrawInterval : 50,
	viewAngle : 45.0,
	pxPerDeg : 0,
	maxSets : 10,
	overlayOffset : 0, // deprecated
	currentHeading : null,
    userDataSets : [],
	
	init : function(options) {
		this.initialized = true;
		if( options ) {
			if( options.canvasId ) {
				this.canvasId = options.canvasId;
			}
			if( options.containerId ) {
				this.containerId = options.containerId;
			}
			if( options.radius ) {
				this.scale = options.radius / this.radius;
			}
		}
		
		this.pxPerDeg = Ext.get("mainOverlay").getWidth() / this.viewAngle;
		
//		var width = Math.ceil(this.pxPerDeg * 360 + 2 * Ext.get("mainOverlay").getWidth());
//		var height = Ext.get("mainOverlay").getHeight();
//		this.overlayOffset = Ext.get("mainOverlay").getWidth();
//		Ext.get("overlay").setWidth(width);
//		Ext.get("overlay").setHeight(height);
		
		var width = Math.ceil(this.pxPerDeg * 180);
		var height = Ext.get("mainOverlay").getHeight();
		
		Ext.get("overlay0-180").setWidth(width + 20);
		Ext.get("overlay0-180").setHeight(height);
		Ext.get("overlay180-360").setWidth(width + 20);
		Ext.get("overlay180-360").setHeight(height);
		Ext.get("overlay180-360").hide();

		this.canvas = document.getElementById(this.canvasId);
		this.canvas.setAttribute("width", Math.ceil(this.width * this.scale) * 2);
		this.canvas.setAttribute("height", Math.ceil(this.height * this.scale) * 2);
		
		this.ctx = this.canvas.getContext("2d");
		this.ctx.scale(this.scale, this.scale);
		
		this.redraw();
		
		var self = this;
		this.redrawIntervalId = setInterval(function() {
			self.redraw();
		}, this.redrawInterval);
        
        this.loadUserData();
		
		return this;
	},
    
    loadUserData : function() {
        if( typeof invokeString != "undefined" )
        {
//            alert("invokeString = " + invokeString);
            if( invokeString.match(/arview:\/\/[^\/]*\/data=(.*)/g) ) {
                var data = RegExp.$1;
//                alert("data = " + data);
                var decoded = Base64.decode(data);
//                alert("decoded = " + decoded);
                var userData = JSON.parse(decoded);
                
//                alert(userData.length);
                if( typeof userData != "undefined" ) {
                    var set = new POISet();
                    for( var index=0 ; index<userData.length ; index++ ) {
                        var poi = userData[index];
                        
                        set.addPOI(poi);
                    }
                    HUD.addPOISet(set);
                }
            } else {
                alert("ARView invoked with invalid invokeString!");
            }
        }  
    },
	
//	onOrientationChange : function() {
    onCompassChange : function(heading) {
//		var heading = Math.floor(PhoneGapEvents.getOrientation().x);
        var heading = Math.floor(heading.magneticHeading);
		if( this.currentHeading==null ) {
			this.currentHeading = heading;
		}
		
		if( heading < 180 && heading >= 0 ) {
			// 0-180 main display
			var x = Math.floor(
					-heading * this.pxPerDeg +
					Ext.get("mainOverlay").getWidth() / 2
					);
			
			Ext.get("overlay0-180").setXY([x,20]);
			Ext.get("overlay0-180").show();
			
			// 180-360 on the right
			if( heading > 180 - this.viewAngle ) {
				x = Math.floor(
						(180 - heading + this.viewAngle / 2) * this.pxPerDeg
					);
				Ext.get("overlay180-360").setXY([x,20]);
				Ext.get("overlay180-360").show();
				
			// 180-360 on the left
			} else if( heading >= 0 && heading < this.viewAngle ) {
				x = Math.floor(
						(- 180 + this.viewAngle / 2 - heading) * this.pxPerDeg
					);
				
				Ext.get("overlay180-360").setXY([x,20]);
				Ext.get("overlay180-360").show();
				
			// 180-360 off the screen
			} else {
				Ext.get("overlay180-360").hide();
			}
		
		// 180 < heading < 360
		} else {
			// 180-360 main display
			var x = Math.floor(
					-(heading-180) * this.pxPerDeg +
					Ext.get("mainOverlay").getWidth() / 2
					);
			
			Ext.get("overlay180-360").setXY([x,20]);
			Ext.get("overlay180-360").show();
			
			// 0-180 on the right
			if( heading >= 360 - this.viewAngle ) {
				// 0-180 should still be showing on the right
				x = Math.floor( 
						Ext.get("mainOverlay").getWidth() - 
						(heading - (360 - this.viewAngle / 2)) * this.pxPerDeg
					);
				Ext.get("overlay0-180").setXY([x,20]);
				Ext.get("overlay0-180").show();
			
			// 0-180 on the left
			} else if( heading < 180 + this.viewAngle ) {
				x = Math.floor(
						(180 - heading - 180 + this.viewAngle / 2) * this.pxPerDeg
					);
				Ext.get("overlay0-180").setXY([x,20]);
				Ext.get("overlay0-180").show();
			} else {
				Ext.get("overlay0-180").hide();
			}
		}
		
		//Ext.get("overlay180-360").setXY([,20]);
		//console.log("overlay x = " + x);
	},
	
	onLocationChange : function() {
		//console.log("HUD.js: Location changing, updating all POIs");
		
		for( var index = 0 ; index < this.pois.length ; index++ ) {
			this._updatePOIPopup(this.pois[index]);
		}
	},
	
	redraw : function() {
		//var time = new Date().getTime();
		this.draw();
		//console.log("redraw took " + (new Date().getTime() - time) + "ms");
	},
	
	draw : function() {
		this.drawHUD();
	},
	
	drawHUD : function() {
		if( typeof this.ctx == undefined || !this.ctx ) return;
		
		this.clear();
		
		this.ctx.save();
		
		// fill HUD
		this.ctx.beginPath();
		this.ctx.arc(this.cx, this.cy, this.radius - 2, 0, Math.PI*2, true);
		this.ctx.fillStyle = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.alpha + ")";
		this.ctx.closePath();
		this.ctx.fill();+
		
		// draw view
		this.ctx.beginPath();
		this.ctx.moveTo(this.cx, this.cy);
		this.ctx.arc(this.cx, this.cy, this.radius - 2, - Math.PI / 2 + (this.viewAngle / 2) * Math.PI / 180, -Math.PI / 2 - this.viewAngle / 2 * Math.PI / 180, true);
		this.ctx.closePath();
		this.ctx.fillStyle = "rgba(255,255,255,.5)";
		this.ctx.fill();
		
		// outline HUD
		this.ctx.beginPath();
		this.ctx.arc(this.cx, this.cy, this.radius - this.borderWidth, 0, Math.PI*2, true);
		this.ctx.strokeStyle = "#000000"; //"rgba(0,0,0,1)"
		this.ctx.lineWidth = this.borderWidth;
		this.ctx.closePath();
		this.ctx.stroke();
		
		// draw POIs
		for( var index = 0 ; index < this.pois.length ; index++ ) {			
			this._drawPOI(this.pois[index], 2);
		}
		
		// draw enabled POI sets
		for( var index =0 ; index < this.poisets.length ; index++ ) {
			this.poisets[index].btn.setBadge(this.poisets[index].pois.length);
			if( this.poisets[index].enabled ) {
				for( var index2=0 ; index2 < this.poisets[index].pois.length ; index2++ ) {
					this._drawPOI(this.poisets[index].pois[index2], 2);
				}
			}
		}
		this.ctx.restore();
		
		return this;
	},
	
	clear : function() {
		this.ctx.clearRect(0,0,this.width, this.height);
	},
	
	addPOISet : function(set) {
		set.id = this.poisets.length;
		
		for( var index=0 ; index<set.pois.length ; index++ ) {
			this._initPOI(set.pois[index], {
				cls : "poi-set-" + set.id
			});
			this._updatePOIPopup(set.pois[index]);
			//this.pois.push(set.pois[index]);
		}
		
		set.enable();
		
        var btn = new Ext.Button({
        	cls : "poi-set-btn",
        	listeners : {
        		"tap" : function() {
        			if( set.isEnabled() ) {
        				this.addCls("disabled");
        				set.disable();
        			} else {
        				this.removeCls("disabled");
        				set.enable();
        			}
        		},
        		"taphold" : function(e, t) {
//        			e.stopEvent();
        			e.stopPropagation();
        		}
        		
        	}
        });
        
        set.btn = btn;
        
        //btn.addCls("disabled");
        //btn.setBadge(set.pois.length);
        
        var toolbar = Ext.getCmp("toolbar");
        toolbar.add(btn);
        toolbar.doLayout();
        
        if( set.icon ) {
        	Ext.getCmp(btn.id).el.dom.style.backgroundImage = "url(" + set.icon + ")";
        	Ext.getCmp(btn.id).el.dom.style.backgroundSize = "30px 30px";
        	Ext.getCmp(btn.id).el.dom.style.backgroundRepeat = "no-repeat";
        	Ext.getCmp(btn.id).el.dom.style.backgroundPosition = "center";
        } else {
        	btn.addCls("poi-set-" + set.id + "-btn");
        }
        
        Ext.getCmp(btn.id).el.on('taphold', function(e, t) {
            this.fireEvent('taphold', this, e, t);
        }, btn);
		
		this.poisets.push(set);
	},
	
	addPOI : function(poi, options) {
//		this._initPOI(poi, {
//			cls : "poi-set-generic"
//		});
		this._initPOI(poi, options);
		this._updatePOIPopup(poi);
		//this.pois.push(poi);
	},
	
	_initPOI : function(poi, options) {
		poi.div = document.createElement("div");
		poi.div.className = "poiPopup";
		
		var el = new Ext.Element(poi.div);
		//el.addCls("easeOut");
		
		if( typeof options != "undefined" ) {
			if( typeof options.cls != "undefined" ) {
				el.addCls(options.cls);
			}
			if( typeof options.icon != "undefined" ) {
				el.dom.style.backgroundImage = "url(" + options.icon + ")";
				el.dom.style.backgroundSize = "30px 30px";
				el.dom.style.backgroundRepeat = "no-repeat";
				el.dom.style.backgroundPosition = "center";
			}
		}
		
		var label = document.createElement("div");
		label.className = "label";
		label.innerHTML = poi.label;
		
//		console.log("appending child to overlay");
		el.appendChild(label);
		
		el.dom.addEventListener("click", function() {
			var currentPosition = PhoneGapEvents.getLocation();
			var lat1 = new LatLon(currentPosition.coords.latitude, currentPosition.coords.longitude);
			var lat2 = new LatLon(poi.latitude, poi.longitude);
			
			// Calculate the distance between us and the poi
			var relativeDistance = lat1.distanceTo(lat2);
			
			var mi = _KMtoMI(relativeDistance);
			var distance = mi;
			var units = "mi";
			
			if( Math.round(distance) < 1 ) {
				distance = Math.round(_MItoFT(distance));
				units = "ft";
			} else {
				distance = Math.round(distance);
			}
			
			Ext.getCmp("poiInformationPanel").update({
				distance : distance,
				units : units,
				label : poi.label
			});
			
			Ext.getCmp("poiInformationPanel").setVisible(true);
		}, false);
		
		Ext.get("overlay180-360").appendChild(el.dom);
		
		var x = Math.floor((Ext.get("mainOverlay").getWidth() - el.getWidth()) / 2); 
		var y = Ext.get("main").getHeight();
		
		el.setTop(y);
		el.setLeft(x);
	},	
	
	_drawPOI : function(poi, pointRadius) {
		// If we don't have a current location, just return
		if( null==PhoneGapEvents.getLocation() ) return;
		
		var deviceOrientationAdjustment = 0;
		if( window.orientation ) deviceOrientationAdjustment = window.orientation;
		
		var heading;
		if( null==PhoneGapEvents.getHeading() ) {
			heading = 0;
		} else {
//			heading = PhoneGapEvents.getOrientation().x;
            heading = PhoneGapEvents.getHeading().magneticHeading;
		}
		
		// Make sure we have a point radius to draw
		if( !pointRadius ) pointRadius = 5;
		
		// Do some distance/bearing calculations
		var currentPosition = PhoneGapEvents.getLocation();
		var lat1 = new LatLon(currentPosition.coords.latitude, currentPosition.coords.longitude);
		var lat2 = new LatLon(poi.latitude, poi.longitude);
		
		// Calculate the distance between us and the poi
		var relativeDistance = lat1.distanceTo(lat2);
		
		// Convert it to miles
		relativeDistance = _KMtoMI(relativeDistance);
		
		// Check if it's larger than the HUD's coverage; if so, set it to the 
		// max coverage - the size of the point so it's inside the HUD
		if( relativeDistance > this.hudCoverage ) relativeDistance = this.hudCoverage;
		
		// Convert to distance on the screen
		var hudDistance = Math.floor((relativeDistance / this.hudCoverage) * (this.radius - this.borderWidth - (pointRadius / 2)) );
		
		// Calculate the bearing between us and the poi
		var relativeBearing = lat1.bearingTo(lat2);
		
		// Adjust for the device bearing
		relativeBearing -= heading - deviceOrientationAdjustment; 
			
		if( relativeBearing < 0 ) relativeBearing += 360;
		
		//console.log("drawing " + poi.label + " at " + hudDistance + " pixels at " + relativeBearing + " degrees");
		
		// Start drawing
		this.ctx.save();		
		
		this.ctx.translate(this.cx, this.cy);
		this.ctx.rotate(Math.PI / 180 * (relativeBearing - 180)); //this.targetBearing
		this.ctx.beginPath();
		this.ctx.arc(0, hudDistance, pointRadius, 0, 2*Math.PI, false);
		this.ctx.fillStyle = "#ffffff";
		this.ctx.closePath();
		this.ctx.fill();
		
		this.ctx.restore();
	},
	
	_updatePOIPopup : function(poi) {
		// Check if we have a geolocation yet
		if( PhoneGapEvents.getLocation()==null ) {
			//console.log("HUD.js: No geolocation, returning.");
			return;
		}
		
		//console.log("HUD.js: Updating poi");
		
		// Determine our adjustment for the device's orientation
		var deviceOrientationAdjustment = 0;
		if( window.orientation ) deviceOrientationAdjustment = window.orientation;
		
		var heading;
		if( null==PhoneGapEvents.getOrientation() ) {
			heading = 0;
		} else {
			heading = PhoneGapEvents.getOrientation().x;
		}
		
		// Do some distance/bearing calculations
		var currentPosition = PhoneGapEvents.getLocation();
		var lat1 = new LatLon(currentPosition.coords.latitude, currentPosition.coords.longitude);
		var lat2 = new LatLon(poi.latitude, poi.longitude);
		
		var relativeBearing = lat1.bearingTo(lat2);
		
		// Adjust for the device bearing
//		relativeBearing -= heading; 
//			
		if( relativeBearing < 0 ) relativeBearing += 360;
		
		if( relativeBearing < 180 ) {
			Ext.get(poi.div).appendTo(Ext.get("overlay0-180"));
		} else {
			Ext.get(poi.div).appendTo(Ext.get("overlay180-360"));
		}
		
//		console.log(poi.label + " " + relativeBearing);
		
		var x = Math.floor(
				(relativeBearing % 180) * this.pxPerDeg 
				);
		var y = Math.floor(Ext.get("mainOverlay").getHeight() / 2);
		
		// Draw the poi div on the viewscreen
		var el = Ext.get(poi.div);
		
		// Use setTop/setLeft, not setXY so it's relative, not absolute
		el.setTop(y);
		el.setLeft(x);
	}
}