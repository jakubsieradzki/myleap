var myleap = myleap || {};

myleap.pointers = (function(){
	/** Abstract Pointer **/
	var Pointer = function(canvasElement, drawPointer_, left_) {
		this.drawingWidth = canvasElement.offsetWidth;
		this.drawingHeight = canvasElement.offsetHeight;
		this.frame = {};
		this.drawPointer = drawPointer_;
		this.left = (typeof left_ === 'undefined') ? false : left_;

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
	var FingerPointer = function (canvasElement, drawPointer, fingerIndex, left_) {
		Pointer.call(this, canvasElement, drawPointer, left_);
		if (fingerIndex === undefined) {
			fingerIndex = 1;
		}
		this.fingerIndex = fingerIndex;
	};
	FingerPointer.prototype = Object.create(Pointer.prototype);

	FingerPointer.prototype.fromFrameInner = function(frame) {
		var hand = myleap.utils._getHand(frame, this.left);
		if (hand === undefined) {
			return this.defaultPosition();
		}		
		var finger = hand.fingers[this.fingerIndex];
		return this.toCanvasCoords(frame, finger.tipPosition);			
	};

	//** Tool Pointer **//
	var ToolPointer = function(canvasElement, drawPointer) {
		Pointer.call(this, canvasElement, drawPointer);

		var that = this;

		this.contextMenu = new myleap.components.ContextMenu([1]);
		this.lastZone = "";
		this.transitions = {
			"touch": {
				from: "touching",
				to: "hovering",
				action: function() { console.log("TOOL TOUCH"); }
			}
		};
	};
	ToolPointer.prototype = Object.create(Pointer.prototype);

	ToolPointer.prototype.fromFrameInner = function(frame) {
		if (frame.tools.length > 0) {
			var that = this;
			var tool = frame.tools[0];
			
			// console.log("last: " + this.lastZone);
			// console.log("current: " + tool.touchZone);
			for (trName in this.transitions) {
				tr = this.transitions[trName];
				if (tr.from == this.lastZone && tr.to == tool.touchZone) {
					tr.action();
				}
			}
			this.lastZone = tool.touchZone;

			return that.toCanvasCoords(frame, tool.stabilizedTipPosition);			
		}
		return this.defaultPosition();
	};

	ToolPointer.prototype.setAction = function(actionName, callback) {
		if (actionName in this.transitions) {
			this.transitions[actionName].action = callback;
		}
	};

	return {
		PalmPointer : PalmPointer,
		FingerPointer : FingerPointer,
		ToolPointer : ToolPointer
	};

})();