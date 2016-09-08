const path = require('path');
const BREAK_LINE = require('os').EOL;
var Promise = require("bluebird");

function GitLogReader(execDir, childProcess) {
	var self = this;
	this.execDir = execDir;
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
			return null;;
		}

		return result[1];

	};

	this.getPairingInfo = function(message) {
		var result = message.match(PAIRING_REGEX);

		if (result == null) {
			return null;;
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
			var command = path.relative(execDir, "git").concat(" log --pretty=format:%s");
			if (since) {
				command = command.concat(" --since=", since.toISOString());
			}
			var t = self.childProcess.exec(command, (error, stdout, stderr) => {
				if (error) {
			    	console.error(stderr);
			    	reject(new Error("Error getting git log."))
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