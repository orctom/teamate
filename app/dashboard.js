exports.index = function(db) {
    return function(req, res) {
        res.render('dashboard/index');
    };
};