var myleap = myleap || {};
myleap.handlers2 = (function() {
    /** ABSTRACT _handleR**/
    var AbstractHandler = function(htmlContext, pointer) {
        this.canvasElement = htmlContext.canvasElement;
        this.pointer = pointer;
        this.currentPoint = new paper.Point(0, 0);
    };
    AbstractHandler.prototype.init = function() {
        this._init();
        this.pointer.createPoint();
    };
    AbstractHandler.prototype.handle = function(frame) {
        this._handle(frame);
    };

    /* NAVIGABLE HANDLER */
    var NavigableHandler = function(htmlContext, pointer, navigator) {
        AbstractHandler.call(this, htmlContext, pointer);
        this.navigator = navigator;
    }

    NavigableHandler.prototype = Object.create(AbstractHandler.prototype);
    NavigableHandler.prototype.init = function() {
        this.navigationComponent = new myleap.components.NavigationComponent(this.canvasElement, this.navigator);
        AbstractHandler.prototype.init.apply(this);
    }

    NavigableHandler.prototype.handle = function(frame) {
        AbstractHandler.prototype.handle.call(this, frame);
        var coords = this.pointer.fromFrame(frame);
        this.navigationComponent.update(new paper.Point(coords[0], coords[1]));
    }

    /** INFO HANDLER**/
    var InfoHandler = function(htmlContext, pointer, navigator) {
        NavigableHandler.call(this, htmlContext, pointer, navigator);

        this.drawingWidth = this.canvasElement.offsetWidth;
        this.drawingHeight = this.canvasElement.offsetHeight;
        var zero = new paper.Point(0, 0);
        this.FPSValue = new paper.PointText(zero);
        this.HandsValue = new paper.PointText(zero);
        this.FingersValue = new paper.PointText(zero);
        this.PointablesValue = new paper.PointText(zero);
        this.yawValue = new paper.PointText(zero);
        this.pitchValue = new paper.PointText(zero);
        this.rollValue = new paper.PointText(zero);
        this.handConfidence = new paper.PointText(zero);
    };
    InfoHandler.prototype = Object.create(NavigableHandler.prototype);
    InfoHandler.prototype._init = function() {
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
        var labels = [{
            'content': 'FPS',
            'value': that.FPSValue
        }, {
            'content': 'Hands',
            'value': that.HandsValue
        }, {
            'content': 'Fingers',
            'value': that.FingersValue
        }, {
            'content': 'Pointables',
            'value': that.PointablesValue
        }, {
            'content': 'Confidence',
            'value': that.handConfidence
        }, {
            'content': 'Hand yaw',
            'value': that.yawValue
        }, {
            'content': 'Hand pitch',
            'value': that.pitchValue
        }, {
            'content': 'Hand roll',
            'value': that.rollValue
        }];
        for (i = 0; i < labels.length; i++) {
            var yPos = startPoint.y + i * gapY;
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
    };
    InfoHandler.prototype._handle = function(frame) {
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
    };

    /* NavigationHandler */
    var FingersHandler = function(htmlContext, pointer, navigator) {
        NavigableHandler.call(this, htmlContext, pointer, navigator);

        this.pointers = [];
        this.colors = ['#7CFC00', '#E9FF1F', '#FC6E08', '#088AFC', '#BD00C7'];
    };

    FingersHandler.prototype = Object.create(NavigableHandler.prototype);
    FingersHandler.prototype._init = function() {
        for (i = 0; i < 10; i++) {
            this.pointers[i] = new paper.Path.Circle(new paper.Point(drawingWidth / 2, drawingHeight / 2), 15);
            this.pointers[i].fillColor = this.colors[i % 5];
        }
    };

    FingersHandler.prototype._handle = function(frame) {
        var that = this;
        // hide pointers for hands that are not visible
        for (ptr in this.pointers) {
            this.pointers[ptr].position.x = -100;
            this.pointers[ptr].position.y = -100;
        }
        if (frame.hands.length > 0) {
            for (handIdx in frame.hands) {
                var hand = frame.hands[handIdx];
                hand.fingers.forEach(function(finger) {
                    var canvasCoords = that.pointer.toCanvasCoords(frame, finger.tipPosition);
                    var pointerIdx = finger.type + (5 * handIdx);
                    that.pointers[pointerIdx].position.x = canvasCoords[0];
                    that.pointers[pointerIdx].position.y = canvasCoords[1];
                });
            }
        }
    };

    /* GrabHandler */
    var GrabHandler = function(htmlContext, pointer, navigator) {
        NavigableHandler.call(this, htmlContext, pointer, navigator);
    };

    GrabHandler.prototype = Object.create(NavigableHandler.prototype);
    GrabHandler.prototype._init = function() {
        this.grabThresh = 0.7;

        var fontSize = 25;
        this.grabText = new paper.PointText(new paper.Point(5, fontSize));
        this.grabText.fontSize = fontSize;
        this.grabText.content = "Grab strength";

        // figures
        var shape = new paper.Path.Rectangle(100, 100, 150, 150);
        shape.fillColor = 'purple';
        this.box = new myleap.components.MovingShape(shape);
    };

    GrabHandler.prototype._handle = function(frame) {
        if (frame.hands.length > 0) {
            var hand = frame.hands[0];
            var grabS = hand.grabStrength.toPrecision(2);
            this.grabText.content = grabS;
            var coords = this.pointer.fromFrame(frame);
            var point = new paper.Point(coords[0], coords[1]);
            if (grabS > this.grabThresh) {
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
    };

    GrabHandler.prototype.onGrab = function(point) {
        this.pointer.point.fillColor = 'red';
    }

    GrabHandler.prototype.onRelease = function(point) {
        this.pointer.point.fillColor = 'blue';
    }

    /* TouchHandler */
    var TouchHandler = function(htmlContext, pointer, navigator) {
        NavigableHandler.call(this, htmlContext, pointer, navigator);

        this.initSize = 20;
        this.maxSize = 150;
        this.events = {};
        this.figures = [];
    };

    TouchHandler.prototype = Object.create(NavigableHandler.prototype);

    TouchHandler.prototype._init = function() {
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
    };

    TouchHandler.prototype._handle = function(frame) {
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
    };

    /* PinchHandler */
    var PinchHandler = function(htmlContext, pointer, navigator) {
        NavigableHandler.call(this, htmlContext, pointer, navigator);

        this.thumbPointer = new myleap.pointers.FingerPointer(canvasElement, true, 0)
        this.palmPointer = new myleap.pointers.PalmPointer(canvasElement, true);

        this.scaleRange = 0.6;
        this.scaleMin = 1 - (this.scaleRange / 2);
        this.scaling = false;
        this.enterFactor = 0;
        this.imageId = "waldo-image";
    };

    PinchHandler.prototype = Object.create(NavigableHandler.prototype);

    PinchHandler.prototype._init = function() {
        // waldo picture
        this.image = new paper.Raster(this.imageId);
        this.image.position = paper.view.center;
        this.movingImage = new myleap.components.MovingShape(this.image);

        this.baseSize = this.image.getBounds().width;

        // pinch strngth text 
        var fontSize = 25;
        this.pinchText = new paper.PointText(new paper.Point(5, fontSize));
        this.pinchText.fontSize = fontSize;

        // thumb pointer
        this.thumbPointer.createPoint();
        this.thumbPointer.point.fillColor = 'yellow';

        // palm pointer
        this.palmPointer.createPoint();
    };

    PinchHandler.prototype._handle = function(frame) {
        if (frame.hands.length < 1) {
            return;
        }
        var hand = frame.hands[0];
        var thumb = hand.thumb;
        var pinchStrength = hand.pinchStrength.toPrecision(2);
        var indexCoords = this.pointer.fromFrame(frame);
        var thumbCoords = this.thumbPointer.fromFrame(frame);
        this.palmPointer.fromFrame(frame);

        var action = this._getAction(hand);
        action.showCursor();
        if (thumbCoords[2] < 0.3) {
            action.inAction(hand);
        } else {
            action.outAction(hand);
        }
    };

    PinchHandler.prototype._handlePinchIn = function(hand) {
        var pinchStrength = hand.pinchStrength;
        var context = this.context;
        if (!context.scaling) {
            context.scaling = true;
            context.enterFactor = pinchStrength;
        }

        var factor = context.enterFactor - pinchStrength;
        // normalize
        factor = (factor + 1.0) / (2.0);
        // to range
        factor = (factor * context.scaleRange) + context.scaleMin;

        // factor = (factor * this.scaleRange) + this.scaleMin;
        var targetWidth = context.baseSize * factor;
        var scaleFactor = targetWidth / context.image.getBounds().width;
        var palmPosition = context.palmPointer.fromFrame(hand.frame);
        context.image.scale(scaleFactor, new paper.Point(palmPosition[0], palmPosition[1]));
    };

    PinchHandler.prototype._handlePinchOut = function(hand) {
        this.context.scaling = false;
        this.context.baseSize = this.context.image.getBounds().width;
    };

    PinchHandler.prototype._pinchCursor = function() {
        this.context.pointer.point.visible = true;
        this.context.thumbPointer.point.visible = true;
        this.context.palmPointer.point.visible = false;
    };

    PinchHandler.prototype._handleFreeHandIn = function(hand) {
        var palmCoords = this.context.palmPointer.fromFrame(hand.frame);
        var point = new paper.Point(palmCoords[0], palmCoords[1]);
        if (this.context.movingImage.shape.contains(point)) {
            this.context.movingImage.updateTouch(point);
        }
    };

    PinchHandler.prototype._handleFreeHandOut = function(hand) {
        this.context.movingImage.takeOff(new paper.Point(0, 0))
    };

    PinchHandler.prototype._freeHandCursor = function() {
        this.context.pointer.point.visible = false;
        this.context.thumbPointer.point.visible = false;
        this.context.palmPointer.point.visible = true;
    };

    PinchHandler.prototype._getAction = function(hand) {
        var that = this;
        var extendedCount = 0;
        hand.fingers.forEach(function(finger) {
            if (finger.extended) {
                extendedCount++;
            }
        });
        if (extendedCount <= 2) {
            return {
                context: that,
                inAction: that._handlePinchIn,
                outAction: that._handlePinchOut,
                showCursor: that._pinchCursor
            };
        } else {
            return {
                context: that,
                inAction: that._handleFreeHandIn,
                outAction: that._handleFreeHandOut,
                showCursor: that._freeHandCursor
            };
        }
    };

    /* ToolsHandler */
    var ToolsHandler = function(htmlContext, pointer, navigator) {
        NavigableHandler.call(this, htmlContext, pointer, navigator);

        this.stateHandler = new myleap.components.HandStateComponent(canvasElement, true);
    }

    ToolsHandler.prototype = Object.create(NavigableHandler.prototype);
    ToolsHandler.prototype._init = function() {
        var that = this;

        this.fence = new myleap.components.Fence();

        this.stateHandler.setFunction("hand-closed", function(frame) {
            var coords = that.pointer.fromFrame(frame);
            that.fence.addSegment(new paper.Point(coords[0], coords[1]));
        });
        this.stateHandler.setFunctionOnce("hand-closed", function(frame) {
            var coords = that.pointer.fromFrame(frame);
            that.fence.addPost(new paper.Point(coords[0], coords[1]));
        });
        this.stateHandler.setFunctionOnce("hand-opened", function(frame) {
            var coords = that.pointer.fromFrame(frame);
            that.fence.addPost(new paper.Point(coords[0], coords[1]));
            that.fence.newPath();
        });

        this.pointer.setAction("touch", function() {
            that.fence.clear();
        });
    };

    ToolsHandler.prototype._handle = function(frame) {
        this.stateHandler.update(frame);
    };

    /* ControlHandler */
    var ControlHandler = function(htmlContext, pointer, navigator) {
        NavigableHandler.call(this, htmlContext, pointer, navigator);

        this.maxLength = 200;
        this.maxSpeed = 15;
    };

    ControlHandler.prototype = Object.create(NavigableHandler.prototype);

    ControlHandler.prototype._init = function() {
        var hor = new paper.Path();
        var ver = new paper.Path();

        this.dirs = {
            "horizontal": hor,
            "vertical": ver
        };

        var intialPoint = new paper.Point(-10, -10);
        for (dir in this.dirs) {
            var dirPath = this.dirs[dir];
            dirPath.strokeColor = 'red';
            dirPath.strokeWidth = 4;
            dirPath.add(intialPoint);
            dirPath.add(intialPoint);
        }

        this.controlRect = new paper.Path.Rectangle(intialPoint, new paper.Size(50, 50));
        this.controlRect.fillColor = 'purple';
        this.controlRect.position = intialPoint;
    };

    ControlHandler.prototype._handle = function(frame) {
        var hand = myleap.utils.getAnyHand(frame);
        if (hand === undefined) {
            return;
        }

        var point = this.pointer.toPoint2D(frame);
        var pitch = hand.pitch();
        var roll = hand.roll();

        this._updateRectangle(point, pitch, roll);
        this._updateDirections(this.controlRect.position, pitch, roll);
    };

    ControlHandler.prototype._updateDirections = function(point, pitch, roll) {
        var verticalValue = pitch * this.maxLength;
        var horizontalValue = -(roll * this.maxLength);

        for (dir in this.dirs) {
            var dirPath = this.dirs[dir];
            dirPath.firstSegment.point = point;
        }
        this.dirs["horizontal"].lastSegment.point = new paper.Point(point.x + horizontalValue, point.y);        
        this.dirs["vertical"].lastSegment.point = new paper.Point(point.x, point.y + verticalValue);
    };

    ControlHandler.prototype._updateRectangle = function(point, pitch, roll) {
        var horizontalValue = -(roll * this.maxSpeed);
        var verticalValue = pitch * this.maxSpeed;

        this.controlRect.position.x += horizontalValue;
        this.controlRect.position.y += verticalValue;
    };



    /* Objects */
    return {
        InfoHandler: InfoHandler,
        FingersHandler: FingersHandler,
        GrabHandler: GrabHandler,
        TouchHandler: TouchHandler,
        PinchHandler: PinchHandler,
        ToolsHandler: ToolsHandler,
        ControlHandler: ControlHandler
    };
})();