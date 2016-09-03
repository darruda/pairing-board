function JiraApiReader(issue) {
	
	if (!issue) {
		var error = new Error("You must inform an issue on the constructor.");
		error.name = "ArgumentException";
		throw error;
	}

	var users = [];
	var pairs = [];

	appendWorkStream(issue.fields.customfield_10073); // Developers
	appendWorkStream(issue.fields.customfield_10074); // QAs

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
	}
}

module.exports = JiraApiReader;