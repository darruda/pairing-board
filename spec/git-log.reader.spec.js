var GitLogReader = require('../src/git-log-reader.js');

describe("Test suite for the git log reader.", function() {

	var gitLogReader = new GitLogReader();	

	it("Should return null if the log information does not match with the regex pattern.", function() {
    	
    	var message = "No following pattern message";
    	expect(gitLogReader.getCommitMessage(message)).toBeNull();
    });
	
	it("Should return the message description from the commit log.", function() {
    	
    	var logInfo = "<CARD-123 [John, Bob] Create login page.><John Simpson><2016-09-03 17:35:56 -0700>";
    	expect(gitLogReader.getCommitMessage(logInfo)).toEqual("CARD-123 [John, Bob] Create login page.");
    });


	it("Should return null if the message does not match with the regex pattern.", function() {
    	var message = "Create login page.";
    	expect(gitLogReader.getPairingInfo(message)).toBeNull();
    });


	it("Should return the pairing information from the commit message.", function() {
    	
    	var message = "CARD-123 [John, Bob] Create login page.";
    	expect(gitLogReader.getPairingInfo(message)).toEqual("John, Bob");
    });
});