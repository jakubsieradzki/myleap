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
FingerPointer.prototype = Object.create(Pointer.prototype);
function FingerPointer(canvasElement, drawPointer, getFingerFunction) {
	Pointer.call(this, canvasElement, drawPointer);
	if (getFingerFunction === undefined) {
		getFingerFunction = function(frame) {
			return frame.hands[0].indexFinger;
		}
	}
	this.getFingerFunction = getFingerFunction;
}

FingerPointer.prototype.fromFrameInner = function(frame) {
	if (frame.hands.length > 0) {		
		var finger = this.getFingerFunction(frame);		
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

	this.right = new myleap.components.StretchButton(arrowX, arrowY, this.arrowWidth, this.arrowHeight, true);	
	this.right.setAction(function() {
		that.navigator.next();
	});

	this.left = new myleap.components.StretchButton(0, arrowY, this.arrowWidth, this.arrowHeight, false);	
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
	this.events = {};
	this.figures = [];
}

TouchHandler.prototype.init = function() {	
	var that = this;

	var addFigure = function(figure) {
		figure.strokeWidth = 4;		
		figure.fillColor = 'purple';
		that.figures[that.figures.length] = new myleap.components.MovingShape(figure);	
	}

	// add figure
	addFigure(new paper.Path.Rectangle(100, 100, 150, 100));
	addFigure(new paper.Path.Circle(100, 300, 75));	

	this.indexTip = paper.Path.Circle(new paper.Point(0, 0), this.initSize);
	this.indexTip.fillColor = 'red';	
	this.pointer.createPoint();

	
	this.events["touch"] = function(event) {		
		that.figures.forEach(function(figure) {
			if (figure.shape.contains(event.point)) {				
				figure.selected = true;
				figure.shape.strokeColor = 'black'
				
				if (figure.offset.x == 0 && figure.offset.y == 0) {
					figure.offset = figure.shape.position.subtract(event.point);
				}
				figure.shape.position.x = event.point.x + figure.offset.x;
				figure.shape.position.y = event.point.y + figure.offset.y;				
			}
		});		
	};

	this.events["take-off"] = function() {
		that.figures.forEach(function(figure) {
			figure.shape.strokeColor = 'white';
			figure.offset = new paper.Point(0, 0);
		});
	};
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

		var color = 'blue';
		var scale = 1.0;
		var alpha = 1 - z;
		if (target > 0) {			
			scale = target / currentSize;			
		}		

		var touched = target < this.initSize;
		var point = new paper.Point(x, y);
		if (touched) {
			color = 'red'
			this.figures.forEach(function(figure) {
				if (figure.contains(point)) {
					figure.updateTouch(point);
				}
			});		
		} else {
			this.figures.forEach(function(figure) { 				
				if (figure.contains(point)) {
					figure.takeOff(point); 
				}
			});				
		}
		this.pointer.point.fillColor = color;
		this.indexTip.scale(scale);
		this.indexTip.fillColor.alpha = alpha;
	}
}

// *****************
// Grab Handler
// *****************

function GrabHandler(canvasElement, _pointer) {
	this.drawingWidth = canvasElement.offsetWidth;
	this.drawingHeight = canvasElement.offsetHeight;

	this.pointer = _pointer;
}

GrabHandler.prototype.init = function() {
	var fontSize = 25;
	this.grabText = new paper.PointText(new paper.Point(5, fontSize));
	this.grabText.fontSize = fontSize;
	this.grabText.content = "Grab strength";	

	// figures
	var shape = new paper.Path.Rectangle(100, 100, 150, 150);
	shape.fillColor = 'purple';	
	this.box = new myleap.components.MovingShape(shape);

	// pointer
	this.pointer.createPoint();
}

GrabHandler.prototype.handle = function(frame) {
	if (frame.hands.length > 0) {
		var hand = frame.hands[0];
		var grabS = hand.grabStrength.toPrecision(2);
		this.grabText.content = grabS;
		var coords = this.pointer.fromFrame(frame);
		var point = new paper.Point(coords[0], coords[1]);
		if (grabS > 0.8) {			
			this.onGrab(point);
			if (this.box.contains(point)) {
				this.box.updateTouch(point);
			}
		} else {
			this.onRelease(point);
			if (this.box.contains(point)) {
				this.box.takeOff(point);
			}
		}
	}
}

GrabHandler.prototype.onGrab = function(point) {
	this.pointer.point.fillColor = 'red';
}

GrabHandler.prototype.onRelease = function(point) {
	this.pointer.point.fillColor = 'blue';
}

var myleap = myleap || {};
myleap.handlers = (function() {
	var getThumb = function(frame) {
		return frame.hands[0].thumb;
	}

	var PinchHandler = function(canvasElement, _pointer) {
		this.pointer = _pointer;
		this.thumbPointer = new FingerPointer(canvasElement, true, getThumb)

		this.scaleRange = 0.4;
		this.scaleMin = 1 - (this.scaleRange / 2);
		this.scaling = false;
		this.enterFactor = 0;
	};

	PinchHandler.prototype = {
		init : function() {
			// waldo picture
			this.image = new paper.Raster("waldo-image");
			this.image.position = paper.view.center;
			console.log(this.image.size.width);

			this.baseSize = this.image.getBounds().width;

			// pinch strngth text 
			var fontSize = 25;
			this.pinchText = new paper.PointText(new paper.Point(5, fontSize));
			this.pinchText.fontSize = fontSize;

			// thumb pointer
			this.thumbPointer.createPoint();
			this.thumbPointer.point.fillColor = 'yellow';

			// index pointer
			this.pointer.createPoint();
		},
		handle : function(frame) {
			if (frame.hands.length < 1) {
				return;
			}
			var hand = frame.hands[0];
			var thumb = hand.thumb;
			var pinchStrength = hand.pinchStrength.toPrecision(2);
			var indexCoords = this.pointer.fromFrame(frame);
			var thumbCoords = this.thumbPointer.fromFrame(frame);

			if (thumbCoords[2] < 0.3) {
				if (!this.scaling) {
					this.scaling = true;
					this.enterFactor = pinchStrength;
				}
				
				var factor = 1 - (this.enterFactor - pinchStrength);
				this.pinchText.content = factor;

				// factor = (factor * this.scaleRange) + this.scaleMin;
				var targetWidth = this.baseSize * factor;
				var scaleFactor = targetWidth / this.image.getBounds().width;						
				this.image.scale(scaleFactor);		
			} else {
				this.scaling = false;
				this.baseSize = this.image.getBounds().width;
			}			

			// this.pinchText.content = pinchStrength;
		}
	};

	return {
		PinchHandler : PinchHandler
	};
})();
