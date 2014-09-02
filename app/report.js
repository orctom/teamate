var async = require('async');
var moment = require('moment');

exports.report = function(db) {
    return function(req, res) {
        var start = req.query.start;
        var end = req.query.end;

        var users = [
            'suo.lu', 'shengbin.cao', 'huawei.zhu',
            'bin.yang', 'jingcao.ma',
            'jia.yanju', 'patrick.wunier',
            'haili.lui', 'wei.wang', 'shuoshuo.zhang', 'lei.fang'
        ];
        getData(db, start, end, users, function(data) {
            res.render('report', data);
        });
    };
};

exports.reportData = function(db) {
    return function(req, res) {
        var start = req.query.start;
        var end = req.query.end;

        var users = [
            'suo.lu', 'shengbin.cao', 'huawei.zhu',
            'bin.yang', 'jingcao.ma',
            'jia.yanju', 'patrick.wunier',
            'haili.lui', 'wei.wang', 'shuoshuo.zhang', 'lei.fang'
        ];
        getData(db, start, end, users, function(data) {
            res.json(data);
        });
    };
};

var getData = function(db, start, end, users, done) {
    var activity = db.get('activity');
    var change = db.get('change');
    var user = db.get('user');
    var team = db.get('team');

    var startDate = start ? new Date(moment(start)) : new Date(moment().weekday(1));
    var endDate = end ? new Date(moment(end)) : new Date();

    console.log('Querying report: [' + startDate + ' - ' + endDate + ']');

    async.parallel({
        activities: function(callback) {
            activity.find({
                date: {
                    '$gte': startDate,
                    '$lt': endDate
                },
                username: {
                    $in: users
                },
                categories: 'commit'
            }, {}, function(error, data) {
                callback(null, data);
            });
        },
        changes: function(callback) {
            change.find({
                date: {
                    '$gte': startDate,
                    '$lt': endDate
                },
                username: {
                    $in: users
                }
            }, {}, function(error, data) {
                callback(null, data);
            });
        },
        users: function(callback) {
            user.find({
                username: {
                    $in: users
                }
            }, function(error, data) {
                console.log('================================');
                console.dir(data);
                if (error) {
                    console.log('users error ' + error);
                    callback(error);
                }
                var teams = {};
                var teamIds = [];
                for (var key in data) {
                    var _user = data[key];
                    teams[_user.teamId] = _user;
                    teamIds.push(_user.teamId);
                }
                team.find({
                    _id: {
                        $in: teamIds
                    }
                }, function(error, data) {
                    if (error) {
                        callback(error);
                    }
                    for (var key in data) {
                        var _team = data[key];
                        teams[_team._id].teamName = _team.name;
                    }
                    callback(null, teams);
                });
            });
        }
    }, function(err, results) {
        done({
            changes: results.changes,
            activities: results.activities,
            users: results.users,
            start: moment(startDate).format('YYYY-MM-DD'),
            end: moment(endDate).format('YYYY-MM-DD')
        });
    });
};