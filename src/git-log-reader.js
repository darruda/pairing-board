const path = require('path');
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

	this.getLog = function() {
		return new Promise(function (resolve, reject) {
			var t = self.childProcess.exec(path.relative(execDir, "git") + " log --pretty=format:%s", (error, stdout, stderr) => {
				if (error) {
			    	console.error(stderr);
			    	reject(new Error("Error getting git log."))
			  	} else {
			  		resolve(stdout);
			  	}
			});
		});
	};
};

module.exports = GitLogReader;