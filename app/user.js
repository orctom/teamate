exports.users = function(db) {
    return function(req, res) {
        var user = db.get('user');
        user.find({}, {}, function(error, data) {
            res.render('user/users', {
                users: data
            });
        });
    }
};

exports.groups = function(db) {
    return function(req, res) {
        var group = db.get('group');
        group.find({}, {}, function(error, data) {
            res.render('user/groups', {
                users: data
            });
        });
    }
};