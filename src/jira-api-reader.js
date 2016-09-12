var Promise = require("bluebird");

function JiraApiReader(config, httpsLib) {
	validateConfiguration(config);
	var self = this;
	var users = [];
	var pairs = [];
	
	var https;
	if (httpsLib) {
		https = httpsLib;
	} else {
		https = require('https');
	}

	function validateConfiguration(config) {
		var requiredKeys = ["hostname", "url", "jql", "base64Auth"];
		var missingKeys = [];
		if (config) {
			requiredKeys.forEach(key => {
				if (!config[key]) {
					missingKeys.push(key);
				}
			});
		} else {
			missingKeys = requiredKeys;
		}

		if (missingKeys.length) {
			var error = new Error("The following information are missing: ".concat(missingKeys.join(', '), "."));
			error.name = "ArgumentException";
			throw error;
		}
	}

	function appendWorkStream(workstream) {
		if (workstream) {
			var pair = [];
			workstream.forEach(function(user) {
				addUserInfo(user);
				pair.push(user.key);
			});
			
			pairs.push(pair);
		}
	}

	function addUserInfo(user) {
		users.push({"id": user.key, "name": user.displayName,"imageUrl": user.avatarUrls["32x32"]});
	}

	this.getPairs = function(issue) {
		return pairs;
	}


	this.getUsers = function() {
		return users;
	};

	this.processIssue = function(issue) {
		appendWorkStream(issue.fields.customfield_10073); // Developers
		appendWorkStream(issue.fields.customfield_10074); // QAs
	};

	this.processData = function(jiraData) {
		jiraData.issues.forEach(function(issue) {
			self.processIssue(issue);
		});
		return pairs;
	};

	var getRequestPath = function() {
		var path = config.url .concat("?jql=", encodeURIComponent(config.jql));
		if (config.fields && config.fields.length) {
			path = path.concat("&", "fields=", config.fields.join(','));
		}
		return path;
	};

	this.getIssues = function() {
		return new Promise(function (resolve, reject) {
			var options = {
		        method: 'GET',
		        hostname: config.hostname,
		        port: 443,
		        path: getRequestPath(),
		        rejectUnauthorized: false,
		        headers: {
		          'Authorization': 'Basic ' + config.base64Auth,
		          "Content-Type": "application/json"
		        }
		    };

		    var fullData = '';
		    https.get(options, restResponse => {
		      if (restResponse.statusCode >= 300) {
		          reject(new Error(`Error ${restResponse.statusCode} during Jira informantion retrieve.`));
		      } else {
		        restResponse.on('data', (d) => {
		          fullData = fullData.concat(d);
		        });

		        restResponse.on('end', () => {
		          	resolve(fullData);
		        });
		      }

		    }).on('error', e => {
		      reject(e);
		    });
		}).then(function(data) {
			return self.processData(JSON.parse(data))
		});
	};
}

module.exports = JiraApiReader;