var API = require('./middlewares/API');
var config = require('../config');

module.exports = function(app, passport, db, logger) {
    //=====================   security   =======================
    app.get('/login', function(req, res) {
        res.render('login', {
            'failed': req.param("failed")
        });
    });

    app.post('/login', function(req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login?failed=true',
            failureFlash: true
        })(req, res, next);
    });


    app.get('/profile', requireLogin, function(req, res) {
        var user = req.user;
        API.jiras(user.username, user.password, function(error, data) {
            logger.info("--------------");
            logger.info(error);
            logger.info(data);
            logger.info("--------------");
        });
        res.render('profile', {
            user: req.user
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    //=====================   home   =======================

    app.get('/', requireLogin, function(req, res) {
        var user = req.user;
        API.jiras(user.username, user.password, function(error, data) {
            logger.info("--------------");
            logger.info(error);
            logger.info(data);
            logger.info("--------------");
        });
        res.render('index');
    });

    //=====================   calendar   =======================



    app.get('/users', requireLogin, function(req, res) {
        var user = db.get('user');
        user.find({}, {}, function(error, data) {
            res.render('users', {
                "users": data
            });
        });
    });

    app.get('/groups', requireLogin, function(req, res) {
        var group = db.get('group');
        group.find({}, {}, function(error, data) {
            res.render('groups', {
                "groups": data
            });
        });
    });

    //=====================   admin (maintain groups)  =======================

    app.get('/settings/groups', requireAdmin, function(req, res) {
        var group = db.get('group');
        group.find({}, {}, function(error, data) {
            res.render('settings/groups', {
                "groups": data
            });
        });
    });

    app.post('/settings/groups', requireAdmin, function(req, res) {
        var group = db.get('group');
        group.find({}, {}, function(error, data) {
            res.render('settings/groups', {
                "groups": data
            });
        });
    });

    app.get('/settings/groups/:groupId/users', requireAdmin, function(req, res) {
        var group = db.get('group');
        group.find({}, {}, function(error, data) {
            res.render('settings/groups/users', {
                "users": data
            });
        });
    });

    app.post('/settings/groups/:groupId/users', requireAdmin, function(req, res) {
        var group = db.get('group');
        group.find({}, {}, function(error, data) {
            res.render('settings/groups/users', {
                "users": data
            });
        });
    });
};

function requireLogin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function requireAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        var privilege = config.privilege;
        var role = privilege[req.user.username];
        if ('admin' == role) {
            return next();
        } else {
            res.redirect('/403');
        }
    } else {
        res.redirect('/login');
    }
}