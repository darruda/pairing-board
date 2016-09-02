function PairingMap() { 
	this.map = [];

	this.addLink = function(source, target) {
		var link = this.getLink(source, target);
		if (link == undefined) {
			this.map.push({"source":source, "target":target, "pairings":1});
		} else {
			link.pairings = link.pairings + 1;
		}
		return link;
	}

	this.getLink = function(source, target) {
		var foundLink;
		this.map.some(function(link) {
			if ((link.source == source && link.target == target)
					||(link.source == target && link.target == source	)) {
				foundLink = link;
				return true;
			}
			return false;
		});
		return foundLink;
	}
}

module.exports = PairingMap;