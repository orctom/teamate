var config = require('../config');
var api = require('../app/middlewares/API');
var db = require('monk')(config.mongodb.url);
var activity = db.get('activity');
var user = db.get('user');

createUserFromActivities = function() {
    activity.distinct('username', function(error, data) {
        console.log(data.length);
        var index = 0;
        for (var i in data) {
            api.profile(data[i], config.auth.token, function(error, profile) {
                if (profile) {
                    user.insert(profile);
                }
                console.log("i=" + index++);
            });
        };
        console.log('loop finished' + data.length);
    });
}

console.log('call...');
createUserFromActivities();