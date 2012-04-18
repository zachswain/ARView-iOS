var DataSets = {
	dataSets : [],
	
	load : function() {
        console.log("loading wikipedia");
		this.loadWikipedia();
	},
	
	loadWikipedia : function() {
		var set = new POISet({
			label : "Wikipedia",
			icon : "images/Wikipedia-logo.png"
		});
		
		Ext.Ajax.request({
			url : "http://api.geonames.org/findNearbyWikipediaJSON",
			params : {
				lat : PhoneGapEvents.getLocation().coords.latitude,
				lng : PhoneGapEvents.getLocation().coords.longitude,
				maxRows : 10,
				radius : 10,
                username : "zswain"
			},
			timeout : 3000,
			method : "GET",
			success : function(xhr) {
				console.log("got wikipedia response: " + xhr.responseText);
				var response = JSON.parse(xhr.responseText);
				
				if( response && response.geonames ) {
					for( var index=0 ; index<response.geonames.length ; index++ ) {
						var place = response.geonames[index];
						var poi = new POI({
							label : place.title,
							latitude : place.lat,
							longitude : place.lng,
							altitude : place.elevation
						});
						
						set.addPOI(poi, {
							icon : "images/Wikipedia-logo.png"
						});
					}
                         
                         		HUD.addPOISet(set);
				}			
			},
			error : function() {
				console.log("unable to load wikipedia entries");
			}
		});
	}
};