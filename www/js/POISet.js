function POISet(options) {
	this.id = null;
	this.pois = [];
	this.label = "";
	this.hudDotColor = "#ffffff";
	this.hudIconColor = "#ffffff";
	this.enabled = false;
	this.icon = null;
	
	this.init(options);
	
	return this;
}

POISet.prototype.init = function(options) {
	if( options ) {
		if( options.label ) {
			this.label = options.label;
		}
		if( options.icon ) {
			this.icon = options.icon;
		}
	}
}

POISet.prototype.clear = function() {
	this.pois = [];
}

POISet.prototype.addPOI = function(poi, options) {
	this.pois.push(poi);
	
	// If this set has already been added to the HUD,
	// register the new POI with the HUD
	if( typeof this.id != "undefined" ) {
		HUD.addPOI(poi, options);
	}
}

POISet.prototype.isEnabled = function() {
	return this.enabled;
}

POISet.prototype.enable = function() {
	this.enabled = true;
	
	for( var index=0 ; index<this.pois.length ; index++ ) {
		var el = Ext.get(this.pois[index].div);
		if( el ) el.show();
	}
}

POISet.prototype.disable = function() {
	this.enabled = false;
	
	for( var index=0 ; index<this.pois.length ; index++ ) {
		var el = Ext.get(this.pois[index].div);
		if( el ) el.hide();
	}
}