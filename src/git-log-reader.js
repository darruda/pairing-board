const BREAK_LINE = require('os').EOL;
var Promise = require("bluebird");

function GitLogReader(repositoryPath, childProcess) {
	var self = this;
	this.repositoryPath = repositoryPath;
	if (childProcess) {
		this.childProcess = childProcess;
	} else {
		this.childProcess = require('child_process');
	}

	var MESSAGE_REGEX = new RegExp("<(.+)><(.+)><(.+)>");
	var PAIRING_REGEX = "\\[([\\w\\s,]+)\\]";

	this.getCommitMessage = function(logInfo) {
		var result = logInfo.match(MESSAGE_REGEX);
		if (result == null) {
			return null;
		}

		return result[1];

	};

	this.getPairingInfo = function(message) {
		var result = message.match(PAIRING_REGEX);

		if (result === null) {
			return null;
		}

		return result[1];
	};

	this.getCollaborators = function(message) {
		var pairingInfo = this.getPairingInfo(message);

		if (!pairingInfo) {
			return [];
		}

		return pairingInfo.split(',').map((collaborator) => {
			return collaborator.trim();
		});
	};

	this.getLogs = function(since) {
		return new Promise(function (resolve, reject) {
			var command = "git".concat(" --git-dir=", repositoryPath, " log master --pretty=format:%s");
			if (since) {
				command = command.concat(" --since=", since.toISOString());
			}
			self.childProcess.exec(command, (error, stdout, stderr) => {
				if (error) {
			    	reject(new Error("Error on getting git log: " + error.message));
			  	} else {
			  		resolve(stdout);
			  	}
			});
		});
	};

	this.getPairs = function(since) {
		return this.getLogs(since).then(function(logs) {
			var messages = logs.split(BREAK_LINE);

			var pairs = messages.map(function(message) {
				return self.getCollaborators(message);
			}).filter(function(pair) {
				return pair.length;
			});

			return pairs;
		});
	};
};

module.exports = GitLogReader;
