const ACTIVE = 'active';

function BreadCrumb(config, frameMgr) {
	this.parentID = config['containerID'];	
	this.frameManager = frameMgr;
	this.currentIdx = 0;
	this.tiles = [];
};

BreadCrumb.prototype.addTile = function(tileConfig, _handlers) {
	var name = tileConfig['name'];

	var count = this.tiles.length;
	var item = $("<div />", {
		"class": "nav-item",
		text: name
	});
	var parent = $("#" + this.parentID);
	parent.append(item);
	this.tiles[count] = {
		navigation : item,
		handlers : _handlers
	};

	this.update();
}

BreadCrumb.prototype.next = function() {
	if (this.currentIdx + 1 < this.tiles.length) {
		this.currentIdx++;
		this.update();
	}
}

BreadCrumb.prototype.previous = function() {
	if (this.currentIdx - 1 >= 0) {
		this.currentIdx--;
		this.update();
	}
}

BreadCrumb.prototype.update = function() {	
	this.tiles.forEach(function(tile) {
		tile.navigation.removeClass(ACTIVE)		
	});
	var current = this.tiles[this.currentIdx]
	current.navigation.addClass(ACTIVE);	
	this.frameManager.changeHandlers(current.handlers);
}