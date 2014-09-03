exports.users = function(db) {
    return function(req, res) {
        var notGrouped = "not-grouped";
        db.get('user').find({
            flag: {
                $exists: false
            }
        }, {
            sort: {
                username: 1
            }
        }, function(error, users) {
            db.get('team').find({}, {
                sort: {
                    name: 1
                }
            }, function(error, teams) {
                var teamData = {};
                var userData = [];
                for (var i in teams) {
                    var teamEntity = teams[i];
                    teamEntity.users = [];
                    teamData[teamEntity._id] = teamEntity;
                }
                for (var j in users) {
                    var userEntity = users[j];
                    var teamId = userEntity.teamId;
                    if (teamId && teamData[teamId]) {
                        teamData[teamId].users.push(userEntity);
                    } else {
                        userData.push(userEntity);
                    }
                }
                res.render('users', {
                    teams: teamData,
                    users: userData
                });
            });
        });
    };
};

exports.teams = function(db) {
    return function(req, res) {
        db.get('team').find({}, {}, function(error, data) {
            res.json(data);
        });
    };
};

exports.updateTeamOfUser = function(db) {
    return function(req, res) {
        var userId = req.body.userId;
        var teamId = req.body.teamId;
        db.get('user').update({
            _id: userId
        }, {
            $set: {
                teamId: teamId
            }
        }, function(data) {
            res.json({
                sucess: true
            });
        });
    };
};

exports.saveTeam = function(db) {
    return function(req, res) {
        var id = req.body._id;
        var name = req.body.team;
        var data = {
            name: name
        };
        if (id) {
            db.get('team').update({
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
            db.get('team').insert(data, function(error, data) {
                console.log('data: ' + JSON.stringify(data));
                res.json(data);
            });
        }
    };
};

exports.deleteTeam = function(db) {
    return function(req, res) {
        var id = req.params.id;
        if (id) {
            db.get('team').remove({
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
        var teamId = req.params.id;
        db.get('user').find({
            teamId: teamId
        }, {}, function(error, data) {
            res.json(data);
        });
    };
};