function Core() {
	const self = this;

	this.splitGroup = function(group) {
		const remainingGroup = group.slice().reverse();
		const splitPairs = [];

		while (remainingGroup.length > 1) {
	    	var pairDriver = remainingGroup.pop();

	    	remainingGroup.forEach(function(pairObserver) {
	    		splitPairs.push([pairDriver, pairObserver]);
	        });
    	}
        return splitPairs;
	};

	this.calculatePairs = function(pairs) {
		let calculatedPairs = [];
		pairs.forEach(function(pair) {
			if (pair.length > 2) {
				var newPairs = self.splitGroup(pair);
				calculatedPairs = calculatedPairs.concat(newPairs);
			} else if (pair.length === 2) {
				calculatedPairs.push(pair);
			}
		});

		return calculatedPairs;
	}
}

module.exports = Core;
