exports.login = function(req, res) {
    var msg = String(req.flash('error'));
    res.render('login', {
        msg: msg
    });
};

exports.doLogin = function(passport) {
    return function(req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    };
};

exports.showProfile = function(req, res) {
    res.render('profile', {
        user: req.user
    });
};

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};