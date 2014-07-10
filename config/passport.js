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
                        console.log('return message: ' + error)
                        return done(null, false, error);
                    } else {
                        return done(null, user);
                    }
                });
            })
        }
    ))
};