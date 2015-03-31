var myleap = myleap || {};

myleap.components = (function() {

	/** ABSTRACT STRETCH BUTTON **/
	var AbstractStretchButton = function(basePosition, interactionPosition) {
		this.actionRange = 150;
		this.basePosition = basePosition;
		this.interactionPosition = interactionPosition;
		this.vector = interactionPosition - basePosition;		

		this.userAction = function() {};
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
			if (this.getBase().contains(point)) {
				var userVector = this.interactionPosition - point;
				var diffAngle = userVector.angle - this.vector.angle;
				console.log(diffAngle);
			}
		}
	};

	/** STRERCH BUTTON RECT **/
	var RectStretchButton = function(basePosition, baseSize, interactionPosition, interactionSize) {
		AbstractStretchButton.call(this, basePosition, interactionPosition);
		this.base = new paper.Path.Rectangle(basePosition, baseSize);
		this.base.fillColor = 'red';

		this.interact = new paper.Path.Rectangle(interactionPosition, interactionSize);
		this.interact.fillColor = 'purple';
	};

	RectStretchButton.prototype = Object.create(AbstractStretchButton.prototype);
	RectStretchButton.prototype = {
		getBase: function() {
			return this.base;
		},
		getInteract: function() {
			return this.interact;
		}
	}

	/** STRERCH BUTTON **/
	var StretchButton = function(x, y, width, height, right) {
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
	};

	StretchButton.prototype = {
		show : function() {
			this.active.visible = true;	
			this.passive.visible = true;
		},
		hide : function() {
			this.active.visible = false;	
			this.passive.visible = false;
		},
		setAction : function(_action) {
			this.userAction = _action;
		}, 
		getPositionFunc : function() {
			return this.right ? Math.min : Math.max;
		},
		readyForAction : function() {
			if (this.right) {
				return this.active.bounds.x <= this.actionRange;
			}
			else {
				return this.active.bounds.x >= this.actionRange;
			}
		},
		update : function(x_, y_) {	
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
		},
		reset : function() {
			this.moveActive = false;	
			this.active.bounds.x = this.initial.activeX;
		},
		action : function() {
			this.reset();
			this.userAction();
		}
	};
	
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
		StretchButton : StretchButton,
		RectStretchButton : RectStretchButton,
		MovingShape : MovingShape,
		StateIndicator : StateIndicator,
		Fence : Fence
	};

})();

