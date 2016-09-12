var JiraApiReader = require('../src/jira-api-reader.js');

var fakeConfig = {hostname: "JIRA_HOST_NAME", url: "JIRA_URL", jql: "JIRA JQL", base64Auth: "0123456789"};
var developers = [  
	{  
	  "name":"Ryan",
	  "key":"ryan",
	  "avatarUrls":{  
	     "32x32":"https://localhost/secure/useravatar?size=medium&ownerId=ryan&avatarId=1"
	  },
	  "displayName":"Ryan B."
	},
	{  
	  "name":"Bob",
	  "key":"bob",
	  "avatarUrls":{  
	     "32x32":"https://localhost/secure/useravatar?size=medium&ownerId=bob&avatarId=2"
	  },
	  "displayName":"Bob G."
	},
	{  
	  "name":"Thomas",
	  "key":"thomas",
	  "avatarUrls":{  
	     "32x32":"https://localhost/secure/useravatar?size=medium&ownerId=thomas&avatarId=3"
	  },
	  "displayName":"Thomas T."
	}
];

var QAs = [  
	{  
	  "name":"John",
	  "key":"john",
	  "avatarUrls":{  
	     "32x32":"https://localhost/secure/useravatar?size=medium&ownerId=john&avatarId=4"
	  },
	  "displayName":"John Simpson"
	},
	{  
	  "name":"Bran",
	  "key":"bran",
	  "avatarUrls":{  
	     "32x32":"https://localhost/secure/useravatar?size=medium&ownerId=bran&avatarId=5"
	  },
	  "displayName":"Brandon L."
	}
];

var issue = {  
	"id":"1234",
	"self":"https://localhost/rest/api/2/issue/1234",
	"key":"PBOARD-100",
	"fields":{  
	    "customfield_10074": QAs,
	    "customfield_10073": developers
	}
};

var incompleteIssue = {  
	"id":"2345",
	"self":"https://localhost/rest/api/2/issue/2345",
	"key":"PBOARD-101",
	"fields":{  
	    "customfield_10074": null,
	    "customfield_10073": developers
	}
};


describe("Jira API Reader consctructors tests.", function(){
	it("Should throw an error when Jira config is not informed on the constructor.", function(done) {
    	try {
    		new JiraApiReader();
    		done(new Error("The test must throw an error."));
    	} catch (error) {
    		expect(error.message).toEqual("The following information are missing: hostname, url, jql, base64Auth.");
    		expect(error.name).toEqual("ArgumentException");
    		done();
    	}
    });

	it("Should throw an error when hostname is not informed.", function(done) {
    	try {
    		new JiraApiReader({url: "JIRA_URL", jql: "JIRA_JQL", base64Auth: "0123456789"});
    		done(new Error("The test must throw an error."));
    	} catch (error) {
    		expect(error.message).toEqual("The following information are missing: hostname.");
    		expect(error.name).toEqual("ArgumentException");
    		done();
    	}
	});

	it("Should throw an error when url is not informed.", function(done) {
    	try {
    		new JiraApiReader({hostname: "JIRA_HOST_NAME", jql: "JIRA_JQL", base64Auth: "0123456789"});
    		done(new Error("The test must throw an error."));
    	} catch (error) {
    		expect(error.message).toEqual("The following information are missing: url.");
    		expect(error.name).toEqual("ArgumentException");
    		done();
    	}
	});

	it("Should throw an error when jql is not informed.", function(done) {
    	try {
    		new JiraApiReader({hostname: "JIRA_HOST_NAME", url: "JIRA_URL", base64Auth: "0123456789"});
    		done(new Error("The test must throw an error."));
    	} catch (error) {
    		expect(error.message).toEqual("The following information are missing: jql.");
    		expect(error.name).toEqual("ArgumentException");
    		done();
    	}
	});

	it("Should throw an error when base64 authentication is not informed.", function(done) {
    	try {
    		new JiraApiReader({hostname: "JIRA_HOST_NAME", url: "JIRA_URL", jql: "JIRA_JQL"});
    		done(new Error("The test must throw an error."));
    	} catch (error) {
    		expect(error.message).toEqual("The following information are missing: base64Auth.");
    		expect(error.name).toEqual("ArgumentException");
    		done();
    	}
	});
});

describe("Test suite for the JIRA API Reader.", function() {
	var jira;
	beforeEach(function() {
		jira = new JiraApiReader(fakeConfig);
	});

    it("throw Should return all pairs from the issue.", function() {
    	jira.processIssue(issue);
    	expect(jira.getPairs()).toEqual([['ryan','bob', 'thomas'],['john','bran']]);
    });

    it("Should ignore null pair information.", function() {
    	jira.processIssue(incompleteIssue);
    	expect(jira.getPairs()).toEqual([['ryan','bob', 'thomas']]);
    });

	it("Should return the users information.", function() {
    	var expectResult = [
    		{"id":"ryan", "name":"Ryan B.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=ryan&avatarId=1"},
			{"id":"bob", "name":"Bob G.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=bob&avatarId=2"},
			{"id":"thomas", "name":"Thomas T.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=thomas&avatarId=3"},
			{"id":"john", "name":"John Simpson","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=john&avatarId=4"},
			{"id":"bran", "name":"Brandon L.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=bran&avatarId=5"}
		];

		jira.processIssue(issue);
    	expect(jira.getUsers()).toEqual(expectResult);
    });    
});

describe("Jira API listening tests.", function() {
	var jiraResponse = {"expand": null, "startAt":0, "maxResults":50, "total":50, "issues":[issue, incompleteIssue]};
	var responseMock, httpsMock, jiraApiReader;
	beforeEach(function() {
		responseMock = new function() {
			this.finished = false;
			this.statusCode = 200;
			this.error = false;

			this.on = function(event, callback) {
				if (event == 'end' && !this.error) {
					this.finished = true;
					callback();
				}

				if (event == 'data') {
					callback(JSON.stringify(jiraResponse));
				}

				if (event == 'error' && this.error) {
					callback(new Error("ERROR_MESSAGE"));
				}
			};
		};
		httpsMock = new function() {
			var self = this;
			this.options;
			this.get = function(options, callback) {
				self.options = options;
				callback(responseMock);
				return responseMock;	
			};
		};

		jiraApiReader = new JiraApiReader(fakeConfig, httpsMock);
	});
	
	it("Should return a successful promisse.", function(done) {
		jiraApiReader.getIssues().then(function() {
			expect(jiraApiReader.getPairs()).toEqual([['ryan','bob', 'thomas'],['john','bran'],['ryan','bob', 'thomas']]);
			done();
		});
	});

	it("Should process all jira data.", function() {
		expect(jiraApiReader.processData(jiraResponse)).toEqual([['ryan','bob', 'thomas'],['john','bran'],['ryan','bob', 'thomas']]);
	});

	it("Promisse should be rejected on 400 HTTP error.", function(done) {
		responseMock.statusCode = 400;
		jiraApiReader.getIssues().catch(e => {
			expect(e.message).toEqual("Error 400 during Jira informantion retrieve.");
			done();
		});
	});

	it("Promisse should be rejected during request error.", function(done) {
		responseMock.error = true;
		jiraApiReader.getIssues().catch(e => {
			expect(e.message).toEqual("ERROR_MESSAGE");
			done();
		});
	});

	it("Parameter should be informed on the request options.", function() {
		var expectedOptions = {
	        method: 'GET',
	        hostname: 'JIRA_HOST_NAME',
	        port: 443,
	        path: 'JIRA_URL?jql=JIRA%20JQL',
	        rejectUnauthorized: false,
	        headers: {
	          'Authorization': 'Basic 0123456789',
	          "Content-Type": "application/json"
	        }
	    };

		jiraApiReader.getIssues();
		expect(httpsMock.options).toEqual(expectedOptions);
	});

	it("Should include the custom fields as parameters on the request path.", function() {
	    var config = {hostname: "JIRA_HOST_NAME", url: "JIRA_URL", jql: "JIRA JQL", fields: ["field1", "field2"], base64Auth: "0123456789"};
		jiraApiReader = new JiraApiReader(config, httpsMock);
		jiraApiReader.getIssues();
		expect(httpsMock.options.path).toEqual('JIRA_URL?jql=JIRA%20JQL&fields=field1,field2');
	});
});