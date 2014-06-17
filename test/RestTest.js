var api = require('../app/middlewares/API');

var username = 'hao.chen2';
var password = '123qweasd';
var token = "hao.chen2:275:6e923ac6c4fbc9038dcb62784aba30f9";

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

changes();