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

        schedule.scheduleJob('*/15 * * * *', loadActivities(config, db));

        // rest api is down
        //schedule.scheduleJob('*/30 * * * *', loadChanges(config, db));
        schedule.scheduleJob('0 0,3,6,12,15,18 * * *', loadChangesFromPage(config, db));
    }
};

var loadActivities = function(config, db) {
    console.log('============= loading activities ============== ' + new Date());
    var count = 0;
    var lastActivityDate = new Date();
    db.get('activity').find({}, {
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
            db.get('activity').find({
                guid: data.guid
            }, function(error, exists) {
                if (!exists || exists.length < 1) {
                    db.get('activity').insert(data);
                    console.log("saved activity");
                }
            });

            db.get('user').find({
                username: data.username
            }, function(error, exists) {
                if (error) {
                    console.log("find user: " + error);
                }
                if (!exists || exists.length < 1) {
                    api.profile(data.username, config.auth.token, function(error, profile) {
                        if (profile) {
                            db.get('user').insert(profile);
                        }
                    });
                } else { // remove duplicated users
                    for (var i = 1; i < exists.length; i++) {
                        db.get('user').remove({
                            _id: exists[i]._id
                        });
                    }
                }
            });
        }, lastActivityDate.getTime());
    });
};

var loadChanges = function(config, db) {
    console.log('============= loading changesets ============== ' + new Date());
    var count = 0;
    var lastChangeDate = new Date();
    db.get('change').find({}, {
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
                    loadByCsid(config, db, csid);
                }
            } else {
                console.log('No changeset found');
            }
        }, lastChangeDate);
    });
};

var loadByCsid = function(config, db, csid) {
    console.log('csid: ' + csid);
    api.changes(csid, config.auth.token, function(error, data) {
        console.log(data.author + ": " + data.comment);
        if (!error) {
            saveChangeIfNotExist(db, data);
        }
    });
};

var loadChangesFromPage = function(config, db) {
    console.log('============= parsing changes from page ============== ' + new Date());
    api.parseChangesFromPage(config.auth.username, function(err, datas) {
        db.get('user').find({
            flag: {
                $exists: false
            }
        }, function(error, users) {
            if (!error && users) {
                async.eachLimit(users, 5, function(item, callback) {
                    var username = item.username;
                    loadChangesFromPageOfUser(db, username, function() {
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

var loadChangesFromPageOfUser = function(db, username, callback) {
    api.parseChangesFromPage(username, function(error, datas) {
        if (404 == error) {
            console.log('Delete user no longer exists: ' + username);
            db.get('user').remove({
                username: username
            });
        } else if (datas) {
            for (var key in datas) {
                var data = datas[key];
                data.username = username;
                saveChangeIfNotExist(db, data);
            }
            callback();
        }
    });
};

var saveChangeIfNotExist = function(db, data) {
    db.get('change').find({
        date: data.date,
        username: data.username
    }, function(error, exists) {
        if (!exists || exists.length < 1) {
            db.get('change').insert(data);
            console.log("saved changes");
        }
    });
};