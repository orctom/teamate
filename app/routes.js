var API = require('./middlewares/API');
var config = require('../config');
var profile = require('./profile');
var task = require('./task');
var calendar = require('./calendar');
var admin = require('./admin');

module.exports = function(app, passport, db, logger) {

    //=====================   home   =======================
    app.get('/', requireLogin, calendar.dashboard(db));

    //=====================   security   =======================
    app.get('/login', profile.login);
    app.post('/login', profile.doLogin(passport));
    app.get('/logout', profile.logout);
    app.get('/profile', requireLogin, profile.showProfile);
    app.get('/users', requireLogin, profile.users(db));
    app.get('/groups', requireLogin, profile.groups(db));

    //=====================   task   =======================
    app.get('/task', requireLogin, task.list(db));
    app.get('/task/add', requireLogin, task.add);
    app.get('/task/edit/:id', requireLogin, task.edit(db));
    app.post('/task/save', requireLogin, task.save(db));
    app.get('/task/delete/:id', requireLogin, task.delete(db));

    app.get('/task/categories', requireLogin, task.categories(db));
    app.post('/task/categories/save', requireLogin, task.saveCategory(db));
    app.get('/task/categories/delete/:id', requireLogin, task.deleteCategory(db));

    //=====================   calendar   =======================
    app.get('/calendar/events', requireLogin, calendar.events(db));
    app.post('/calendar/events', requireLogin, calendar.update(db));

    //=====================   admin (maintain groups)  =======================
    app.get('/admin/groups', requireAdmin, admin.groups);
    app.get('/admin/group/:groupId/users', requireAdmin, admin.usersOfGroup);
};

function requireLogin(req, res, next) {
    if ('development' == config.env) {
        req.user = {
            username: config.auth.username,
            password: config.auth.password,
            token: config.auth.token,
            name: 'My Lord',
            avatarUrl: 'https://ecomsvn.officedepot.com/avatar/' + config.auth.username
        };
        res.locals.user = req.user;
        return next();
    }

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