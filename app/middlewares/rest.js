var request = require('request');
var qs = require('qs');

exports.get = function(url, params, callback, auth) {
    call(url, 'GET', params, callback, auth);
};

exports.post = function(url, params, callback, auth) {
    call(url, 'POST', params, callback, auth);
};

exports.pipe = function(url, params, pipe, auth) {
    var options = getOptions(url, 'GET', params, auth);
    request(options).pipe(pipe);
};

function call(url, method, params, callback, auth) {
    var options = getOptions(url, method, params, auth);
    request(options, function(error, res, data) {
        callback(error, data);
    });
}

function getOptions(url, method, params, auth) {
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

    return options;
}