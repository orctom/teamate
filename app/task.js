exports.list = function(db) {
    return function(req, res) {
        db.get('task').find({}, {}, function(error, data) {
            res.render('task/list', {
                "tasks": data
            });
        });
    };
};

exports.add = function(req, res) {
    res.render('task/add');
};

exports.edit = function(db) {
    return function(req, res) {
        var id = req.params.id;
        db.get('task').findById(id, function(error, data) {
            res.render('task/edit', {
                "task": data
            });
        });
    };
};

exports.save = function(db) {
    return function(req, res) {
        var id = req.body._id;
        var data = {
            content: req.body.content,
            tag: req.body.tag
        };
        if (id) {
            db.get('task').update({
                _id: id
            }, data, function(error, data) {
                res.redirect('/task');
            });
        } else {
            db.get('task').insert(data, function(error, data) {
                res.redirect('/task');
            });
        }
    };
};

exports.delete = function(db) {
    return function(req, res) {
        var id = req.params.id;
        if (id) {
            db.get('task').remove({
                _id: id
            }, function(error, data) {
                res.redirect('/task');
            });
        } else {
            res.redirect('/task', {
                message: 'Invalid request, "_id" expected.'
            });
        }
    };
};

//============  category  ===============

exports.categories = function(db) {
    return function(req, res) {
        db.get('category').find({}, {}, function(error, data) {
            res.json(toMap(data));
        });
    };
};

exports.saveCategory = function(db) {
    return function(req, res) {
        var id = req.body._id;
        var data = {
            name: req.body.name,
            color: req.body.color
        };
        console.log('save category: ' + JSON.stringify(data));
        if (id) {
            db.get('category').update({
                _id: id
            }, data, function(error) {
                db.get('category').find({}, {}, function(error, cats) {
                    res.json(toMap(cats));
                });
            });
        } else {
            db.get('category').insert(data, function(error) {
                db.get('category').find({}, {}, function(error, cats) {
                    res.json(toMap(cats));
                });
            });
        }
    };
};

exports.deleteCategory = function(db) {
    return function(req, res) {
        var id = req.params.id;
        if (id) {
            db.get('category').remove({
                _id: id
            }, function(error, data) {
                db.get('category').find({}, {}, function(error, cats) {
                    res.json(toMap(cats));
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

var toMap = function(categories) {
    var data = {};
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        data[category.name] = category;
    }
    return data;
};