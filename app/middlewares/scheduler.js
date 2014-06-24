var api = require('./API');

var activityCron = '*/15 * * * *';
var changesCron = '*/30 * * * *';

module.exports = function(config, schedule) {
    var db = require('monk')(config.mongodb.url);
    var activities = db.get('activities');
    var changes = db.get('changes');

    schedule.scheduleJob('* * * * *', function() {
        console.log('The answer to life, the universe, and everything! ' + new Date());
    });

    schedule.scheduleJob(activityCron, function() {
        console.log('============= loading activities ============== ' + new Date());
        var count = 0;
        var lastActivityDate;
        activities.find({}, {
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
                activities.find({
                    guid: data.guid
                }, function(error, exists) {
                    if (!exists || exists.length < 1) {
                        activities.insert(data);
                        console.log("saved activity");
                    }
                });
            }, new Date(lastActivityDate).getTime());
        });
    });

    schedule.scheduleJob(changesCron, function() {
        console.log('============= loading changesets ============== ' + new Date());
        var count = 0;
        var lastChangeDate;
        changes.find({}, {
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
                        api.changes(csid, token, function(error, data) {
                            console.log("---------------------- " + ++count);
                            console.log(data.date);
                            if (!error) {
                                changes.find({
                                    date: data.date
                                }, function(error, exists) {
                                    if (!exists || exists.length < 1) {
                                        changes.insert(data);
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