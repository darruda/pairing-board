var JiraApiReader = require('../src/jira-api-reader.js');

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




describe("Test suite for the JIRA API Reader.", function() {
	var jira;
	beforeEach(function() {
		jira = new JiraApiReader();
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

	it("Should not add the same user more than once.", function() {
    	var expectResult = [
    		{"id":"ryan", "name":"Ryan B.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=ryan&avatarId=1"},
			{"id":"bob", "name":"Bob G.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=bob&avatarId=2"},
			{"id":"thomas", "name":"Thomas T.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=thomas&avatarId=3"},
			{"id":"john", "name":"John Simpson","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=john&avatarId=4"},
			{"id":"bran", "name":"Brandon L.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=bran&avatarId=5"}
		];

		jira.processIssue(issue);
		jira.processIssue(incompleteIssue);
    	expect(jira.getUsers()).toEqual(expectResult);
    });

    it("Should process all jira data.", function() {
    	var jiraData = {"expand": null, "startAt":0, "maxResults":50, "total":50, "issues":[issue, incompleteIssue]};
		expect(jira.processData(jiraData)).toEqual([['ryan','bob', 'thomas'],['john','bran'],['ryan','bob', 'thomas']]);
	});

});
