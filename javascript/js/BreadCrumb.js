const ACTIVE = 'active';

function BreadCrumb(config, frameMgr, infoComponent) {
	this.parentID = config['containerID'];	
	this.frameManager = frameMgr;
	this.infoComponent = infoComponent;
	this.currentIdx = 0;
	this.tiles = [];
};

BreadCrumb.prototype.addTile = function(tileConfig, _handlers) {
	var name = tileConfig['name'];
	var instruction = tileConfig['instruction'];

	var count = this.tiles.length;
	var item = $("<div />", {
		"class": "nav-item",
		text: name		
	});
	var parent = $("#" + this.parentID);
	parent.append(item);
	this.tiles[count] = {
		navigation : item,
		title: name,
		instruction : instruction,
		handlers : _handlers
	};
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

	this.infoComponent.setTitle(current.title);
	this.infoComponent.setText(current.instruction);
	this.frameManager.changeHandlers(current.handlers);
}

function InfoComponent(componentID) {
	this.componentID = componentID;	
};

InfoComponent.prototype = {
	setTitle: function(text) {				
		this._setContent("#" + this.componentID + " .title", text);
	},
	setText: function(text) {		
		this._setContent("#" + this.componentID + " .instruction-content", text);		
	},
	_setContent: function(selector, text) {		
		$(selector).html(text);
	}
};