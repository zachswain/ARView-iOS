function OrientationPlugin() {
}

OrientationPlugin.prototype.getOrientation = function(win, fail, options) {
	return Cordova.exec(win, fail, "OrientationPlugin", "getOrientation", [ options ]);
};

Cordova.addConstructor(function() {
	Cordova.addPlugin("OrientationPlugin", new OrientationPlugin());
});