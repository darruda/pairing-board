function GitLogReader() {
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

};

module.exports = GitLogReader;