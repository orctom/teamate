exports.list = function(db) {
    return function(req, res) {
        var collection = db.get('groups');
        collection.find({}, {}, function(e, data) {
            res.render('groups', {
                "groups": data
            });
        });
    };
};