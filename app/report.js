var async = require('async');
var moment = require('moment');

var users = [
    'suo.lu', 'shengbin.cao', 'bin.yang', 'jingcao.ma',
    'jia.yanju', 'patrick.wunier',
    'haili.lui', 'shuoshuo.zhang', 'lei.fang', 'fei.xue',
    'lefeng.chen', 'zhongzheng.liu', 'huawei.zhu',
    'luilu.jiao', 'wayne.qin', 'weiping.he', 'wenshuai.shi',
    'bin.wang', 'chen.yang', 'chunnan.ji', 'nianjun.sun',
];

exports.report = function(db) {
    return function(req, res) {
        var start = req.query.start;
        var end = req.query.end;

        getData(db, start, end, users, function(data) {
            res.render('report', data);
        });
    };
};

exports.reportData = function(db) {
    return function(req, res) {
        var start = req.query.start;
        var end = req.query.end;

        getData(db, start, end, users, function(data) {
            res.json(data);
        });
    };
};

var getData = function(db, start, end, users, done) {
    var startDate = start ? new Date(moment(start)) : new Date(moment().weekday(0));
    var endDate = end ? new Date(moment(end)) : new Date();

    console.log('Querying report: [' + startDate + ' - ' + endDate + ']');

    async.parallel({
        changes: function(callback) {
            db.get('change').find({
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
            db.get('user').find({
                username: {
                    $in: users
                }
            }, function(error, users) {
                if (error) {
                    callback(error);
                }
                callback(null, users);
            });
        },
        teams: function(callback) {
            db.get('team').find({}, function(error, teams) {
                if (error) {
                    callback(error);
                }
                callback(null, teams);
            });
        }
    }, function(err, results) {
        var teams = {};
        results.teams.map(function(team) {
            teams[team._id] = team;
            teams[team._id].users = [];
        });

        var users = {};
        results.users.map(function(user) {
            users[user.username] = user;
            users[user.username].jiras = {};
        });

        results.changes.map(function(change) {
            if (users[change.username]) {
                var jira = change.jira;
                if (null === jira || 'null' == jira) {
                    jira = '[NON-JIRA]';
                }
                if (!users[change.username].jiras[jira]) {
                    users[change.username].jiras[jira] = [];
                }
                users[change.username].jiras[jira].push(change);
            }
        });

        for (var i in users) {
            var user = users[i];
            if (user.teamId && teams[user.teamId]) {
                teams[user.teamId].users.push(user);
            }
        }
        done({
            data: teams,
            start: moment(startDate).format('YYYY-MM-DD'),
            end: moment(endDate).format('YYYY-MM-DD')
        });
    });
};