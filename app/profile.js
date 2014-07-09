var API = require('./middlewares/API');

exports.login = function(req, res) {
    res.render('login', {
        'failed': req.param("failed")
    });
};

exports.doLogin = function(passport) {
    return function(req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login?failed=true',
            failureFlash: true
        })(req, res, next);
    }
};

exports.showProfile = function(req, res) {
    var user = req.user;
    API.jiras(user.username, user.password, function(error, data) {
        logger.info(error);
        logger.info(data);
    });
    res.render('profile', {
        user: req.user
    });
};

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};

exports.users = function(db) {
    return function(req, res) {
        var user = db.get('user');
        user.find({}, {}, function(error, data) {
            res.render('users', {
                "users": data
            });
        });
    }
};

exports.groups = function(db) {
    return function(req, res) {
        var group = db.get('group');
        group.find({}, {}, function(error, data) {
            res.render('groups', {
                "groups": data
            });
        });
    }
};