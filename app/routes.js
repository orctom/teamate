var API = require('./middlewares/API');
var config = require('../config');
var profile = require('./profile');
var todo = require('./todo');
var admin = require('./admin');

module.exports = function(app, passport, db, logger) {

    //=====================   home   =======================
    app.get('/', requireLogin, index);

    //=====================   security   =======================
    app.get('/login', profile.login);
    app.post('/login', profile.doLogin(passport));
    app.get('/logout', profile.logout);
    app.get('/profile', requireLogin, profile.showProfile);
    app.get('/users', requireLogin, profile.users(db));
    app.get('/groups', requireLogin, profile.groups(db));

    //=====================   todo   =======================
    app.get('/todo', requireLogin, todo.list(db));
    app.get('/todo/add', requireLogin, todo.add);
    app.get('/todo/edit/:id', requireLogin, todo.edit(db));
    app.post('/todo/save', requireLogin, todo.save(db));
    app.get('/todo/delete/:id', requireLogin, todo.delete(db));

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

function index(req, res) {
    var user = req.user;
    API.jiras(user.username, user.password, function(error, data) {
        res.render('index', {
            jira: data
        });
    });
}