var API = require('./middlewares/API');

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('index');
    });

    app.get('/login', function(req, res) {
        res.render('login', {
            'failed': req.param("failed")
        });
    });

    app.post('/login',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login?failed=true',
            failureFlash: true
        })
    );

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile', {
            user: req.user
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
}