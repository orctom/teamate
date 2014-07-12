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

exports.edit = function(db) {
    return function(req, res) {
        var id = req.params.id;
        var todo = db.get('todo');
        todo.findById(id, function(error, data) {
            res.render('todo/edit', {
                "todo": data
            });
        });
    }
};

exports.save = function(db) {
    return function(req, res) {
        var todo = db.get('todo');
        var id = req.body._id;
        var data = {
            content: req.body.content,
            tag: req.body.tag
        };
        if (id) {
            todo.update({
                _id: id
            }, data, function(error, data) {
                res.redirect('/todo');
            });
        } else {
            todo.insert(data, function(error, data) {
                res.redirect('/todo');
            });
        }
    }
};

exports.delete = function(db) {
    return function(req, res) {
        var todo = db.get('todo');
        var id = req.params.id;
        if (id) {
            todo.remove({
                _id: id
            }, function(error, data) {
                res.redirect('/todo');
            });
        } else {
            res.redirect('/todo', {
                message: 'Invalid request, "_id" expected.'
            });
        }
    }
};