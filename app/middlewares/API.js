var rest = require('restler');

exports.login = function(username, password, done) {
    rest.get('https://ecomsvn.officedepot.com/rest-service/auth-v1/login?userName=' + username + '&password=' + password).on('complete', function(data) {
        if (data instanceof Error) {
            done(data.message);
        } else {
            if (data.loginResult.token) {
                var token = data.loginResult.token[0];
                done(null, token);
            } else {
                done(data.loginResult.error);
            }
        }
    });
};