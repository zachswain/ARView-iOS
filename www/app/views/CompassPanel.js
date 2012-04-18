var listenerInitialized = false;

app.views.CompassPanel = Ext.extend(Ext.Panel, {
	id : "compassPanel",
	xtype : "panel",
	height: "20px",
	cls : "compassPanel",
	html : "<div id='compass'><div id='heading'></div><div id='pointerContainer'><div id='pointer'></div></div></div>",
	
	initComponent : function() {
		app.views.CompassPanel.superclass.initComponent.apply(this, arguments);
	},
	
	listeners : {
		afterRender : function() {
//			PhoneGapEvents.onOrientationChange(function(orientation) {
            PhoneGapEvents.onCompassChange(function(heading) {                                            
				Ext.get("compass").addCls("easeInOut");
//				var newHeading = orientation.x;
               var newHeading = heading.magneticHeading;
				var oldOffset = parseInt(Ext.get("compass").dom.style.backgroundPosition);
				var width = parseInt(Ext.get("compassPanel").getWidth());
				document.getElementById("heading").innerHTML = Math.floor(newHeading) + "&deg;";
				var oldHeading = Math.floor(oldOffset + 10 - Math.floor(width / 2))/-2;
				if( (oldHeading > 350 && newHeading >=0 && newHeading < 10) || (oldHeading >= 0 && oldHeading < 10 && newHeading > 350) ) {
					Ext.get("compass").removeCls("easeInOut");
				}
				Ext.get("compass").dom.style.backgroundPosition = (Math.floor(width / 2) - 10 - Math.floor(newHeading)*2) + "px bottom";
			});
		}	
	}	
});