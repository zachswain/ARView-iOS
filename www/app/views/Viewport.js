app.views.Viewport = Ext.extend(Ext.Panel, {
	fullscreen : true,
	layout : "card",
	id : "viewport",
	cardSwitchAnimation : "slide",
                                monitorOrientation : true,
	
	initComponent : function(arguments) {
                                console.log("viewport");
		Ext.apply(app.views, {
			_main : new app.views.Main()
		});
		Ext.apply(this, {
			items : [
			     app.views._main
			]
		});
		
		app.views.Viewport.superclass.initComponent.apply(this, arguments);
	}
});