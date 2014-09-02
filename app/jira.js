var config = require('../config');
var api = require('./middlewares/API');
var async = require('async');

exports.jira = function(req, res) {
    var jira = req.params.jira;
    api.jira(jira, config.auth.username, config.auth.password, function(error, data) {
        res.json(data);
    });
};

exports.jiras = function(req, res) {
    var jirasParam = req.params.jiras;
    var jiraArray = jirasParam.split('+');
    var jiras = {};
    async.each(jiraArray,
        function(jira, callback) {
            api.jira(jira, config.auth.username, config.auth.password, function(error, data) {
                if (!error) {
                    jiras[data.key] = data;
                }
                callback();
            });
        },
        function(err) {
            res.json(jiras);
        }
    );
};