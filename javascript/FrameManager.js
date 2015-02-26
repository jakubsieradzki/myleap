function FrameManager(breadcrumb) {
	this.breadcrumb = breadcrumb;
	this.handlers = [];
	this.controller = {};
	this.running = false;
}

FrameManager.prototype.addHandler = function(handler) {
	var size = this.handlers.length;
	this.handlers[size] = handler;
}

FrameManager.prototype.initHanlders = function() {
	paper.project.activeLayer.removeChildren();
	this.handlers.forEach(function(handler) {
		handler.init();
	});
}

FrameManager.prototype.run = function() {
	var that = this;
	var contollerOptions = {
		enableGestures : true,
		frameEventName : "animationFrame"
	};	

	this.controller = Leap.loop(contollerOptions, function(frame) {
		if (that.running) {					
			that.handlers.forEach(function(handler) {
				handler.handle(frame);
			});
			paper.view.draw();
		}
	});
}

FrameManager.prototype.changeHandlers = function(_handlers) {
	this.running = false;
	this.handlers = _handlers;
	this.initHanlders();
	this.running = true;	
}

// ******
// UTILS
// ******

function Pointer(canvasElement, drawPointer_) {
	this.drawingWidth = canvasElement.offsetWidth;
	this.drawingHeight = canvasElement.offsetHeight;
	this.frame = {};
	this.drawPointer = drawPointer_;

	this.defaultX = this.drawingWidth / 2;
	this.defaultY = this.drawingHeight / 2;
	this.defaultZ = 0.5;
}

Pointer.prototype.createPoint = function() {
	if (this.drawPointer) {
		this.point = paper.Path.Circle(new paper.Point(this.drawingWidth/2, this.drawingHeight/2), 15);
		this.point.fillColor = 'blue';
	}
}

Pointer.prototype.toCanvasCoords = function(frame, referencePosition) {
	var normalizedPosition = frame.interactionBox.normalizePoint(referencePosition, true);
	var canvasX = this.drawingWidth * normalizedPosition[0];
  var canvasY = this.drawingHeight * (1 - normalizedPosition[1]);

  return [canvasX, canvasY, normalizedPosition[2]];
}

Pointer.prototype.fedFrame = function(frame) {
	this.frame = frame;
}

Pointer.prototype.defaultPosition = function() {
	return [this.defaultX, this.defaultY, this.defaultZ];
}

Pointer.prototype.fromFrame = function (frame) {
	var result = this.fromFrameInner(frame);
	if (this.drawPointer) {
		this.point.position.x = result[0];
		this.point.position.y = result[1];
	}	
	return result;
}

// ------------------ //
PalmPointer.prototype = Object.create(Pointer.prototype);
function PalmPointer(canvasElement, drawPointer) {
	Pointer.call(this, canvasElement, drawPointer);
}

PalmPointer.prototype.fromFrameInner= function(frame) {
	if (frame.hands.length > 0) {
		var hand = frame.hands[0];				
		var canvasCoords = this.toCanvasCoords(frame, hand.palmPosition);	
		return canvasCoords;	
	}
	return this.defaultPosition();
}

// ------------------ //
FingerPointer.prototype = Object.create(Pointer.prototype)
function FingerPointer(canvasElement, drawPointer) {
	Pointer.call(this, canvasElement, drawPointer);
}

FingerPointer.prototype.fromFrameInner = function(frame) {
	if (frame.hands.length > 0) {
		var hand = frame.hands[0];
		var finger = hand.indexFinger;		
		var canvasCoords = this.toCanvasCoords(frame, finger.tipPosition);	
		return canvasCoords;
	}
	return this.defaultPosition();
}

// *****************
// POINTER HANDLER
// *****************
function PointerHanlder(canvasElement) {
	this.drawingWidth = canvasElement.offsetWidth;
	this.drawingHeight = canvasElement.offsetHeight;
	this.pointers = [];
	this.colors = ['#7CFC00', '#E9FF1F', '#FC6E08', '#088AFC', '#BD00C7'];

	this.pointer = new FingerPointer(canvasElement, false);
}

PointerHanlder.prototype.init = function() {	
	for (i = 0; i < 5; i++) {
		this.pointers[i] = new paper.Path.Circle(new paper.Point(drawingWidth/2, drawingHeight/2), 15);
		this.pointers[i].fillColor = this.colors[i];
	}	
}

PointerHanlder.prototype.handle = function(frame) {	
	var that = this;

	if (frame.hands.length > 0) {
		var hand = frame.hands[0];		

		hand.fingers.forEach(function(finger) {			
			var canvasCoords = that.pointer.toCanvasCoords(frame, finger.tipPosition);	
			that.pointers[finger.type].position.x = canvasCoords[0];
			that.pointers[finger.type].position.y = canvasCoords[1];			
		});

		// var normalizedPosition = frame.interactionBox.normalizePoint(position, true);
		// canvasCoords = toCanvasCoords(normalizedPosition);
		
		// this.pointer.position.x = canvasCoords[0];
		// this.pointer.position.y = canvasCoords[1];
	}
}

// *****************
// INFO HANDLER
// *****************
function InfoHanlder(canvasElement) {
	this.drawingWidth = canvasElement.offsetWidth;
	this.drawingHeight = canvasElement.offsetHeight;

	var zero = new paper.Point(0, 0);
	this.FPSValue = new paper.PointText(zero);
	this.HandsValue = new paper.PointText(zero);
	this.FingersValue = new paper.PointText(zero);
	this.PointablesValue = new paper.PointText(zero);
	this.yawValue = new paper.PointText(zero);
	this.pitchValue = new paper.PointText(zero);
	this.rollValue = new paper.PointText(zero);
	this.handConfidence = new paper.PointText(zero);
}

InfoHanlder.prototype.init = function() {
	var that = this;

	var startX = 20;
	var startY = 25;
	var startPoint = new paper.Point(startX + 20, startY + 40)
	var gapX = 140;
	var gapY = 30;
	var textColor = '#0361A3';

	var fontSize = 20;

	// background shape
	var rectangle = new paper.Rectangle(startX, startY, 300, 450);
	var cornerSize = new paper.Size(20, 20);
	var background = new paper.Path.RoundRectangle(rectangle, cornerSize);
	background.fillColor = '#e9e9ff';
	background.strokeColor = 'black';

	// text
	var labels = [
		{'content' : 'FPS', 'value' : that.FPSValue},
		{'content' : 'Hands', 'value' : that.HandsValue},
		{'content' : 'Fingers', 'value' : that.FingersValue},
		{'content' : 'Pointables', 'value' : that.PointablesValue},
		{'content' : 'Confidence', 'value' : that.handConfidence},
		{'content' : 'Hand yaw', 'value' : that.yawValue},
		{'content' : 'Hand pitch', 'value' : that.pitchValue},
		{'content' : 'Hand roll', 'value' : that.rollValue}
	];
	for (i = 0; i < labels.length; i++) {
		var yPos = startPoint.y + i*gapY;
		var text = new paper.PointText(new paper.Point(startPoint.x, yPos));
		text.fillColor = textColor;
		text.content = labels[i]['content'];
		text.fontSize = fontSize;
		text.fontWeight = 'bold';

		labels[i]['value'].position.x = startPoint.x + gapX;
		labels[i]['value'].position.y = yPos;				
		labels[i]['value'].fontSize = fontSize;
		labels[i]['value'].fillColor = textColor;
		labels[i]['value'].content = ":";
		labels[i]['value'].insertAbove(background);
	}
	
}

InfoHanlder.prototype.handle = function(frame) {
	var split = ":  "
	this.FPSValue.content = split + frame.currentFrameRate;
	this.HandsValue.content = split + frame.hands.length;
	this.FingersValue.content = split + frame.hands.length;
	this.PointablesValue.content = split + frame.pointables.length;
	if (frame.hands.length > 0) {
		this.handConfidence.content = split + frame.hands[0].confidence.toFixed(3);
		this.yawValue.content = split + frame.hands[0].yaw().toFixed(3);
		this.pitchValue.content = split + frame.hands[0].pitch().toFixed(3);
		this.rollValue.content = split + frame.hands[0].roll().toFixed(3);
	}
}

// *****************
// NAVIGATION HANDLER
// *****************

function NavigationHandler(canvasElement, navigator_, pointer_) {
	this.drawingWidth = canvasElement.offsetWidth;
	this.drawingHeight = canvasElement.offsetHeight;
	this.arrowWidth = 180;
	this.arrowHeight = 100;	

	this.navigator = navigator_;
	this.pointer = pointer_;	
}

NavigationHandler.prototype.init = function() {
	var that = this;
	this.pointer.createPoint();
			
	var arrowX = this.drawingWidth - this.arrowWidth;
	var arrowY = this.drawingHeight - this.arrowHeight;

	this.right = new StretchButton(arrowX, arrowY, this.arrowWidth, this.arrowHeight, true);	
	this.right.setAction(function() {
		that.navigator.next();
	});

	this.left = new StretchButton(0, arrowY, this.arrowWidth, this.arrowHeight, false);	
	this.left.setAction(function() {
		that.navigator.previous();
	});
}

NavigationHandler.prototype.handle = function(frame) {
	var that = this;		

	if (frame.hands.length > 0) {
		var canvasCoords = this.pointer.fromFrame(frame);
		var x_ = canvasCoords[0];
		var y_ = canvasCoords[1];
		// if (this.drawPointer) {
		// 	that.palmPoint.position.x = x_;
		// 	that.palmPoint.position.y = y_;
		// }

		this.right.update(x_, y_);
		this.left.update(x_, y_);
	}
}

// *****************
// TouchHandler
// *****************

function TouchHandler(pointer_) {
	this.pointer = pointer_;
	this.initSize = 20;
	this.maxSize = 150;
}

TouchHandler.prototype.init = function() {
	this.indexTip = paper.Path.Circle(new paper.Point(0, 0), this.initSize);
	this.indexTip.fillColor = 'red';
	// this.indexTip.strokeColor = 'blue';
	this.pointer.createPoint();
}

TouchHandler.prototype.handle = function(frame) {
	if (frame.hands.length > 0) {
		var coords = this.pointer.fromFrame(frame);
		var x = coords[0];
		var y = coords[1];
		var z = coords[2];

		this.indexTip.position.x = x;
		this.indexTip.position.y = y;
		var currentSize = this.indexTip.bounds.width / 2;
		var target = z * this.maxSize;
		if (target > 0) {
			this.indexTip.scale(target / currentSize);
			var color = target < this.initSize ? 'red' : 'blue';
			var alpha = (1 - z) > 0.6 ? (1 - z) : 0;
			this.pointer.point.fillColor = color;
			this.indexTip.fillColor.alpha = alpha;
		}
	}
}

// COMPONENTS 

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