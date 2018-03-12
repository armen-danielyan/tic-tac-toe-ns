var frameModule = require('ui/frame');

var goBack = function() {
    console.log("settings");
    frameModule.topmost().goBack();
};

exports.goBack = goBack;