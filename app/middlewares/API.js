var rest = require('restler');

exports.login = function(username, password, done) {
    rest.get('https://ecomsvn.officedepot.com/rest-service/auth-v1/login?userName=' + username + '&password=' + password).on('complete', function(data) {
        if (data instanceof Error) {
            done(data);
        } else {
            if (data.loginResult.token) {
                var token = data.loginResult.token[0];
                exports.profile(username, token, function(error, data) {
                    if (error) {
                        return done(error);
                    } else {
                        var user = data;
                        user.username = username;
                        user.password = password;
                        user.token = token;
                        return done(null, user);
                    }
                });
            } else {
                done(data.loginResult.error);
            }
        }
    });
};

exports.profile = function(username, token, done) {
    var url = 'https://ecomsvn.officedepot.com/rest-service/users-v1/' + username + "?FEAUTH=" + token;
    rest.get(url).on('complete', function(data) {
        if (data instanceof Error) {
            done(data);
        } else {
            if (data.restUserProfileData.userData) {
                var userData = data.restUserProfileData.userData[0];
                var avatar = String(userData.avatarUrl);
                var questionMarkIndex = avatar.indexOf("?");
                if (questionMarkIndex > 0) {
                    avatar = avatar.substring(0, questionMarkIndex);
                }
                var name = userData.displayName;
                var user = {
                    'avatar': avatar,
                    'name': name
                };
                done(null, user);
            } else {
                done(new Error(data.error));
            }
        }
    });
};

exports.jiras = function(username, password, done) {
    var url = 'https://officedepot.atlassian.net/rest/api/2/search?';
    var options = {
        username: username,
        password: password,
        query: {
            jql: "status in (Open, 'In Progress', Reopened, 'Pending test', Rejected, 'Code Review', Review) AND assignee in (hao.chen2)"
        }
    };
    rest.json(url, options).on('complete', function(data) {
        if (data instanceof Error) {
            done(data);
        } else {
            console.log("data: " + JSON.stringify(data));
            if (data.issues) {
                var issues = [];
                console.log("length= " + data.issues.length);
                for (var i in data.issues) {
                    console.log("====== start +++++++");
                    console.log(data.issues[i])
                    console.log("=====================");
                    var key = data.issues[i].key;
                    var fields = data.issues[i].fields;
                    var issue = {
                        key: key,
                        summary: fields.summary,
                        issuetype: {
                            name: fields.issuetype.name,
                            subtask: fields.issuetype.subtask
                        },
                        assignee: {
                            name: fields.assignee.displayName,
                            username: fields.assignee.name,
                            avatar: fields.assignee.avatarUrls['48x48']
                        },
                        reporter: {
                            name: fields.reporter.displayName,
                            username: fields.reporter.name,
                            avatar: fields.reporter.avatarUrls['48x48']
                        },
                        priority: {
                            name: fields.priority.name,
                            icon: fields.priority.iconUrl
                        },
                        status: {
                            name: fields.status.name,
                            icon: fields.status.iconUrl
                        },
                        component: fields.components,
                        fixVersion: fields.fixVersion
                    };
                    issues.push(issue);
                    console.log(JSON.stringify(issue));
                }

                done(null, issues);
            } else {
                done(new Error(data.error));
            }
        }
    });
};