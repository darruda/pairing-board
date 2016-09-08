var GitLogReader = require('../src/git-log-reader.js');

describe("Git commit messages tests.", function() {

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

    it("Should return a blank array if there no pairing match on the commit message.", function() {
		var message = "CARD-000 Revert access control feature.";
    	expect(gitLogReader.getCollaborators(message)).toEqual([]);
    });

    it("Should extract the collaborators from the pairing information.", function() {
    	var message = "CARD-123 [John, Bob] Create login page.";
    	expect(gitLogReader.getCollaborators(message)).toEqual(["John", "Bob"]);
    });
});


describe("Get logs from git command line tests.", function() {

	var fakeChildProcess = new function() {
		this.content;
		this.sucess;
		this.command;
		this.args;

		this.createSucessExec = function(stout) {
			this.content = stout;
			this.sucess = true;
		};

		this.exec = function(command, callback) {
			this.command = command;

			if (this.sucess) {
				callback(null, this.content, null);
			} else {
				callback(new Error("Error processing."), null, this.content);
			}
		};
	};

	var gitLogReader;
	beforeEach(function() {
	    gitLogReader = new GitLogReader(".git", fakeChildProcess);
	});
	 

	it("Should return the logs content.", function(done) {
    	var stout = "[Diego] Add get collaborators method to the git log reader.\n" +
					"[Diego] Create git log reader module.\n" +
					"[Diego] Add update collaborator capability.\n" +
					"[Diego] Add more informations about the collaborators and pairing on the graph.\n" +
					"[Diego] Create Jira API Reader to provide pairing information from Jira-API.\n" +
					"[Diego] Create the JSON builder to be used as the input for the graph on UI.\n" +
					"[Diego] Create core functions to handle the pairs information.\n" +
					"[Diego] Add install/running informations to project README.\n" +
					"[Diego] Create pairing-map object.\n" +
					"[Diego] Create repository.\n";
		
		fakeChildProcess.createSucessExec(stout);
		
		gitLogReader.getLogs().then(function(output) {
	    	expect(fakeChildProcess.command).toBe("git --git-dir=.git log master --pretty=format:%s");
	    	expect(output).toBe(stout);
	    	done();
    	});
    });

    it("Should return the pairing information from the git log.", function(done) {
    	var stout = "[John, Bob] A good commit message.\n" +
					"[Bran, Thomas] A good commit message.\n" +
					"[Ryan, John, Bob] A good commit message.\n" +
					"Merge from some branch to master.\n" +
					"[Donna, Bob] A good commit message.\n" +
					"[Eddy, Lisa] A good commit message.\n" +
					"[Lisa, Bran] A good commit message.\n" +
					"A message which does not follow the pattern.\n" +
					"[John, Bob] A good commit message.\n";
		
		fakeChildProcess.createSucessExec(stout);
		gitLogReader.getPairs().then(function(output) {
			var expectResult = [
				["John", "Bob"],
				["Bran", "Thomas"],
				["Ryan", "John", "Bob"],
				["Donna", "Bob"],
				["Eddy", "Lisa"],
				["Lisa", "Bran"],
				["John", "Bob"]
			];
			
	    	expect(output).toEqual(expectResult);
	    	done();
    	});
    });

    it("Should filter pairing infromation by date.", function(done) {
    	fakeChildProcess.createSucessExec("Any log information");
		
		var date = new Date(Date.UTC(2016, 8, 7));
		gitLogReader.getPairs(date).then(function(output) {
	    	expect(fakeChildProcess.command).toEqual("git --git-dir=.git log master --pretty=format:%s --since=2016-09-07T00:00:00.000Z");
	    	done();
    	});
    });
});