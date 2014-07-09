exports.list = function(db) {
    return function(req, res) {
        var todo = db.get('todo');
        todo.find({}, {}, function(error, data) {
            res.render('todo/list', {
                "todos": data
            });
        });
    }
};

exports.add = function(req, res) {
    res.render('todo/add');
};

exports.save = function(db) {
    return function(req, res) {
        var todo = db.get('todo');
        var data = {
            id: req.body.id,
            content: req.body.content,
            tag: req.body.tag
        };
        todo.save(data, function(error, data) {
            res.redirect('/todo');
        });
    }
};