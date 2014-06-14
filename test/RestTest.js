var rest = require('../app/middlewares/rest');

var params = {
    jql: 'status in (Open, "In Progress", Reopened, "Pending test", Rejected, "Code Review", Review) AND assignee in (hao.chen2)'
};
rest.get('https://officedepot.atlassian.net/rest/api/2/search?', params, 'hao.chen2', '123qweasd', function(err, res, body) {
    console.log("1 " + err);
    console.dir(body);
});