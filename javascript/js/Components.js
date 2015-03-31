var myleap = myleap || {};

myleap.components = (function() {

	/** ABSTRACT STRETCH BUTTON **/
	var AbstractStretchButton = function(basePosition, interactionLength, interactionAngle) {
		this.active = false;
		this._thresh = 20;
		this.actionRange = interactionLength;

		this.basePosition = basePosition;
		this.interactionAngle = interactionAngle;
		this.vector = new paper.Point(interactionLength, 0);
		this.vector.angle = interactionAngle;	
		this.interactionPosition = basePosition.add(this.vector);

		this.userAction = function() { console.log("ACTION"); };
	};

	AbstractStretchButton.prototype = {
		setVisible: function(visible) {
			this.getBase().visible = visible;
			this.getInteract().visible = visible;
		},
		show: function() {
			this.setVisible(true);
		},
		hide: function() {
			this.setVisible(false);			
		},
		setAction : function(_action) {
			this.userAction = _action;
		},
		update: function(point) {			
			if (this.getBounds().contains(point)) {
				this.active = true;

				var userVector = this.basePosition.subtract(point);	
				var distance = (userVector.project(this.vector).length - this.vector.length) + this._thresh;			
				var moveDistance = Math.max(0, distance);								
				var moveVector = this.vector.clone();
				moveVector.length = moveDistance;

				this.getInteract().position = this.interactionPosition.add(moveVector);
				this.getBounds().position = this.basePosition.add(moveVector);
				if (moveDistance > this.actionRange) {
					this.userAction();
					this.reset();
				}
			}
			else {
				this.reset();
			}			
		},
		reset : function() {
			this.getInteract().position = this.interactionPosition;
			this.getBounds().position = this.basePosition;
		}
	};

	/** STRERCH BUTTON RECT **/
	var RectStretchButton = function(basePosition, baseSize, interactionAngle) {
		AbstractStretchButton.call(this, basePosition, (baseSize.width/2), interactionAngle);
		this.base = new paper.Path.Rectangle(basePosition, baseSize);
		this.base.position = basePosition;
		this.base.fillColor = myleap.colors.stretchButton.base;		

		var interactionSize = new paper.Size(20, baseSize.height);
		this.interact = new paper.Path.Rectangle(this.interactionPosition, interactionSize);	
		this.interact.position = this.interactionPosition;
		this.interact.fillColor = myleap.colors.stretchButton.interact;

		this.base.rotate(this.vector.angle);
		this.interact.rotate(this.vector.angle);

		// debug
		this.debug = this.base.clone();				
		this.debug.fillColor = new paper.Color(0,0,0,0);
	};

	RectStretchButton.prototype = Object.create(AbstractStretchButton.prototype);
	RectStretchButton.prototype.getBase = function() {
		return this.base;
	}; 
	
	RectStretchButton.prototype.getInteract = function() {
		return this.interact;
	};

	RectStretchButton.prototype.getBounds = function() {
		return this.debug;
	}	
	
	/** MOVING SHAPE **/
	var MovingShape = function(shape) {
		shape.strokeWidth = 4;
		this.shape = shape;

		this._touchOffset = new paper.Point(0, 0);
	};

	const ZERO_POINT = new paper.Point(0, 0);

	MovingShape.prototype = {	
		contains : function(point) {
			return this.shape.contains(point);
		},
		updateTouch : function(point) {
			this.shape.strokeColor = 'black'
			if (this._touchOffset.x == 0 && this._touchOffset.y == 0) {
				this._touchOffset = this.shape.position.subtract(point);
			}
			this.shape.position.x = point.x + this._touchOffset.x;
			this.shape.position.y = point.y + this._touchOffset.y;
		},
		takeOff : function(point) {
			this.shape.strokeColor = 'white';
			this._touchOffset = ZERO_POINT;
		}
	};

	/** State indicator **/
	var StateIndicator = function(elementId) {
		this.elementId = elementId;		
	};

	StateIndicator.prototype = {
		setState : function(state) {
			this.clear();
			$("#" + this.elementId).children("#" + state).addClass("active");
		},
		clear : function() {
			$("#" + this.elementId).children(".state").each(function() {
				$(this).removeClass("active");
			});
		}
	};

	var Fence = function() {
		this.path = new paper.Path();
		this.path.strokeColor = "green";	
	};

	Fence.prototype = {
		addPost: function(paperPoint) {
			this.path.add(paperPoint);
			var post = new paper.Path.Circle(paperPoint, 10);
			post.fillColor = "green";
		}
	};

	return {
		RectStretchButton : RectStretchButton,
		MovingShape : MovingShape,
		StateIndicator : StateIndicator,
		Fence : Fence
	};

})();

myleap.colors = {
	stretchButton : {
		base : "#007CE8",
		interact : "#4DACFF"
	}
};