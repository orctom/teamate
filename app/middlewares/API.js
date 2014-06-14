var rest = require('./rest');

exports.login = function(username, password, done) {
    var params = {
        userName: username,
        password: password
    }
    var url = "https://ecomsvn.officedepot.com/rest-service/auth-v1/login";
    rest.get(url, params, function(error, data) {
        console.log("data: " + JSON.stringify(data));
        if (error) {
            done(error);
        } else {
            if (data.token) {
                var token = data.token;
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
    var params = {
        FEAUTH: token
    };
    var url = 'https://ecomsvn.officedepot.com/rest-service/users-v1/' + username;
    rest.get(url, params, function(error, data) {
        if (error) {
            done(error);
        } else {
            if (data.userData) {
                var userData = data.userData;
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
    var params = {
        jql: 'status in (Open, "In Progress", Reopened, "Pending test", Rejected, "Code Review", Review) AND assignee in (hao.chen2)'
    };
    var url = "https://officedepot.atlassian.net/rest/api/2/search";
    rest.get(url, params, function(error, data) {
        if (error) {
            done(error);
        } else {
            if (data.issues) {
                var issues = [];
                console.log("length= " + data.issues.length);
                for (var i in data.issues) {
                    console.log("====== start =======");
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
    }, auth(username, password));
};

function auth(username, password) {
    return {
        username: username,
        password: password
    }
}