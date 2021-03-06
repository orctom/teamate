var API = require('./middlewares/API');
var config = require('../config');

var dashboard = require('./dashboard');
var profile = require('./profile');
var task = require('./task');
var calendar = require('./calendar');
var activity = require('./activity');
var user = require('./user');
var report = require('./report');
var jira = require('./jira');

module.exports = function(app, passport, db, logger) {

    //=====================   home   =======================
    app.get('/', requireLogin, dashboard.dashboard(db));

    //=====================   security   =======================
    app.get('/login', profile.login);
    app.post('/login', profile.doLogin(passport));
    app.get('/logout', profile.logout);
    app.get('/profile', requireLogin, profile.showProfile);

    //=====================   task   =======================
    app.get('/task', requireLogin, task.index(db));
    app.get('/task/list', requireLogin, task.list(db));
    app.post('/task/save', requireLogin, task.save(db));
    app.post('/task/delete/:id', requireLogin, task.delete(db));

    app.get('/task/categories', requireLogin, task.categories(db));
    app.post('/task/categories/save', requireLogin, task.saveCategory(db));
    app.get('/task/category/delete/:id', requireLogin, task.deleteCategory(db));

    //=====================   calendar   =======================
    app.get('/events', requireLogin, calendar.calendar(db));
    app.get('/calendar/events', requireLogin, calendar.events(db));
    app.post('/calendar/events', requireLogin, calendar.update(db));
    app.get('/calendar/event/delete/:id', requireLogin, calendar.deleteEvent(db));

    //=====================   activity   =======================
    app.get('/activities/:teamId', requireLogin, activity.activity(db));
    app.get('/activities/events/:username', requireLogin, activity.events(db));
    app.get('/activities/changes/:username', requireLogin, activity.changes(db));

    //=====================   report   =======================
    app.get('/report', requireLogin, report.report(db));
    app.get('/report-data', requireLogin, report.reportData(db));

    //=====================   user / team   =======================
    app.get('/teams', requireLogin, user.teams(db));
    app.get('/team/:id/users', requireLogin, user.usersOfTeam(db));

    //=====================   jira   =======================
    app.get('/jira/:jira', jira.jira);
    app.get('/jiras/:jiras', jira.jiras);

    //=====================   Admin   =======================
    app.get('/users', requireLogin, user.users(db));
    app.post('/user/team/update', requireLogin, user.updateTeamOfUser(db));
    app.post('/team/save', requireLogin, user.saveTeam(db));
    app.post('/team/delete/:id', requireLogin, user.deleteTeam(db));
};

function requireLogin(req, res, next) {
    if ('development' == config.env) {
        req.user = {
            username: config.auth.username,
            password: config.auth.password,
            token: config.auth.token,
            name: 'My Lord',
            isManager: true,
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
        var admins = config.admins;
        if (admins[req.user.username]) {
            return next();
        } else {
            res.redirect('/403');
        }
    } else {
        res.redirect('/login');
    }
}

function requireManager(req, res, next) {
    if (req.isAuthenticated()) {
        var managers = config.managers;
        if (managers[req.user.username]) {
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