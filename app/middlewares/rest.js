var request = require('request');
var qs = require('qs');

exports.get = function(url, params, callback, auth) {
    call(url, 'GET', params, callback, auth);
};

exports.post = function(url, params, callback, auth) {
    call(url, 'POST', params, callback, auth);
};

function call(url, method, params, callback, auth) {
    if (params) {
        var queryStr = qs.stringify(params);
        if (url.indexOf("?") > 0) {
            url += "&" + queryStr;
        } else {
            url += "?" + queryStr;
        }
    }

    var options = {
        url: url,
        method: method,
        json: true,
        jar: true
    };

    if (auth) {
        options.auth = auth;
    }

    request(options, function(error, res, data) {
        console.log("====== rest call start ======");
        console.log("url : " + url);
        console.log("data: " + JSON.stringify(data));
        console.log("====== rest call end   ======");
        callback(error, data);
    });
}