var request = require('request');

exports.get = function(url, params, username, password, done) {
    var options = {
        url: url,
        auth: {
            user: username,
            password: password
        }
    };

};

function consume(options, function(err, res, body) {
    if (err) {
        console.dir(err);
        return;
    }
    console.dir('header', res.header);
    console.dir('status code', res.statusCode);
    console.dir(body);
});