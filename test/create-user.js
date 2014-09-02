var config = require('../config');
var api = require('../app/middlewares/API');
var db = require('monk')(config.mongodb.url);
var activity = db.get('activity');
var user = db.get('user');

createUserFromActivities = function() {
    activity.distinct('username', function(error, datas) {
        console.log(datas.length);
        var index = 0;
        for (var i in datas) {
            var username = datas[i];
            user.find({
                username: username
            }, function(error, exists) {
                if (error) {
                    console.log("find user: " + error);
                }
                console.log('exists.length = ' + exists.length);
                if (!exists || exists.length < 1) {
                    api.profile(username, config.auth.token, function(error, profile) {
                        if (profile) {
                            user.insert(profile);
                        }
                    });
                } else { // remove duplicated users
                    for (var i = 1; i < exists.length; i++) {
                        user.remove({
                            _id: exists[i]._id
                        });
                        console.log('Removed duplicated: ' + exists[i].username);
                    }
                }
            });
        }
        console.log('loop finished' + datas.length);
    });
};

console.log('call...');
createUserFromActivities();