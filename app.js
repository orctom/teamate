var config = require('./config');

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var monk = require('monk');
var db = monk(config.mongodb.url);

var passport = require('passport');

var app = express();

var logger = require('./config/logger');

// General Setup
app.configure(function() {
    app.set('port', process.env.PORT || config.port);
    app.set('env', config.env);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    app.use(favicon());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(express.session({
        secret: config.session.secret,
        cookie: {
            maxAge: 86400000
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    app.use(function(req, res, next) {
        res.locals.user = req.user;
        next();
    });
    app.use(app.router);
});

// passport
require('./config/passport')(passport);

/// error handlers
require('./config/error-handler')(app);

// routes
require('./app/routes.js')(app, passport, db, config, logger);

app.configure('development', function() {
    app.use(express.errorHandler());
});

// scheduler
var schedule = require('node-schedule');
require('./app/middlewares/scheduler')(config, schedule, logger);


app.listen(app.get('port'), function() {
    console.log('Server listening on port ' + app.get('port'));
});