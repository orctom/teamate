module.exports = function(app) {

    app.use(function(req, res, next) {
        res.status(404);
        if (req.accepts('html')) {
            res.render('404', {
                url: req.url
            });
            return;
        }
        if (req.accepts('json')) {
            res.send({
                error: 'Not found'
            });
            return;
        }
        res.type('txt').send('Not found');
    });

    // development error handler will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.render('500', {
                message: err.message,
                error: err
            });
        });
    } else { // production error handler no stacktraces leaked to user
        app.use(function(err, req, res, next) {
            res.render('500', {
                message: err.message,
                error: {}
            });
        });
    }
}