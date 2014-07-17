exports.list = function(db) {
    return function(req, res) {
        var task = db.get('task');
        task.find({}, {}, function(error, data) {
            res.render('task/list', {
                "tasks": data
            });
        });
    }
};

exports.add = function(req, res) {
    res.render('task/add');
};

exports.edit = function(db) {
    return function(req, res) {
        var id = req.params.id;
        var task = db.get('task');
        task.findById(id, function(error, data) {
            res.render('task/edit', {
                "task": data
            });
        });
    }
};

exports.save = function(db) {
    return function(req, res) {
        var task = db.get('task');
        var id = req.body._id;
        var data = {
            content: req.body.content,
            tag: req.body.tag
        };
        if (id) {
            task.update({
                _id: id
            }, data, function(error, data) {
                res.redirect('/task');
            });
        } else {
            task.insert(data, function(error, data) {
                res.redirect('/task');
            });
        }
    }
};

exports.delete = function(db) {
    return function(req, res) {
        var task = db.get('task');
        var id = req.params.id;
        if (id) {
            task.remove({
                _id: id
            }, function(error, data) {
                res.redirect('/task');
            });
        } else {
            res.redirect('/task', {
                message: 'Invalid request, "_id" expected.'
            });
        }
    }
};

//============  category  ===============

exports.categories = function(db) {
    return function(req, res) {
        var categories = db.get('categories');
        categories.find({}, {}, function(error, data) {
            res.json(data);
        });
    };
};

exports.saveCategory = function(db) {
    return function(req, res) {
        var categories = db.get('categories');
        var id = req.body._id;
        var data = {
            name: req.body.name,
            color: req.body.color
        };
        console.log('save category: ' + JSON.stringify(data));
        if (id) {
            categories.update({
                _id: id
            }, data, function(error) {
                categories.find({}, {}, function(error, cats) {
                    res.json(cats);
                });
            });
        } else {
            categories.insert(data, function(error) {
                categories.find({}, {}, function(error, cats) {
                    res.json(cats);
                });
            });
        }
    }
};

exports.deleteCategory = function(db) {
    return function(req, res) {
        var categories = db.get('categories');
        var id = req.params.id;
        if (id) {
            categories.remove({
                _id: id
            }, function(error, data) {
                res.json({
                    success: true
                });
            });
        } else {
            res.json({
                success: false,
                message: 'Invalid request, "_id" expected.'
            });
        }
    }
};