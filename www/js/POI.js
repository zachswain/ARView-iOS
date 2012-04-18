function POI(options) {
	this.label = null;
	this.latitude = null;
	this.longitude = null;
	this.altitude = null;
	
	if( options ) {
		if( options.label ) {
			this.label = options.label;
		}
		if( options.latitude ) {
			this.latitude = options.latitude;
		}
		if( options.longitude ) {
			this.longitude = options.longitude;
		}
		if( options.altitude ) {
			this.altitude = options.altitude;
		}
	}

}