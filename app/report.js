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
    }
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
    }
};

var getData = function(db, start, end, users, done) {
    var activity = db.get('activity');
    var change = db.get('change');

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
                    '$gte': startDate.getTime(),
                    '$lt': endDate.getTime()
                },
                author: {
                    $in: users
                }
            }, {}, function(error, data) {
                callback(null, data);
            });
        }
    }, function(err, results) {
        done({
            changes: results.changes,
            activities: results.activities,
            start: moment(startDate).format('YYYY-MM-DD'),
            end: moment(endDate).format('YYYY-MM-DD')
        });
    });
};