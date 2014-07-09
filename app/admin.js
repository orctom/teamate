exports.usersOfGroup = function(db) {
    return function(req, res) {
        var group = db.get('group');
        group.find({}, {}, function(error, data) {
            res.render('admin/group/users', {
                "users": data
            });
        });
    }
};

exports.groups = function(db) {
    return function(req, res) {
        var group = db.get('group');
        group.find({}, {}, function(error, data) {
            res.render('admin/groups', {
                "groups": data
            });
        });
    }
};