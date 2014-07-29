var api = require('./API');

var activityCron = '*/15 * * * *';
var changesCron = '*/30 * * * *';

module.exports = function(config, schedule, logger) {
    var db = require('monk')(config.mongodb.url);
    var activity = db.get('activity');
    var change = db.get('change');
    var user = db.get('user');

    if (config.scheduler.enabled) {
        schedule.scheduleJob('* * * * *', function() {
            console.log('The answer to life, the universe, and everything! ' + new Date());
        });

        schedule.scheduleJob(activityCron, function() {
            console.log('============= loading activities ============== ' + new Date());
            var count = 0;
            var lastActivityDate;
            activity.find({}, {
                limit: 1,
                sort: {
                    date: -1
                }
            }, function(error, lastActivities) {
                if (lastActivities && lastActivities[0]) {
                    lastActivityDate = lastActivities[0].date;
                }
                api.activities(config.auth.username, config.auth.password, function(error, data) {
                    console.log("-------------------------------------------- " + ++count);
                    console.log(data.date + " - " + data.username);
                    activity.find({
                        guid: data.guid
                    }, function(error, exists) {
                        if (!exists || exists.length < 1) {
                            activity.insert(data);
                            console.log("saved activity");
                        }
                    });

                    user.find({
                        username: data.username
                    }, function(error, exists) {
                        if (error) {
                            console.log("find user: " + error);
                        }
                        if (!exists || exists.length < 1) {
                            api.profile(data.username, config.auth.token, function(error, profile) {
                                if (profile) {
                                    user.insert(profile);
                                }
                            });
                        }
                    });
                }, new Date(lastActivityDate).getTime());
            });
        });

        schedule.scheduleJob(changesCron, function() {
            console.log('============= loading changesets ============== ' + new Date());
            var count = 0;
            var lastChangeDate;
            change.find({}, {
                limit: 1,
                sort: {
                    date: -1
                }
            }, function(error, lastChanges) {
                if (lastChanges && lastChanges[0]) {
                    lastChangeDate = lastChanges[0].date;
                }

                console.log("lastChangeDate: " + lastChangeDate);

                api.changeset(config.auth.token, function(error, csids) {
                    if (!error && csids) {
                        for (var i in csids) {
                            var csid = csids[i];
                            api.changes(csid, config.auth.token, function(error, data) {
                                console.log("---------------------- " + ++count);
                                console.log(data.date);
                                if (!error) {
                                    change.find({
                                        date: data.date
                                    }, function(error, exists) {
                                        if (!exists || exists.length < 1) {
                                            change.insert(data);
                                            console.log("saved changes");
                                        }
                                    });
                                }
                            });
                        }
                    }
                }, new Date(lastChangeDate));
            });
        });
    }
}