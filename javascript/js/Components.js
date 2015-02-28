###############
STRERCH BUTTON
###############

function StretchButton(x, y, width, height, right) {
	const RATIO = 0.3;
	const GAP = 2;
	const ACTION_RANGE = 150;
	var activeWidth = width * RATIO;
	var passiveWidth = width - activeWidth;
	this.moveActive = false;

	var actX = right ? x : passiveWidth + GAP;
	this.active = paper.Path.Rectangle(actX, y, activeWidth - GAP, height)
	this.active.fillColor = 'red';	

	var passiveX = right ? x + activeWidth : x;
	this.passive = paper.Path.Rectangle(passiveX, y, passiveWidth, height);
	this.passive.fillColor = 'red';

	this.initial = {
		activeX : actX,
		activeW : activeWidth,
		passiveX : passiveX
	};
	this.right = right;

	this.actionRange = right ? actX - ACTION_RANGE : actX + ACTION_RANGE;
	this.userAction = function() {};	
}

StretchButton.prototype.show = function() {
	this.active.visible = true;	
	this.passive.visible = true;
}

StretchButton.prototype.hide = function() {
	this.active.visible = false;	
	this.passive.visible = false;
}

StretchButton.prototype.setAction = function(_action) {
	this.userAction = _action;
}

StretchButton.prototype.getPositionFunc = function() {
	return this.right ? Math.min : Math.max;
}

StretchButton.prototype.readyForAction = function() {
	if (this.right) {
		return this.active.bounds.x <= this.actionRange;
	}
	else {
		return this.active.bounds.x >= this.actionRange;
	}
}

StretchButton.prototype.update = function(x_, y_) {	
	if (this.moveActive || this.active.bounds.contains(x_, y_)) {
		this.moveActive = true;		
		var positionFunc = this.getPositionFunc();
		this.active.bounds.x = positionFunc(this.initial.activeX, x_);

		if (y_ < this.active.bounds.y) {
			this.reset();
		}
		if (this.readyForAction()) {
			this.action();
		}
	}

}

StretchButton.prototype.reset = function() {
	this.moveActive = false;	
	this.active.bounds.x = this.initial.activeX;
}

StretchButton.prototype.action = function() {
	this.reset();
	this.userAction();
}