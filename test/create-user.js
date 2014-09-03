var config = require('../config');
var async = require('async');
var api = require('../app/middlewares/API');
var db = require('monk')(config.mongodb.url);
var activity = db.get('activity');
var user = db.get('user');

createUserFromActivities = function() {
    activity.distinct('username', function(error, datas) {
        console.log(datas.length);
        var index = 0;
        async.each(datas, function(username, callback) {
            addUserIfNotExists(username, function() {
                callback();
            });
        }, function(err) {
            if (err) {
                console.log('[ERROR] failed: ' + error);
            }
            console.log('exiting');
            process.exit(code = 0);
        });
    });
};

var addUserIfNotExists = function(username, done) {
    user.find({
        username: username
    }, function(error, exists) {
        if (error) {
            console.log("find user: " + error);
        }
        console.log(username + ', exists.length = ' + exists.length);
        if (!exists || exists.length < 1) {
            console.log('reading profile: ' + username);
            api.profile(username, config.auth.token, function(error, profile) {
                console.log('======================');
                if ('[NOT-JIRA-USER]' == error) {
                    user.insert({
                        username: username,
                        flag: 'not-jira-user'
                    });
                    console.log('inserted non-jira-user ' + username);
                } else if (profile) {
                    user.insert(profile);
                    console.log('inserted' + username);
                }
                done();
            });
        } else { // remove duplicated users
            for (var i = 1; i < exists.length; i++) {
                user.remove({
                    _id: exists[i]._id
                });
                console.log('Removed duplicated: ' + exists[i].username);
            }
            done();
        }
    });
};

console.log('call...');
createUserFromActivities();