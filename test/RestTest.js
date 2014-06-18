var api = require('../app/middlewares/API');
var config = require('../config');

var username = config.auth.username;
var password = config.auth.password;
var token = config.auth.token;

function login() {
    api.login(username, password, function(error, data) {
        var token = data.token;
    });
}

function reviews() {
    api.reviews(token, function(error, data) {
        console.log('error ' + error);
        console.dir(data);
    });
}

function changes() {
    api.changeset(token, function(error, data) {
        console.log('error ' + error);
        var csids = data;
        for (var i in csids) {
            var csid = csids[i];
            api.changes(csid, token, function(error, data) {
                console.log('error ' + error);
                console.dir(data);
            });
        }
    });
}

function activities() {
    var count = 0;
    api.activities(username, password, function(error, data) {
        console.log('error ' + error);
        console.log("-------------------------------------------- " + ++count);
        console.log(data.date);
    });
}

activities();