var PairingMap = require('../src/pairing-map.js');

describe("Link beetween people checking", function() {

	it("Should add a new pairing link.", function() {
    	var pairingMap = new PairingMap();
    	pairingMap.addLink('john', 'bob');
    	expect(pairingMap.map.length).toBe(1);
    });

	it("Should return a link by the pair.", function() {
	    var pairingMap = new PairingMap();
    	pairingMap.addLink('john', 'bob');
    	var link = pairingMap.getLink('john', 'bob');
    	expect(link).toBeDefined();
    	expect(link.source).toEqual("john");
    	expect(link.target).toEqual("bob");
    });

    it("Should return a link by the pair even on reverse order.", function() {
    	var pairingMap = new PairingMap();
    	pairingMap.addLink('john', 'bob');
    	var link = pairingMap.getLink('bob', 'john');
    	expect(link).toBeDefined();
    });

    it("Link should be create with pairing counter.", function() {
    	var pairingMap = new PairingMap();
    	pairingMap.addLink('john', 'bob');
    	var link = pairingMap.getLink('bob', 'john');
    	expect(link.pairings).toBe(1);
    });

    it("Should increment pairing counting for the same pair formation.", function() {
    	var pairingMap = new PairingMap();
    	pairingMap.addLink('john', 'bob');
    	pairingMap.addLink('bob', 'john');
    	pairingMap.addLink('john', 'bob');
    	var link = pairingMap.getLink('bob', 'john');
    	expect(link.pairings).toBe(3);
    });

    it("ID comparison should be non case sensitive.", function() {
        var pairingMap = new PairingMap();
        expect(pairingMap.compare('John', 'john')).toBeTruthy();
    });
});

describe("Collaborator features.", function() {
    it("Pairing Map should be created with no collaborators.", function() {
        var pairingMap = new PairingMap();
        expect(pairingMap.collaborators.length).toBe(0);
    });

    it("Should not allow to add a collaborator with null ID.", function(done) {
        var pairingMap = new PairingMap();
        try {
            pairingMap.addCollaborator(undefined);
            done(new Error("The test must throw an error."));
        } catch(e) {
            expect(e.message).toEqual("ID cannot be null.");
            done();
        }
    });

    it("Should return the collaborator index on for added collaborator.", function() {
        var pairingMap = new PairingMap();
        pairingMap.addCollaborator('john');

        expect(pairingMap.addCollaborator('roy')).toBe(1);
    });

    it("Should return the current collaborator index when collaborator is already added.", function() {
        var pairingMap = new PairingMap();
        pairingMap.addCollaborator('john');
        pairingMap.addCollaborator('roy');
        pairingMap.addCollaborator('bran');

        expect(pairingMap.addCollaborator('bran')).toBe(2);
    });

    it("Should return collaborator index by ID.", function() {
        var pairingMap = new PairingMap();
        pairingMap.addCollaborator('john');

        expect(pairingMap.getIndex('john')).toBe(0);
    });

    it("Collaborator ID should not be case sensitive.", function() {
        var pairingMap = new PairingMap();
        pairingMap.addCollaborator('john');

        expect(pairingMap.getIndex('JOHN')).toBe(0);
    });

    it("Should return -1 as the index when the collaborator is not found.", function() {
        var pairingMap = new PairingMap();
        pairingMap.addCollaborator('john');

        expect(pairingMap.getIndex('roy')).toBe(-1);
    });

    it("A collaborator with multiple IDs should be sought by any one of its ID.", function() {
        var pairingMap = new PairingMap();
        pairingMap.addCollaborator(['john', 'John S']);

        expect(pairingMap.getIndex('john')).toBe(0);
        expect(pairingMap.getIndex('John S')).toBe(0);
    });

    it("Should return the collaborator by ID.", function() {
        var pairingMap = new PairingMap();
        pairingMap.addCollaborator('john', 'John Simpson', 'http://localhost/avatar/simpson.jpg', 1);

        expect(pairingMap.getCollaborator('john')).toEqual({'id':['john'],'name':'John Simpson', 'imageUrl':'http://localhost/avatar/simpson.jpg', 'group':1});
    });

    it("Should throw an error when try to update a non existing collaborator.", function() {
        var pairingMap = new PairingMap();
        try {
            pairingMap.updateCollaborator('john', {"group": 4});
            throw new Error("Test must fail.");
        } catch (e) {
            expect(e.message).toEqual("Cannot find the collaborator.");
            expect(e.name).toEqual("CollaboratorNotFoundException");
        }
    });

    it("Should update the collaborator group.", function() {
        var pairingMap = new PairingMap();
        pairingMap.addCollaborator("john", "John Simpson", "http://localhost/avatar/simpson.jpg", 1);
        pairingMap.updateCollaborator('john', {"group": 4});

        expect(pairingMap.collaborators[0]).toEqual({"id": ['john'], "name": 'John Simpson', "imageUrl": 'http://localhost/avatar/simpson.jpg', "group": 4});
    });

    it("Should not update the collaborator ID.", function() {
        var pairingMap = new PairingMap();
        pairingMap.addCollaborator("john", "John Simpson", "http://localhost/avatar/simpson.jpg", 1);
        pairingMap.updateCollaborator('john', {"id": "j123"});

        expect(pairingMap.collaborators[0]).toEqual({"id": ['john'], "name": 'John Simpson', "imageUrl": 'http://localhost/avatar/simpson.jpg', "group": 1});
    });

});

describe("Generate data to UI.", function() {
    it("Should build the pairing map.", function() {
        var pairingMap = new PairingMap();
        pairingMap.map = [
            {"source":"john", "target":"bran", "pairings":1},
            {"source":"roy", "target":"bran", "pairings":2}
        ];
        pairingMap.addLink('John', 'bob');

        var expectValue = {
          "nodes": [
            {"id":["john"], "name": "john", "group": 1, "imageUrl": null},
            {"id":["bran"], "name": "bran", "group": 1, "imageUrl": null},
            {"id":["roy"], "name": "roy", "group": 1, "imageUrl": null},
            {"id":["bob"], "name": "bob", "group": 1, "imageUrl": null}
          ],
          "links": [
            {"source": 0, "target": 1, "pairings": 1},
            {"source": 2, "target": 1, "pairings": 2},
            {"source": 0, "target": 3, "pairings": 1},
            ]
        };

        expect(pairingMap.build()).toEqual(expectValue);
    });
});

describe("Add pairing information to the pairing map.", function() {
    var pairingMap;
    beforeEach(function() {
        pairingMap = new PairingMap();
    });

    it("Should create links from the pairs.", function() {
        pairingMap.addPairs([["bob", "ryan"],["john","ryan"],["bran","roy","bob"]]);
        expect(pairingMap.map.length).toBe(5);
    });
});
