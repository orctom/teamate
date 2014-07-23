var config = require('./index');
var LocalStrategy = require('passport-local').Strategy;
var API = require('../app/middlewares/API');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use(new LocalStrategy(
        function(username, password, done) {
            process.nextTick(function() {
                API.login(username, password, function(error, user) {
                    if (error) {
                        console.log('passport return message: ' + error);
                        console.log('passport return user   : ' + user);
                        return done(null, false, error);
                    } else {
                        if (config.managers[username]) {
                            user.isManager = true;
                        }
                        return done(null, user);
                    }
                });
            })
        }
    ))
};