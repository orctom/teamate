var async = require('async');
var moment = require('moment');

exports.report = function(db) {
    return function(req, res) {
        var activity = db.get('activity');
        var change = db.get('change');

        var start = req.query.start;
        var end = req.query.end;

        console.log('param start: ' + start);
        console.log('param end  : ' + end);

        var startDate = new Date(moment().weekday(1));
        var endDate = new Date();

        console.log('1 start: ' + startDate);
        console.log('1 end  : ' + endDate);

        if (start) {
            startDate = new Date(moment(start));
            console.log('2 start: ' + startDate);
        }
        if (end) {
            endDate = new Date(moment(end));
            console.log('2 end  : ' + endDate);
        }
        var users = [
            'suo.lu', 'shengbin.cao', 'huawei.zhu',
            'bin.yang', 'jingcao.ma',
            'jia.yanju', 'patrick.wunier',
            'haili.lui', 'wei.wang', 'shuoshuo.zhang', 'lei.fang'
        ];
        console.log('start: ' + startDate);
        console.log('end  : ' + endDate);
        async.parallel({
            activities: function(callback) {
                activity.find({
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
            changes: function(callback) {
                change.find({
                    date: {
                        '$gte': startDate,
                        '$lt': endDate
                    },
                    author: {
                        $in: users
                    }
                }, {}, function(error, data) {
                    callback(null, data);
                });
            }
        }, function(err, results) {
            res.render('report', {
                changes: results.changes,
                activities: results.activities,
                start: moment(startDate).format('YYYY-MM-DD'),
                end: moment(endDate).format('YYYY-MM-DD')
            });
        });
    }
};

exports.reportData = function(db) {
    return function(req, res) {
        var activity = db.get('activity');
        var change = db.get('change');

        var start = req.query.start;
        var end = req.query.end;

        var startDate = new Date(moment().weekday(1));
        var endDate = new Date();

        if (start) {
            startDate = new Date(start);
        }
        if (end) {
            endDate = new Date(end);
        }
        var users = [
            'suo.lu', 'shengbin.cao', 'huawei.zhu',
            'bin.yang', 'jingcao.ma',
            'jia.yanju', 'patrick.wunier',
            'haili.lui', 'wei.wang', 'shuoshuo.zhang', 'lei.fang'
        ];
        console.log('start: ' + startDate);
        console.log('end  : ' + endDate);
        async.parallel({
            activities: function(callback) {
                activity.find({
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
            changes: function(callback) {
                change.find({
                    date: {
                        '$gte': startDate,
                        '$lt': endDate
                    },
                    author: {
                        $in: users
                    }
                }, {}, function(error, data) {
                    callback(null, data);
                });
            }
        }, function(err, results) {
            res.json(results);
        });
    }
};