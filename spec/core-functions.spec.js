

var Core = require('../src/core-functions.js');

describe("Core Functions suite.", function() {

	var pairingMatrix = [
		['john', 'bob'],
		['john', 'ken'],
		['bran', 'roy'],
		['ken', 'roy'],
		['bob', 'john', 'bran']
	];
	var core = new Core();

	it("Should split group into pairs.", function() {
    	var group = ['bob', 'john', 'bran'];
    	expect(core.splitGroup(group)).toEqual([['bob','bran'], ['bob', 'john'],['john','bran']]);
    });
	
	it("Should ignore pairless entries.", function() {
    	var pairs = [
			['john'],
			['john', 'ken'],
			['bran'],
			['ken', 'roy']
		];
    	expect(core.calculatePairs(pairs).length).toBe(2);
    });

    it("Should merge group entries.", function() {
    	var pairs = [
			['john', 'bob'],
			['john', 'ken'],
			['bob', 'john', 'bran']
		];
    	expect(core.calculatePairs(pairs).length).toBe(5);
    });

    it("Should return all pairing formation.", function() {
		var rawInput = [
			['john', 'bob'],
			['john'],
			['john', 'ken'],
			['bran', 'roy'],
			['roy'],
			['ken', 'roy'],
			['bob', 'john', 'bran']
		];

		var expectMap = [
			['john', 'bob'],
			['john', 'ken'],
			['bran', 'roy'],
			['ken', 'roy'],
			['bob', 'bran'],
			['bob', 'john'],
			['john', 'bran']
		];
    	expect(core.calculatePairs(rawInput)).toEqual(expectMap);
    });
});