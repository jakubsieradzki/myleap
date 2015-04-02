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
    }
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

    FingersHandler.prototype.init = function() {
        for (i = 0; i < 10; i++) {
            this.pointers[i] = new paper.Path.Circle(new paper.Point(drawingWidth / 2, drawingHeight / 2), 15);
            this.pointers[i].fillColor = this.colors[i % 5];
        }
    };

    FingersHandler.prototype.handle = function(frame) {
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


    /* Objects */
    return {
        InfoHandler: InfoHandler,
        FingersHandler: FingersHandler
    };
})();