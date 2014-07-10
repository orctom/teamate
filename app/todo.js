exports.list = function(db) {
    return function(req, res) {
        var todo = db.get('todo');
        todo.find({}, {}, function(error, data) {
            console.dir(data);
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
        var id = req.query.id;
        var todo = db.get('todo');
        console.log('id = ' + id);
        todo.findById(id, function(error, data) {
            console.log('error =' + error);
            console.log('data  =' + data);
            console.dir(data);
            res.render('todo/edit', {
                "todo": data
            });
        });
    }
};

exports.save = function(db) {
    return function(req, res) {
        var todo = db.get('todo');
        var data = {
            _id: req.body._id,
            content: req.body.content,
            tag: req.body.tag
        };
        todo.insert(data, function(error, data) {
            res.redirect('/todo');
        });
    }
};