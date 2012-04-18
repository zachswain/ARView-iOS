app.views.Main = Ext.extend(Ext.Panel, {
	layout : {
		type: "vbox",
		align: "stretch"
	},
	id : "main",
	fullscreen : true,
	style : {
		background : "transparent"
	},
	
	initComponent : function() {
		toolbar = new app.views.ToolbarPanel();
		Ext.apply(this, {
			items : [ 
			     new app.views.CompassPanel(),
			     new app.views.MainOverlayPanel(),
			     toolbar
			]
		});
		
		app.views.Main.superclass.initComponent.apply(this, arguments);
	}
});