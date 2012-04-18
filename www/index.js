var app;
var $_userData = null;

app = Ext.regApplication({
                         name : "app",
                         
                         launch: function() {
                         console.log("before launch");
                         this.views.viewport = new this.views.Viewport();
                         console.log("launch");
                         },
                         
                         mask: function(message) {
                         if( this.loadingMask ) {
                         console.log("Loading mask already exists");
                         return;
                         }
                         if( !message ) message = "Loading...";
                         this.loadingMask = new Ext.LoadMask(Ext.getBody(), {
                                                             msg: message
                                                             });
                         this.loadingMask.show();
                         },
                         
                         unmask : function() {
                         if( this.loadingMask ) this.loadingMask.hide();
                         this.loadingMask = null;
                         }
                         });

function deviceReady() {
    
	PhoneGapEvents.init({
		monitorOrientationDelay : 500,
		monitorCompass : true
		//monitorCompassDelay : 50
	});
	
	PhoneGapEvents.onMenuButton = function() {
	}
}

function change(e){
               alert("change");
               console.log(window.orientation);
             }