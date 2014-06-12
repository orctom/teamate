var API = require('./middlewares/API');

module.exports = function(app, passport) {
    app.get('/', function(req, res) {
        var user = req.user;
        API.jiras(user.username, user.password, function(error, data) {
            console.log("--------------")
            console.log(error);
            console.log(data);
            console.log("--------------")
        });
        res.render('index');
    });

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
            console.log("--------------")
            console.log(error);
            console.log(data);
            console.log("--------------")
        });
        res.render('profile', {
            user: req.user
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

function requireLogin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
}