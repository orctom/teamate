exports.dashboard = function(db) {
    return function(req, res) {
        var teamId = req.params.teamId;
        if (teamId) {
            db.get('user').find({
                teamId: teamId
            }, {}, function(error, users) {
                res.render('activity/dashboard', {
                    users: users
                });
            });
        } else {
            db.get('user').find({}, {}, function(error, users) {
                res.render('activity/dashboard', {
                    users: users
                });
            });
        }
    };
};

exports.events = function(db) {
    return function(req, res) {
        var start = req.query.start;
        var end = req.query.end;
        db.get('activity').find({
            date: {
                '$gte': new Date(start),
                '$lt': new Date(end)
            },
            username: req.params.username
        }, {}, function(error, data) {
            var result = [];
            for (var i in data) {
                var item = data[i];
                result.push({
                    start: item.date,
                    end: new Date(item.date.getTime() + 1800000),
                    title: item.title,
                    desc: item.link + "<br/>" + item.categories
                });
            }
            res.json(result);
        });
    };
};

exports.changes = function(db) {
    return function(req, res) {
        var start = req.query.start;
        var end = req.query.end;
        db.get('change').find({
            date: {
                '$gte': new Date(start).getTime(),
                '$lt': new Date(end).getTime()
            },
            author: req.params.username
        }, {}, function(error, data) {
            var result = [];
            for (var i in data) {
                var item = data[i];
                result.push({
                    start: new Date(item.date),
                    end: new Date(item.date + 1800000),
                    jira: item.jira,
                    title: item.comment,
                    desc: item.fileset
                });
            }
            res.json(result);
        });
    };
};