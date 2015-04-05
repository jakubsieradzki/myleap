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

        this.userAction = function() {
            console.log("ACTION");
        };
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
        setAction: function(_action) {
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
            } else {
                this.reset();
            }
        },
        reset: function() {
            this.getInteract().position = this.interactionPosition;
            this.getBounds().position = this.basePosition;
        }
    };

    /** STRERCH BUTTON RECT **/
    var RectStretchButton = function(basePosition, baseSize, interactionAngle) {
        AbstractStretchButton.call(this, basePosition, (baseSize.width / 2), interactionAngle);
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
        this.debug.fillColor = new paper.Color(0, 0, 0, 0);
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
        contains: function(point) {
            return this.shape.contains(point);
        },
        updateTouch: function(point) {
            this.shape.strokeColor = 'black'
            if (this._touchOffset.x == 0 && this._touchOffset.y == 0) {
                this._touchOffset = this.shape.position.subtract(point);
            }
            this.shape.position.x = point.x + this._touchOffset.x;
            this.shape.position.y = point.y + this._touchOffset.y;
        },
        takeOff: function(point) {
            this.shape.strokeColor = 'white';
            this._touchOffset = ZERO_POINT;
        }
    };

    /** State indicator **/
    var StateIndicator = function(elementId) {
        this.elementId = elementId;
    };

    StateIndicator.prototype = {
        setState: function(state) {
            this.clear();
            $("#" + this.elementId).children("#" + state).addClass("active");
        },
        clear: function() {
            $("#" + this.elementId).children(".state").each(function() {
                $(this).removeClass("active");
            });
        }
    };

    var Fence = function() {
        this.paths = [];
        this.posts = [];
        this.path = new paper.Path();
        this.path.strokeColor = "green";
    };

    Fence.prototype = {
        addPost: function(paperPoint) {
            var post = new paper.Path.Circle(paperPoint, 10);
            post.fillColor = "green";
            this.posts[this.posts.length] = post;
        },
        addSegment: function(paperPoint) {
            this.path.add(paperPoint);
        },
        newPath: function() {
            this.paths[this.paths.length] = this.path;
            this.path = new paper.Path();
            this.path.strokeColor = "green";
        },
        clear: function() {
            for (path in this.paths) {
                this.paths[path].remove();
            }
            for (post in this.posts) {
                this.posts[post].remove();
            }
            this.paths = [];
        }
    };

    /** Context menu **/
    var ContextMenu = function(options) {
        this.options = options;
        this.buttons = [];

    };

    ContextMenu.prototype = {
        setVisible: function(visible) {
            for (button in this.buttons) {
                button.visible = visible;
            }
        },
        show: function(point) {
            // var baseAngle = 90 / this.options.length;
            // var position = new paper.Point(50, 0);       
            // var size = new paper.Size(50, 100);
            // for (i = 0; i < this.options.length; i++) {          
            //  var firstPoint = point.add(position);
            //  var button = new myleap.components.RectStretchButton(point.add(position), size, -45);
            //  this.buttons[this.buttons.length] = button;
            //  var copy = firstPoint.clone();
            //  copy.rotate(-90, point);
            //  var buttonTwo = new myleap.components.RectStretchButton(point.add(copy), size, -135);
            // }    
            // this.setVisible(true);
        },
        hide: function() {
            this.setVisible(false);
        }
    };

    /* Navigation Component */
    var NavigationComponent = function(canvasElement, navigator) {
        this.arrowWidth = 180;
        this.arrowHeight = 100;

        var arrowX = canvasElement.offsetWidth - this.arrowWidth / 2;
        var arrowY = canvasElement.offsetHeight - this.arrowHeight / 2;

        var rightPosition = new paper.Point(arrowX, arrowY);
        var leftPosition = new paper.Point(this.arrowWidth / 2, arrowY);
        var arrowSize = new paper.Size(this.arrowWidth, this.arrowHeight);

        this.right = new myleap.components.RectStretchButton(rightPosition, arrowSize, 180);
        this.right.setAction(function() {
            navigator.next();
        });

        this.left = new myleap.components.RectStretchButton(leftPosition, arrowSize, 0);
        this.left.setAction(function() {
            navigator.previous();
        });
    };

    NavigationComponent.prototype.update = function(point) {
        this.right.update(point);
        this.left.update(point);
    };

    var HandStateComponent = function(canvasElement, left) {
        var that = this;
        this.stateIndicator = new myleap.components.StateIndicator("state-indicator");
        this.left = left;
        this.lastState = "";
        this.events = {
            "hand-opened": {
                apply: function(hand) {
                    return hand.grabStrength < 0.5;
                },
                updateState: function() {
                    that.stateIndicator.setState("hand-opened");
                },
                fire: function(frame) {},
                once: function(frame) {},
                group: "hand"
            },
            "hand-closed": {
                apply: function(hand) {
                    return hand.grabStrength >= 0.5;
                },
                updateState: function() {
                    that.stateIndicator.setState("hand-closed");
                },
                fire: function(frame) {},
                once: function(frame) {},
                group: "hand"
            }
        };
    };

    HandStateComponent.prototype = {
        update : function(frame) {
            var hand = this.left ? myleap.utils.getLeftHand(frame) : getRightHand(frame);
            if (hand === undefined) {
                this.stateIndicator.clear();
                return;
            }           
            for (eventName in this.events) {
                var event = this.events[eventName];
                if (event.apply(hand)) {
                    event.updateState();
                    event.fire(frame);
                    if (this.lastState != eventName) {
                        event.once(frame);
                    }
                    this.lastState = eventName;                 
                }
            }
        },
        setFunction : function(eventName, callback) {
            if (eventName in this.events) {
                this.events[eventName].fire = callback;
            }
        },
        setFunctionOnce : function(eventName, callback) {
            if (eventName in this.events) {
                this.events[eventName].once = callback;
            }
        }
    };

    return {
        RectStretchButton: RectStretchButton,
        MovingShape: MovingShape,
        StateIndicator: StateIndicator,
        Fence: Fence,
        NavigationComponent: NavigationComponent,
        HandStateComponent: HandStateComponent,
        ContextMenu: ContextMenu
    };

})();

myleap.colors = {
    stretchButton: {
        base: "#007CE8",
        interact: "#4DACFF"
    }
};