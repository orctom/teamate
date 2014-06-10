exports.isLoggedin = (req, res, next) {
    if (!req.session.user_id) {
        res.send('You are not authorized to view this page');
    } else {
        next();
    }
};

exports.login = function(rest) {
    return function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        rest.get('https://ecomsvn.officedepot.com/rest-service/auth-v1/login?userName=' + username + '&password=' + password).on('complete', function(data) {
            if (result instanceof Error) {
                console.log('Error:', result.message);
            } else {
                var token = data.loginResult.token[0];
                req.session.user_id = token;
                req.session.token = token;
                res.redirect('/my_secret_page');
            }
        });
    };
};

exports.logout = function(req, res) {
    delete req.session.user_id;
    res.redirect('/login');
};