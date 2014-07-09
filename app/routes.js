var API = require('./middlewares/API');
var config = require('../config');
var profile = require('./profile');
var admin = require('./admin');

module.exports = function(app, passport, db, logger) {

    //=====================   home   =======================
    app.get('/', requireLogin, function(req, res) {
        var user = req.user;
        API.jiras(user.username, user.password, function(error, data) {
            logger.info(error);
            logger.info(data);
        });
        res.render('index');
    });

    //=====================   security   =======================
    app.get('/login', profile.login);
    app.post('/login', profile.doLogin(passport));
    app.get('/logout', profile.logout);
    app.get('/profile', requireLogin, profile.showProfile);
    app.get('/users', requireLogin, profile.users(db));
    app.get('/groups', requireLogin, profile.groups(db));

    //=====================   calendar   =======================


    //=====================   admin (maintain groups)  =======================
    app.get('/admin/groups', requireAdmin, admin.groups);
    app.get('/admin/group/:groupId/users', requireAdmin, admin.usersOfGroup);
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