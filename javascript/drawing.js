var canvasElement = document.getElementById("main-canvas");
var drawingWidth = canvasElement.offsetWidth;
var drawingHeight = canvasElement.offsetHeight;
canvasElement.width  = drawingWidth;
canvasElement.height = drawingHeight;

var infoParent = document.getElementById("info-parent");

var eventManager = new EventManager();

// var params = { width: drawingWidth, height: drawingHeight }
//var two = new Two(params).appendTo(canvasElement);
var fabricCanvas = new fabric.Canvas('main-canvas');

// var circle = two.makeCircle(100, 100, 15);
// circle.fill = '#7CFC00';
// circle.linewidth = 5;
// circle.noStroke();

var circle = new fabric.Circle({
  radius: 15, fill: 'green', left: 100, top: 100
});

// menu
var menu = new fabric.Rect({
  left: (drawingWidth / 2) - (100 / 2),
  top: 0,
  fill: 'red',
  width: 100,
  height: 50
});

eventManager.addShape(menu, 
{
	"enter" : function() { 
		var options = {        
        	duration: 1000
      	};
		menu.animate('scaleX', 2, options);
	},
	"exit" : function() { console.log("exits"); }
});
fabricCanvas.on('mouse:move', handleMouse);

fabricCanvas.add(menu);
fabricCanvas.add(circle);

// info boxes
var frameInfo = new InfoBox("Frame");
frameInfo.addInfo("FPS");
frameInfo.addInfo("Hands");
frameInfo.addInfo("Fingers");
frameInfo.addInfo("Pointables");
frameInfo.addToParent(infoParent);

var positionInfo = new InfoBox("Pointer");
positionInfo.addInfo("X");
positionInfo.addInfo("Y");
positionInfo.addToParent(infoParent);


//Leap.loop(handleFrame);

// canvasElement.addEventListener('mousemove', handleMouse);

function handleFrame(frame) {
	frameInfo.addValue("FPS", frame.currentFrameRate);
	frameInfo.addValue("Hands", frame.hands.length);
	frameInfo.addValue("Fingers", frame.fingers.length);
	frameInfo.addValue("Pointables", frame.pointables.length);

	if (frame.hands.length > 0) {
		var hand = frame.hands[0];
		var idxFinger = hand.indexFinger;
		var position = idxFinger.dipPosition;

		var normalizedPosition = frame.interactionBox.normalizePoint(position, true);
		canvasCoords = toCanvasCoords(normalizedPosition);

		// circle.translation.set(canvasCoords[0], canvasCoords[1]);
		// two.update();
		circle.set({left: canvasCoords[0], top: canvasCoords[1]});		
	}
}

function toCanvasCoords(normalizedPosition) {
	var canvasX = drawingWidth * normalizedPosition[0];
    var canvasY = drawingHeight * (1 - normalizedPosition[1]);

    return [canvasX, canvasY];
}

function handleMouse(event) {	
	var x = event.e.clientX;
	var y = event.e.clientY;

	positionInfo.addValue("X", x);
	positionInfo.addValue("Y", y);
	
	var point = new fabric.Point(x,y);
	if (menu.containsPoint(point)) {
		menu.set({fill: 'blue'});
	}
	else {
		menu.set({fill: 'red'});
	}

	eventManager.update(point);
	fabricCanvas.renderAll();
}