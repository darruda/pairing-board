var Promise = require("bluebird");
var JiraApiReader = require('./jira-api-reader.js');

function JiraApiConector(config, httpsLib) {
	validateConfiguration(config);
	jiraApiReader = new JiraApiReader();
	
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
			return jiraApiReader.processData(JSON.parse(data))
		});
	};
}

module.exports = JiraApiConector;