function UserDataPlugin() {
}

UserDataPlugin.prototype.getUserData = function(win, fail) {
	return Cordova.exec(win, fail, "UserDataPlugin", "getUserData", [ ]);
};

Cordova.addConstructor(function() {
	Cordova.addPlugin("UserDataPlugin", new UserDataPlugin());
});