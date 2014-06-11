var rest = require('restler');

exports.login = function(username, password, done) {
    rest.get('https://ecomsvn.officedepot.com/rest-service/auth-v1/login?userName=' + username + '&password=' + password).on('complete', function(data) {
        if (data instanceof Error) {
            done(data);
        } else {
            if (data.loginResult.token) {
                var token = data.loginResult.token[0];
                exports.profile(username, token, function(error, data) {
                    if (error) {
                        return done(error);
                    } else {
                        var user = data;
                        user.username = username;
                        user.token = token;
                        return done(null, user);
                    }
                });
            } else {
                done(new Error(data.loginResult.error));
            }
        }
    });
};

exports.profile = function(username, token, done) {
    var url = 'https://ecomsvn.officedepot.com/rest-service/users-v1/' + username + "?FEAUTH=" + token;
    rest.get(url).on('complete', function(data) {
        if (data instanceof Error) {
            done(data);
        } else {
            if (data.restUserProfileData.userData) {
                var userData = data.restUserProfileData.userData[0];
                var avatar = String(userData.avatarUrl);
                var questionMarkIndex = avatar.indexOf("?");
                if (questionMarkIndex > 0) {
                    avatar = avatar.substring(0, questionMarkIndex);
                }
                var name = userData.displayName;
                var user = {
                    'avatar': avatar,
                    'name': name
                };
                done(null, user);
            } else {
                done(new Error(data.error));
            }
        }
    });
};