var api = require('./API');
var async = require('async');

module.exports = function(config, schedule, logger) {
    var db = require('monk')(config.mongodb.url);
    var activity = db.get('activity');
    var change = db.get('change');
    var user = db.get('user');

    if (config.scheduler.enabled) {
        schedule.scheduleJob('* * * * *', function() {
            console.log('The answer to life, the universe, and everything! ' + new Date());
        });

        schedule.scheduleJob('*/15 * * * *', loadActivities(config, activity));

        // rest api is down
        //schedule.scheduleJob('*/30 * * * *', loadChanges(config, change));
        schedule.scheduleJob('0 0,3,6,12,15,18 * * *', loadChangesFromPage(config, user, change));
    }
};

var loadActivities = function(config, activity) {
    console.log('============= loading activities ============== ' + new Date());
    var count = 0;
    var lastActivityDate = new Date();
    activity.find({}, {
        limit: 1,
        sort: {
            date: -1
        }
    }, function(error, lastActivities) {
        if (lastActivities && lastActivities[0]) {
            lastActivityDate = new Date(lastActivities[0].date);
        }
        api.activities(config.auth.username, config.auth.password, function(error, data) {
            console.log("-------------------------------------------- " + (++count));
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
                } else { // remove duplicated users
                    for (var i = 1; i < exists.length; i++) {
                        user.remove({
                            _id: exists[i]._id
                        });
                    }
                }
            });
        }, lastActivityDate.getTime());
    });
};

var loadChanges = function(config, change) {
    console.log('============= loading changesets ============== ' + new Date());
    var count = 0;
    var lastChangeDate = new Date();
    change.find({}, {
        limit: 1,
        sort: {
            date: -1
        }
    }, function(error, lastChanges) {
        if (lastChanges && lastChanges[0]) {
            lastChangeDate = new Date(lastChanges[0].date);
        }
        api.changeset(config.auth.token, function(error, csids) {
            if (error) {
                console.log('[ERROR]: ' + error);
            } else if (csids) {
                for (var i in csids) {
                    var csid = csids[i];
                    loadByCsid(config, change, csid);
                }
            } else {
                console.log('No changeset found');
            }
        }, lastChangeDate);
    });
};

var loadByCsid = function(config, change, csid) {
    console.log('csid: ' + csid);
    api.changes(csid, config.auth.token, function(error, data) {
        console.log(data.author + ": " + data.comment);
        if (!error) {
            saveChangeIfNotExist(change, data);
        }
    });
};

var loadChangesFromPage = function(config, user, change) {
    console.log('============= parsing changes from page ============== ' + new Date());
    api.parseChangesFromPage(config.auth.username, function(err, datas) {
        user.find({
            flag: {
                $exists: false
            }
        }, function(error, users) {
            if (!error && users) {
                async.eachLimit(users, 5, function(item, callback) {
                    var username = item.username;
                    loadChangesFromPageOfUser(user, change, username, function() {
                        callback();
                    });
                }, function(err) {
                    if (err) {
                        console.log('[ERROR] loadChangesFromPage: ' + err);
                    } else {
                        console.log('[FINISHED] loadChangesFromPage');
                    }
                });
            }
        });
    });
};

var loadChangesFromPageOfUser = function(user, change, username, callback) {
    api.parseChangesFromPage(username, function(error, datas) {
        if (404 == error) {
            console.log('Delete user no longer exists: ' + username);
            user.remove({
                username: username
            });
        } else if (datas) {
            for (var key in datas) {
                var data = datas[key];
                data.username = username;
                saveChangeIfNotExist(change, data);
            }
            callback();
        }
    });
};

var saveChangeIfNotExist = function(change, data) {
    change.find({
        date: data.date,
        username: data.username
    }, function(error, exists) {
        if (!exists || exists.length < 1) {
            change.insert(data);
            console.log("saved changes");
        }
    });
};