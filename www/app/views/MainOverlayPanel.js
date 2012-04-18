app.views.MainOverlayPanel = Ext.extend(Ext.Panel, {
	xtype : "container",
	id : "mainOverlay",
	flex : 16,
	style : {
		background : "transparent"
	},
	html : "<canvas id='hud'></canvas><div id='overlay0-180' class='overlay'></div><div id='overlay180-360' class='overlay'></div>",
	styleHtmlContent : false,
	
	dockedItems : [
	     {
	    	 id : "poiInformationPanel",
	    	 xtype : "container",
	    	 dock : "bottom",
	    	 tpl : [
	    	      "<div id='distanceContainer'>",
	    	      "<div class='distance'>{distance}{units}</div>",
	    	      "</div>",
	    	      "<div id='informationContainer'>",
	    	      "<div id='poiInformationLabel'>{label}</div>",
	    	      "<div id='poiInformationDescription'>{description}</div>",
	    	      "</div>"
	    	 ],
	         listeners : {
	        	 afterrender : function() {
	        		this.el.on("click", function() {
	        			Ext.getCmp("poiInformationPanel").setVisible(false);
	        		});
	        	 }
	         }
	     }
	],
	
	listeners : {
		afterLayout : function() {
			if( !HUD.initialized ) {
				var width = Ext.get("mainOverlay").getWidth();
				var height = Ext.get("mainOverlay").getHeight();
				
				var radius = width > height ? height / 10 : width / 10;
					
				HUD.init({
					canvasId : "hud",
					containerId : "mainOverlay",
					radius : Math.floor(radius)
				});
				
				app.mask("Waiting for geolocation...");
				
				var geolocationIntervalId = setInterval(function() {
					if( PhoneGapEvents.getLocation() ) {
						app.unmask();
						clearInterval(geolocationIntervalId);
						DataSets.load();
					} else {
					}
				}, 250);
				
//				PhoneGapEvents.onOrientationChange(function() {
//					HUD.onOrientationChange();
//				});
                                        
                PhoneGapEvents.onCompassChange(function(heading) {
                   HUD.onCompassChange(heading);
               });
				
				PhoneGapEvents.onGeolocationChange(function() {
					HUD.onLocationChange();
				});
				
				Ext.get("hud").setXY([10, 30]);
		    	
		    	Ext.getCmp("poiInformationPanel").setVisible(false);
			}
		}
	},

	initComponent : function() {		
		app.views.MainOverlayPanel.superclass.initComponent.apply(this, arguments);
	}
});