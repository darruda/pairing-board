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
	it("Should throw an error when no issue is informed on the constructor.", function() {
    	try {
    		new JiraApiReader();
    		throw new Error("The test must throw an error.")
    	} catch (error) {
    		expect(error.message).toEqual("You must inform an issue on the constructor.");
    		expect(error.name).toEqual("ArgumentException");
    	}
    });

    it("throw Should return all pairs from the issue.", function() {
    	var jira = new JiraApiReader(issue);
    	expect(jira.getPairs(issue)).toEqual([['ryan','bob', 'thomas'],['john','bran']]);
    });

    it("Should ignore null pair information.", function() {
    	var jira = new JiraApiReader(incompleteIssue);
    	expect(jira.getPairs(issue)).toEqual([['ryan','bob', 'thomas']]);
    });

	it("Should return the users information.", function() {
    	var jira = new JiraApiReader(issue);

    	var expectResult = [
    		{"id":"ryan", "name":"Ryan B.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=ryan&avatarId=1"},
			{"id":"bob", "name":"Bob G.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=bob&avatarId=2"},
			{"id":"thomas", "name":"Thomas T.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=thomas&avatarId=3"},
			{"id":"john", "name":"John Simpson","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=john&avatarId=4"},
			{"id":"bran", "name":"Brandon L.","imageUrl":"https://localhost/secure/useravatar?size=medium&ownerId=bran&avatarId=5"}
		];

    	expect(jira.getUsers()).toEqual(expectResult);
    });    
});