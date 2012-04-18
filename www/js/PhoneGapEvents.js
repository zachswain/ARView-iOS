var PhoneGapEvents = {
	_options : {
		monitorOrientation : true,
		monitorOrientationDelay : 1000,
		monitorCompass : true,
		monitorCompassDelay : 100,
		monitorGeolocation : true,
		monitorGeolocationDelay : 5000
	},
	
	_phonegapActive : false,
	
	_onOrientationChangeFuncs : [],
	_orientationIntervalId : null,	
	_orientation : null,
	_orientationCallbacksInProcess : false,

	_onCompassChangeFuncs : [],
	_compassIntervalId : null,
	_heading : null,

	_onGeolocationChangeFuncs : [],
	_geolocationIntervalId : null,
	_location : null,
	
	/* Below is the Coordinates structure from PhoneGap:
	 * 
	   coords : {
			accuracy: 63
			altitude: null
			altitudeAccuracy: null
			heading: null
			latitude: 38.8132877
			longitude: -77.63914050000001
			speed: null
		},
		timestamp: 1326913418707
	 */
	
	init : function(options) {
		if( typeof cordova != undefined) {
			this._phonegapAvailable = cordova.available;
		} else {
			this._phonegapAvailable = false;
		}
		
		/*
		 * Process options
		 */
		if( typeof options != undefined ) {
			/**
			 * Monitor Orientation Delay
			 */ 
			if( typeof options.monitorOrientationDelay != undefined ) {
				this._options.monitorOrientationDelay = options.monitorOrientationDelay;
			}			
			if( typeof options.monitorCompass != undefined ) {
				this._options.monitorCompass = options.monitorCompass;
			}
			if( options.monitorCompassDelay ) {
				this._options.monitorCompassDelay = options.monitorCompassDelay;
			}
		}
		
		/*
		 * Set up event listeners
		 */ 
		if( this._options.monitorOrientation ) {
			this._startMonitoringOrientation();			
		}
		if( this._options.monitorCompass ) {
			this._startMonitoringCompass();
		}
		if( this._options.monitorGeolocation ) {
			this._startMonitoringGeolocation();
		}		
		
		// menu button
		var self = this;
		document.addEventListener("menubutton", function() {
			self._onMenuButton();
		}, false);
	},
	
	_startMonitoringGeolocation : function() {		
		navigator.geolocation.getCurrentPosition(function(location) {
			console.log("got geolocation = " + location);
			self._location = location;
			self._onGeolocationChange();
		}, function(error) {
			Ext.Msg.alert("Error reading geolocation", error.message);
			console.log("PhoneGapEvents.js: Error reading geolocation, " + error.message)
		});
		
		var self = this;
		this._geolocationIntervalId = setInterval(function() {
			if( navigator.geolocation ) {
				console.log("PhoneGapEvents.js: Got geolocation");
				clearInterval(self._geolocationIntervalId);
				self._geolocationIntervalId = navigator.geolocation.watchPosition(function(location) {
					console.log("got new location = " + location);
					self._location = location;
					self._onGeolocationChange();
				}, function(error) {
					Ext.Msg.alert("Error reading geolocation", error.message);
					console.log("PhoneGapEvents.js: Error reading geolocation, " + error.message)
				}, { frequency: self._options.monitorGeolocationDelay }); 
			}
		}, 250);
	},
	
	getLocation : function() {
		return this._location;
	},
	
	onGeolocationChange : function(fnc) {
		if( typeof fnc == "function" ) {
			this._onGeolocationChangeFuncs.push(fnc);
		}
	},
	
	_onGeolocationChange : function() {
		for( var index = 0 ; index < this._onGeolocationChangeFuncs.length ; index++ ) {
			this._onGeolocationChangeFuncs[index](this._location);
		}
	},
	
	getHeading : function() {
		return this._heading;
	},
	
	_startMonitoringCompass : function() {
		var self = this;
		this._compassIntervalId = setInterval(function() {
			if( navigator.compass ) {
				console.log("PhoneGapEvents.js: Got compass");
				clearInterval(self._compassIntervalId);
				self._compassIntervalId = navigator.compass.watchHeading(function(heading) {
					self._heading = heading;
					self._onCompassChange();
				}, function(error) {
//					console.log("PhoneGapEvents._startMonitoringCompass: " + error);
				}, {
					frequency : self._options.monitorCompassDelay
				});
				
			}
		}, 250);
	},
	
	onCompassChange : function(fnc) {
		if( typeof fnc == "function" ) {
			this._onCompassChangeFuncs.push(fnc);
		}
	},
	
	_onCompassChange : function() {
//        console.log("compass change: " + this._heading.magneticHeading);
		for( var index = 0 ; index < this._onCompassChangeFuncs.length ; index++ ) {
			this._onCompassChangeFuncs[index](this._heading);
		}
	},
	
	_stopMonitoringCompass : function() {
		clearInterval(this._compassIntervalId);
	},
	
	_startMonitoringOrientation : function() {
		var self = this;
		console.log("monitoring orientation");
		this._orientationIntervalId = setInterval(
			function() {
				self._queryOrientation();
			},
			this._options.monitorOrientationDelay);
	},
	
	_queryOrientation : function() {
//		console.log("querying orientation");
		
		var self = this;
                    /*
		if( window.plugins.OrientationPlugin ) {
			window.plugins.OrientationPlugin.getOrientation(function(result) {
				self._onOrientationChange(result);
	//			console.log("orientation update: " + result.x + "," + result.y + "," + result.z);
			}, function(error) {
				console.log("PhoneGapEvents._queryOrientation: " + error);
			}, {
				
			});
		}
         */
	},
	
	_stopMonitoringOrientation : function() {
		if( this._orientationIntervalId ) {
			window.clearInterval(this._orientationIntervalId);
			this._orientationIntervalId = null;
		}
	},
	
	onOrientationChange : function(fnc) {
		if( typeof fnc == "function" ) {
			this._onOrientationChangeFuncs.push(fnc);			
		}		
	},
	
	_onOrientationChange : function(orientation) {		
		this._orientation = orientation;
		
		/*
		for( var index=0 ; index<this._onOrientationChangeFuncs.length ; index++ ) {
			this._onOrientationChangeFuncs[index](this._orientation);
		}
		*/
		
		var cnt = 0;
		var self = this;
		var time = new Date().getTime();
		function doCallbacks() {
			if( cnt<self._onOrientationChangeFuncs.length && typeof self._onOrientationChangeFuncs[cnt] != undefined) {
				self._onOrientationChangeFuncs[cnt++](self._orientation);
				setTimeout(doCallbacks, 10);
			} else {
				//console.log("orientation change callbacks took " + (new Date().getTime() - time) + "ms");
				self._orientationCallbacksInProcess = false;
			}
		}
		if( !this._orientationCallbacksInProcess ) {
			this._orientationCallbacksInProcess = true;
			setTimeout(doCallbacks, 10);	
		} else {
			console.log("skipping orientation callbacks, still in process");
		}
	},
	
	getOrientation : function() {
		return this._orientation;
	},
	
	onMenuButton : function() {
		
	},
	
	_onMenuButton : function() {
		this.onMenuButton();
	}
}