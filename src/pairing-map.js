const Core = require('./core-functions.js');
const _ = require('underscore');

function PairingMap() {
	const self = this;
	this.map = [];
	this.collaborators = [];
	const core = new Core();

	this.addLink = function(source, target) {
		var link = this.getLink(source, target);
		if (link === undefined) {
			this.map.push({"source":source, "target":target, "pairings":1});
		} else {
			link.pairings = link.pairings + 1;
		}
		return link;
	};

	this.getLink = function(source, target) {
		return _.find(this.map, function(link) {
			return (self.compare(link.source, source) && self.compare(link.target, target))
				   || (self.compare(link.source, target) && self.compare(link.target, source));

		});
	};

	this.compare = function(element1, element2) {
		return element1.localeCompare(element2, 'pt-BR', {sensitivity: 'base'}) === 0;
	};

	this.addCollaborator = function(id, name, imageUrl, group) {
		if (!id) {
			throw new Error("ID cannot be null.");
		}

		let index = this.getIndex(id);
		if (index === -1) {
			index = this.collaborators.length;
			var multipleIds = Array.isArray(id) ? id : [id];
			this.collaborators.push({"id":multipleIds, "name": name, "imageUrl":imageUrl, "group":group});
		}
		return index;
	}

	this.updateCollaborator = function(id, data) {
		const collaborator = this.getCollaborator(id);
		if (!collaborator) {
			const error = new Error("Cannot find the collaborator.");
			error.name = "CollaboratorNotFoundException";
			throw error;
		}

		for (key in data) {
			if (key !== "id") {
				collaborator[key] = data[key];
			}
		}

		return true;
	};

	this.getIndex = function(searchId) {
		let index = -1;
		for (let i = 0; i < this.collaborators.length; i++) {
			const collaborator = this.collaborators[i];

			if (collaborator.id.some(id => self.compare(id, searchId))) {
				index = i;
				break;
			}
		}

		return index;
	};

	this.getCollaborator = function(id) {
		let collaborator;
		const index = this.getIndex(id);

		if (index !== -1) {
			collaborator = this.collaborators[index];
		}
		return collaborator;
	};

	this.addPairs = function(pairs) {
	    core.calculatePairs(pairs).forEach(function(pair) {
	      self.addLink(pair[0], pair[1]);
	    });
	};

	this.build = function() {
		const nodes = [];
		const links = [];

		this.map.forEach(function(link) {
			const sourceIndex = self.addCollaborator(link.source, link.source, null, 1);
			const targetIndex = self.addCollaborator(link.target, link.target, null, 1);

			links.push({"source":sourceIndex,"target":targetIndex,"pairings":link.pairings});
		});

		this.collaborators.forEach(function(collaborator) {
			nodes.push({"id": collaborator.id, "name": collaborator.name, "group": collaborator.group, "imageUrl": collaborator.imageUrl});
		});

		return {"nodes":nodes,"links":links};
	}
}

module.exports = PairingMap;
