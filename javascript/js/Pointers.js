var myleap = myleap || {};

myleap.pointers = (function(){
	/** Abstract Pointer **/
	var Pointer = function(canvasElement, drawPointer_) {
		this.drawingWidth = canvasElement.offsetWidth;
		this.drawingHeight = canvasElement.offsetHeight;
		this.frame = {};
		this.drawPointer = drawPointer_;

		this.defaultX = this.drawingWidth / 2;
		this.defaultY = this.drawingHeight / 2;
		this.defaultZ = 0.5;
	};

	Pointer.prototype = {
		createPoint : function() {
			if (this.drawPointer) {
				this.point = paper.Path.Circle(new paper.Point(this.drawingWidth/2, this.drawingHeight/2), 15);
				this.point.fillColor = 'blue';			
			}
		},
		toCanvasCoords : function(frame, referencePosition) {
			var normalizedPosition = frame.interactionBox.normalizePoint(referencePosition, true);
			var canvasX = this.drawingWidth * normalizedPosition[0];
		  var canvasY = this.drawingHeight * (1 - normalizedPosition[1]);

		  return [canvasX, canvasY, normalizedPosition[2]];
		},
		defaultPosition : function() {
			return [this.defaultX, this.defaultY, this.defaultZ];
		},
		fromFrame : function (frame) {
			var result = this.fromFrameInner(frame);
			this._updatePoint(result);
			return result;
		},
		_updatePoint : function(coords) {
			if (this.drawPointer) {
				this.point.position.x = coords[0];
				this.point.position.y = coords[1];
			}				
		}
	};

	//** Palm Pointer *//
	var PalmPointer = function(canvasElement, drawPointer) {
		Pointer.call(this, canvasElement, drawPointer);
	};
	PalmPointer.prototype = Object.create(Pointer.prototype);

	PalmPointer.prototype.fromFrameInner = function(frame) {
		if (frame.hands.length > 0) {
			var hand = frame.hands[0];				
			return this.toCanvasCoords(frame, hand.palmPosition);
		}
		return this.defaultPosition();
	};

	//** Finger Pointer **//
	var FingerPointer = function (canvasElement, drawPointer, fingerIndex) {
		Pointer.call(this, canvasElement, drawPointer);
		if (fingerIndex === undefined) {
			fingerIndex = 1;
		}
		this.fingerIndex = fingerIndex;
	};
	FingerPointer.prototype = Object.create(Pointer.prototype);

	FingerPointer.prototype.fromFrameInner = function(frame) {
		if (frame.hands.length > 0) {		
			var finger = frame.hands[0].fingers[this.fingerIndex];
			return this.toCanvasCoords(frame, finger.tipPosition);
		}
		return this.defaultPosition();
	};

	return {
		PalmPointer : PalmPointer,
		FingerPointer : FingerPointer
	};

})();