exports.dashboard = function(db) {
    return function(req, res) {
        res.render('calendar/dashboard');
    };
};

exports.events = function(db) {
    return function(req, res) {
        var event = db.get('event');
        var start = req.query.start;
        var end = req.query.end;
        var startDate = getDate(start);
        var endDate = getDate(end);
        event.find({
            startDate: {
                '$lt': endDate
            },
            endDate: {
                '$gte': startDate
            },
            user: req.user.username
        }, {}, function(error, data) {
            res.json(data);
        });
    };
};

exports.update = function(db) {
    return function(req, res) {
        if (!req.user.isManager && req.user.username != req.body.user) {
            res.json({
                success: false,
                message: 'not permited!'
            });
        }
        var event = db.get('event');
        var id = req.body._id;
        var data = {
            id: req.body.id,
            start: req.body.start,
            end: req.body.end,
            title: req.body.title,
            desc: req.body.desc,
            jira: req.body.jira,
            color: req.body.color,
            textColor: req.body.textColor,
            category: req.body.category,
            user: req.body.user
        };

        // set user to current user if user is not set
        if (!data.user) {
            data.user = req.user.username;
        }

        data.startDate = getDate(data.start);
        data.endDate = data.end ? getDate(data.end) : getDate(data.startDate.getTime() + 86400000);
        if (id) {
            event.update({
                _id: id
            }, data, function(error, doc) {
                res.json({
                    success: true
                });
            });
        } else {
            event.insert(data, function(error, doc) {
                res.json(doc);
            });
        }
    };
};

exports.deleteEvent = function(db) {
    return function(req, res) {
        var event = db.get('event');
        var id = req.params.id;
        if (id) {
            event.remove({
                _id: id
            }, function(error, data) {
                res.json({
                    success: true
                });
            });
        } else {
            res.json({
                success: false,
                message: 'Invalid request, "_id" expected.'
            });
        }
    };
};

getDate = function(date) {
    return new Date(date);
};