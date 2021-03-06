var api = require('../app/middlewares/API');
var config = require('../config');

var db = require('monk')(config.mongodb.url);
var changes = db.get('changes');
var activities = db.get('activities');

var username = config.auth.username;
var password = config.auth.password;
var token = config.auth.token;

function login() {
    api.login(username, password, function(error, data) {
        var token = data.token;
    });
}

function reviews() {
    api.reviews(token, function(error, data) {
        console.log('error ' + error);
        console.dir(data);
    });
}

function testChanges() {
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

        api.changeset(token, function(error, csids) {
            if (!error && csids) {
                for (var i in csids) {
                    var csid = csids[i];
                    api.changes(csid, token, function(error, data) {
                        console.log("---------------------- " + (++count));
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
}

function testActivities() {
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
            console.log("-------------------------------------------- " + (++count));
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
}

function unwatchFinishedJIRAs() {
    api.unwatchFinishedJIRAs(username, password);
}

function testUnwtch() {
    api.unwatch('WWWCU-31527', username, password);
}

function testParseChangesFromPage() {
    api.parseChangesFromPage(username, password);
}

function testFormLogin() {
    api.formLogin(username, password);
}

//unwatchFinishedJIRAs();
//testUnwtch();
testParseChangesFromPage();
//testFormLogin();