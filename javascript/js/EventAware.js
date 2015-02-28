function EventAwareShape(shape, events) {
	this.shape = shape;
	this.inside = false;
	this.events = events;
};

EventAwareShape.prototype.isInside = function() {
	return this.inside;
};

EventAwareShape.prototype.setInside = function(inside) {
	this.inside = inside;
};

EventAwareShape.prototype.fireEvent = function(eventToFire) {
	if (eventToFire in this.events) {
		this.events[eventToFire]();
	}
};

EventAwareShape.prototype.s = function() {
	return this.shape;
};



function EventManager() {
	this.shapes = [];	
};

EventManager.prototype.addShape = function(shape, events) {
	this.shapes[this.shapes.length] = new EventAwareShape(shape, events);
};

EventManager.prototype.update = function(point) {
	var that = this;
	that.shapes.forEach(function(element) {
		that.entryExit(point, element);		
	});
};

EventManager.prototype.entryExit = function(point, element) {
	if (element.s().containsPoint(point) && !element.isInside()) {
		element.fireEvent("enter");
		element.setInside(true);
	}
	else if (!element.s().containsPoint(point) && element.isInside()) {
		element.fireEvent("exit");	
		element.setInside(false);
	}
};
