teamate
=======

Team work dashboard along with JIRA and Fisheye

[APIs]
https://docs.atlassian.com/fisheye-crucible/latest/wadl/fecru.html
https://docs.atlassian.com/fisheye-crucible/latest/wadl/crucible.html
https://docs.atlassian.com/fisheye-crucible/latest/wadl/fisheye.html [??]
https://docs.atlassian.com/software/jira/docs/api/REST/latest/

* [get details of a JIRA]
https://officedepot.atlassian.net/rest/api/2/issue/NAECOM-839

* [query jira list]
https://officedepot.atlassian.net/rest/api/2/search?jql=status+in+(Open,+%22In+Progress%22,+Reopened,+%22Pending+test%22,+Rejected,+%22Code+Review%22,+Review)+AND+assignee+in+(currentUser())
https://officedepot.atlassian.net/rest/api/2/search?jql=status+in+(Open,+%22In+Progress%22,+Reopened,+%22Pending+test%22,+Rejected,+%22Code+Review%22,+Review)+AND+assignee+in+(bin.yang,+huawei.zhu)
https://officedepot.atlassian.net/rest/api/2/search?jql=status in (Open, "In Progress", Reopened, "Pending test", Rejected, "Code Review", Review) AND assignee in (hao.chen2)

* [get user info]
https://ecomsvn.officedepot.com/rest-service/users-v1/hao.chen2

* [login]
https://ecomsvn.officedepot.com/rest-service/auth-v1/login?userName=hao.chen2&password=

* [get code reveiws toReview]
https://ecomsvn.officedepot.com/rest-service/reviews-v1/filter/toReview

[activities]
https://officedepot.atlassian.net/activity?maxResults=2&streams=user+IS+patrick.wunier

[changeset]
https://ecomsvn.officedepot.com/rest-service-fe/revisionData-v1/changesetList/ECOM?start=20140616T180000
https://ecomsvn.officedepot.com/rest-service-fe/revisionData-v1/changeset/ECOM/{csid}


https://ecomsvn.officedepot.com/changelog/~rss,br=1.6,feedspan=2mo,feedmax=10/FE/rss.xml
https://ecomsvn.officedepot.com/rest/api/1.0/rest-service-fecru/users?size=50&limit=50
https://ecomsvn.officedepot.com/rest/api/1.0/rest-service-fe/changeset-v1


https://ecomsvn.officedepot.com/rest-service-fe/changeset-v1/listChangesets?rep=ECOM&path=trunk&committer=hao.chen2
https://ecomsvn.officedepot.com/rest-service-fecru/admin/users/hao.chen2
rep=<value>&path=<value>&committer=<value>&comment=<value>&p4JobFixed=<value>&expand=<value>&beforeCsid=<value>


https://ecomsvn.officedepot.com/rest-service/users-v1/hao.chen2
https://jira.atlassian.com/plugins/servlet/restbrowser#/
https://officedepot.atlassian.net/plugins/servlet/restbrowser#/

[taobao ip]
http://ip.taobao.com/service/getIpInfo.php?ip=202.114.101.93


var mytask = {
	task: jira,
	category: 'work/personal'
};

var worklog = {
	date: task
}