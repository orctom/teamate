var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
var LdapStrategy = require('passport-ldapauth').Strategy;

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/teamate');
var rest = require('restler');

var app = express();

// ldap
var OPTS = {
    server: {
        url: 'ldap://uschnahub01.na.odcorp.net:3268/',
        adminDn: 'CN=SVC-JENKINS-DEV,OU=System_OU,DC=na,DC=odcorp,DC=net',
        adminPassword: 'May@3014',
        searchBase: 'DC=na,DC=odcorp,DC=net',
        searchFilter: '(&amp;(objectclass=user)(sAMAccountName={0}))'
    }
}

// passport
passport.use(new LdapStrategy(OPTS));
app.use(passport.initialize());
app.post('/login', passport.authenticate('ldapauth', {
    session: false
}), function(req, res) {
    res.send({
        status: 'ok'
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// routes
var routes = require('./routes');
var users = require('./routes/user');

app.get('/', routes.index);
app.get('/users', users.list(db));
app.get('/user', users.lookup(rest));

// sheduler
var schedule = require('node-schedule');
schedule.scheduleJob('* * * * 1-5', function() {
    console.log('The answer to life, the universe, and everything!');
});


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen('3000', function() {
    console.log('Server listening on port ' + '3000');
});