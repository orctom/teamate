exports.users = function(db) {
    return function(req, res) {
        var user = db.get('user');
        user.find({}, {}, function(error, data) {
            res.render('user/users', {
                users: data
            });
        });
    };
};

exports.teams = function(db) {
    return function(req, res) {
        var team = db.get('team');
        team.find({}, {}, function(error, data) {
            res.json(data);
        });
    };
};

exports.saveTeam = function(db) {
    return function(req, res) {
        var team = db.get('team');
        var id = req.body._id;
        var name = req.body.team;
        var data = {
            name: name
        };
        if (id) {
            team.update({
                _id: id
            }, data, function(error, data) {
                console.log('data: ' + JSON.stringify(data));
                res.json({
                    _id: id,
                    name: name,
                    update: true
                });
            });
        } else {
            team.insert(data, function(error, data) {
                console.log('data: ' + JSON.stringify(data));
                res.json(data);
            });
        }
    };
};

exports.deleteTeam = function(db) {
    return function(req, res) {
        var team = db.get('team');
        var id = req.params.id;
        if (id) {
            team.remove({
                _id: id
            }, function(error, data) {
                console.log('data: ' + JSON.stringify(data));
                res.json({
                    _id: id
                });
            });
        } else {
            res.json({
                message: 'Invalid request, "_id" expected.'
            });
        }
    };
};

exports.usersOfTeam = function(db) {
    return function(req, res) {
        var team = db.get('team');
        team.find({}, {}, function(error, data) {
            res.render('team/users', {
                "users": data
            });
        });
    };
};