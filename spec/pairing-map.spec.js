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
	
  
});