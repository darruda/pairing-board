function JiraApiReader() {
	var self = this;
	var users = [];
	var pairs = [];

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

	function addUserInfo(jiraUser) {
		if (!users.some(user => user.id == jiraUser.key)) {
			users.push({"id": jiraUser.key, "name": jiraUser.displayName,"imageUrl": jiraUser.avatarUrls["32x32"]});
		}
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

}

module.exports = JiraApiReader;