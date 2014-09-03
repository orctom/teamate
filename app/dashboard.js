exports.dashboard = function(db) {
    return function(req, res) {
        res.render('dashboard');
    };
};