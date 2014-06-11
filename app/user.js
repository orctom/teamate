exports.list = function(db) {
	return function(req, res) {
		var collection = db.get('usercollection');
		collection.find({}, {}, function(e, docs) {
			res.render('users', {
				"users" : docs
			});
		});
	};
};

exports.lookup = function(rest) {
	return function(req, res) {
		console.log("lookup");
		rest.get('https://ecomsvn.officedepot.com/rest-service/auth-v1/login?userName=hao.chen2&password=123qweasd').on('complete', function(result) {
			if (result instanceof Error) {
				console.log('Error:', result.message);
				this.retry(5000); // try again after 5 sec
			} else {
				var data = result;
				if ('object' != typeof result) {
					data = JSON.parse(data);
				}
				var token = data.loginResult.token[0];
				console.log("========token===========");
				console.log(token);
				console.log("========token===========");
				rest.get('https://ecomsvn.officedepot.com/rest-service/users-v1/hao.chen2?FEAUTH=' + token).on('complete', function(user) {
					console.log(user);
					res.render('user', {
						"user" : user
					});
				});
			}
		});
	};
};
