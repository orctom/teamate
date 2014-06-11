var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/teamate');

var rest = require('restler');

var passport = require('passport');

var app = express();

// General Setup
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    app.use(favicon());
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(app.router);
});

// passport
require('./config/passport')(passport);

/// error handlers
require('./config/error-handler')(app);

// routes
require('./app/routes.js')(app, passport);

// ENV
var env = process.env.NODE_ENV || 'development';

app.configure('development', function() {
    app.use(express.errorHandler());
});

// sheduler
var schedule = require('node-schedule');
schedule.scheduleJob('* * * * *', function() {
    console.log('The answer to life, the universe, and everything!');
});


app.listen(app.get('port'), function() {
    console.log('Server listening on port ' + app.get('port'));
});