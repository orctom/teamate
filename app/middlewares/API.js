var rest = require('./rest');
var config = require('../../config');
var request = require('request');
var cheerio = require('cheerio');
var FeedParser = require('feedparser');

var oneMonthAgo = -3600000 * 24 * 30;
var jiraPattern = /\[?(\w+\-\d+)\]?.*/;

// =====================     fisheye-crucible     =====================
exports.login = function(username, password, done) {
    var params = {
        userName: username,
        password: password
    };
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
            } else if (data.loginResult) {
                done(data.loginResult.error);
            } else {
                done(data.message);
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
                    username: userData.userName,
                    avatarUrl: getAvatarUrl(userData.userName)
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

exports.changeset = function(token, done, start) {
    if (!start) {
        start = getDateString(null, oneMonthAgo);
    } else {
        start = getDateString(start);
    }
    var params = {
        FEAUTH: token,
        start: start
    };
    var url = "https://ecomsvn.officedepot.com/rest-service-fe/revisionData-v1/changesetList/ECOM";
    rest.get(url, params, function(error, data) {
        if (error) {
            done(error);
        } else {
            if (data && data.csid) {
                done(null, data.csid);
            } else {
                if (data.message) {
                    done(data.message);
                } else if (data.error) {
                    done(data.error);
                } else {
                    done(data);
                }
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

formLogin = function(username, callback) {
    request.post('https://ecomsvn.officedepot.com/login', {
        form: {
            username: config.auth.username,
            password: config.auth.password
        },
        jar: true
    }, function(error, response, data) {
        if (error) {
            console.log('[ERROR] ' + error);
        } else {
            console.log("Logged in.");
            exports.parseChangesFromPage(username, callback);
        }
    });
};

exports.parseChangesFromPage = function(username, callback) {
    var url = 'https://ecomsvn.officedepot.com/user/' + username;
    var params = {
        jar: true,
        url: url
    };
    request(params, function(error, response, body) {
        if (error) {
            console.log("[ERROR]" + JSON.stringify(error) + ", " + url);
            callback(error);
        } else if (response.statusCode != 200) {
            console.log("[ERROR] status code: " + response.statusCode + ", " + error + ", " + url);
            callback(404);
        } else {
            var $ = cheerio.load(body);
            if ($('#password').length > 0) {
                console.log('goto login...');
                formLogin(username, callback);
                return;
            }

            var datas = [];
            $('.article-changeset').each(function(i, elem) {
                var $this = cheerio($(this));
                var date = new Date($this.find('.article-date > span').attr('title'));
                var message = $this.find('.article-message').text().replace(/\n/g, '');
                var jira = jiraPattern.test(message) ? message.replace(jiraPattern, '$1') : null;
                var data = {
                    date: date,
                    jira: jira,
                    message: message
                };
                var files = [];
                $this.find('.stream-files').find('.file-path').each(function(j, element) {
                    var $a = cheerio($(this));
                    files.push({
                        path: $a.attr('title'),
                        link: $a.attr('href')
                    });
                });
                data.files = files;
                datas.push(data);
            });
            callback(null, datas);
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

exports.unwatch = function(jira, username, password, done) {
    var params = {
        username: username
    };
    var url = "https://officedepot.atlassian.net/rest/api/2/issue/" + jira + "/watchers";
    rest.delete(url, params, function(error, data) {
        console.log("error: " + error);
        console.log("data : " + data);
        if (error) {
            done(error);
        } else {
            if (data) {
                done(null, data);
            }
        }
    }, auth(username, password));
};

exports.unwatchFinishedJIRAs = function(username, password) {
    exports.search('issue in watchedIssues()', username, password, function(error, data) {
        for (var i in data) {
            var issue = data[i];
            var status = issue.status.name;
            if ('Closed' == status || 'Resolved' == status) {
                exports.unwatch(issue.key, username, password);
            }
        }
    });
};

exports.activities = function(username, password, done, after) {
    if (!after) {
        after = new Date().getTime() + oneMonthAgo;
    }
    var url = "https://officedepot.atlassian.net/activity?maxResults=200&streams=update-date+AFTER+" + after;
    console.log("after: " + new Date(after));
    console.log("url  : " + url);
    var feedparser = new FeedParser({
        addmeta: false
    });
    rest.pipe(url, null, feedparser, auth(username, password));
    feedparser.on('readable', function() {
        var stream = this;
        var item;
        while ((item = stream.read())) {
            var activity = {
                title: item.title,
                date: item.date,
                link: item.link,
                guid: item.guid,
                categories: item.categories,
                username: item['atom:author']['usr:username']['#'],
                timezone: item['atlassian:timezone-offset']['#']
            };
            done(null, activity);
        }
    });

    feedparser.on('error', function(error) {
        console.log('Failed to parse activities: ' + error);
    });
};

// =====================     utils     =====================

function auth(username, password) {
    return {
        username: username,
        password: password
    };
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
    return 'https://ecomsvn.officedepot.com/avatar/' + username;
}

function getDateString(date, delta) {
    if (!date) {
        date = new Date();
    }
    var offset = delta ? -date.getTimezoneOffset() * 60000 + delta : -date.getTimezoneOffset() * 60000;
    date.setTime(date.getTime() + offset);
    return date.toJSON();
}