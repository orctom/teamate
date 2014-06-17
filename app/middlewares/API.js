var rest = require('./rest');

var jiraPattern = /\[?(\w+\-\d+)\]?.*/;

// =====================     fisheye-crucible     =====================
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
                var user = {
                    name: userData.displayName,
                    username: userData.name,
                    avatarUrl: getAvatarUrl(userData.name)
                };
                done(null, user);
            } else {
                done(new Error(data.error));
            }
        }
    });
};

exports.reviews = function(token, done) {
    var params = {
        FEAUTH: token
    };
    var url = "https://ecomsvn.officedepot.com/rest-service/reviews-v1/filter/toReview";
    rest.get(url, params, function(error, data) {
        if (error) {
            done(error);
        } else {
            if (data && data.reviewData) {
                var reviews = [];
                for (var i in data.reviewData) {
                    var reviewData = data.reviewData[i];
                    var review = {
                        key: reviewData.projectKey,
                        name: reviewData.name,
                        author: {
                            name: reviewData.author.displayName,
                            username: reviewData.author.userName,
                            avatarUrl: getAvatarUrl(reviewData.author.userName)
                        }
                    };
                    reviews.push(review);
                }
                done(null, reviews);
            } else {
                done(new Error(data.error));
            }
        }
    });
};

exports.changeset = function(token, done) {
    var params = {
        FEAUTH: token,
        start: getDateString(-3600000 * 12)
    };
    var url = "https://ecomsvn.officedepot.com/rest-service-fe/revisionData-v1/changesetList/ECOM";
    rest.get(url, params, function(error, data) {
        if (error) {
            done(error);
        } else {
            if (data && data.csid) {
                done(null, data.csid);
            } else {
                done(new Error(data.error));
            }
        }
    });
};

exports.changes = function(csid, token, done) {
    var params = {
        FEAUTH: token,
    };
    var url = "https://ecomsvn.officedepot.com/rest-service-fe/revisionData-v1/changeset/ECOM/" + csid;
    rest.get(url, params, function(error, data) {
        if (error) {
            done(error);
        } else {
            if (data) {
                var jira = jiraPattern.test(data.comment) ? data.comment.replace(jiraPattern, '$1') : null;
                var changes = {
                    jira: jira,
                    date: data.date,
                    author: data.author,
                    comment: data.comment,
                    fileset: data.fileRevisionKey
                };
                done(null, changes);
            } else {
                done(new Error(data.error));
            }
        }
    });
};

// =====================     jira     =====================

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
                for (var i in data.issues) {
                    var issue = getJIRA(data.issues[i]);
                    issues.push(issue);
                }

                done(null, issues);
            } else {
                done(new Error(data.error));
            }
        }
    }, auth(username, password));
};

exports.jira = function(jira, username, password, done) {
    var url = "https://officedepot.atlassian.net/rest/api/2/issue/" + jira;
    rest.get(url, null, function(error, data) {
        if (error) {
            done(error);
        } else {
            if (data) {
                var issue = getJIRA(data);
                done(null, issue);
            } else {
                done(new Error(data.error));
            }
        }
    }, auth(username, password));
};

exports.search = function(jql, username, password, done, startAt) {
    var params = {
        jql: jql
    };
    if (startAt) {
        params.startAt = startAt;
    }
    var url = "https://officedepot.atlassian.net/rest/api/2/search/";
    rest.get(url, params, function(error, data) {
        if (error) {
            done(error);
        } else {
            if (data) {
                var issue = getJIRA(data);
                done(null, issue);
            } else {
                done(new Error(data.error));
            }
        }
    }, auth(username, password));
};

exports.activities = function(username, password, done) {
    var url = "https://officedepot.atlassian.net/activity";
    rest.get(url, null, function(error, data) {
        if (error) {
            done(error);
        } else {
            if (data) {
                console.log("data:\n" + data);
            } else {
                done(new Error(data.error));
            }
        }
    }, auth(username, password));
};

// =====================     utils     =====================

function auth(username, password) {
    return {
        username: username,
        password: password
    }
}

function getJIRA(data) {
    var key = data.key;
    var fields = data.fields;
    return {
        key: key,
        summary: fields.summary,
        issuetype: {
            name: fields.issuetype.name,
            subtask: fields.issuetype.subtask
        },
        assignee: {
            name: fields.assignee.displayName,
            username: fields.assignee.name,
            avatarUrl: getAvatarUrl(fields.assignee.name)
        },
        reporter: {
            name: fields.reporter.displayName,
            username: fields.reporter.name,
            avatarUrl: getAvatarUrl(fields.reporter.name)
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
        fixVersion: fields.fixVersions
    };
}

// use jira avatar
function getAvatarUrl(username) {
    return 'https://officedepot.atlassian.net/secure/useravatar?ownderId=' + username;
}

function getDateString(delta) {
    var date = new Date();
    var offset = delta ? -date.getTimezoneOffset() * 60000 + delta : -date.getTimezoneOffset() * 60000;
    date.setTime(date.getTime() + offset);
    return date.toJSON();
}