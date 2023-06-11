'use strict'

var fs = require('fs');
var Conf = require('../conf');

function Utils() {}

Utils.getCurrentTime = function() {
    return Math.floor(new Date().getTime() / 1000);
};

Utils.arrayToJSON = function(v) {
    var r = [];
    for (var i = 0; i < v.length; i++) {
        r.push(v[i].toJSON());
    }
    return r;
};

Utils.write = function(message) {
    var rightNow = new Date();
    var res = rightNow.toISOString().slice(0,10).replace(/-/g,"");
    var filename = Conf.logpath + "/app." + res + ".log";
    fs.exists(filename, function (exists) {
        if(!exists) {
            fs.open(filename, "w");
        }
        fs.appendFile(filename, message + "\n", function (err) {
            if (err) {
                return console.info(err);
            }
        })
    });

    return this;
};

exports = module.exports = Utils;