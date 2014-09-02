exports.users = function(db) {
    return function(req, res) {
        var user = db.get('user');
        var team = db.get('team');
        var notGrouped = "not-grouped";
        user.find({}, {
            sort: {
                username: 1
            }
        }, function(error, users) {
            team.find({}, {
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
                res.render('user/users', {
                    teams: teamData,
                    users: userData
                });
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

exports.updateTeamOfUser = function(db) {
    return function(req, res) {
        var user = db.get('user');
        var userId = req.body.userId;
        var teamId = req.body.teamId;
        user.update({
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
        var user = db.get('user');
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
            user.findAndModify({
                teamId: id
            }, {
                $unset: teamId
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
        var user = db.get('user');
        var teamId = req.params.id;
        user.find({
            teamId: teamId
        }, {}, function(error, data) {
            res.json(data);
        });
    };
};