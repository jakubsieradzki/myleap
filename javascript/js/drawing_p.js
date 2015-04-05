// var frameInfo = new InfoBox("Frame");
var canvasElement = document.getElementById("main-canvas");
var drawingWidth = canvasElement.offsetWidth;
var drawingHeight = canvasElement.offsetHeight;

$(function() {
	canvasElement.width  = drawingWidth;
	canvasElement.height = drawingHeight;

	paper.setup(canvasElement);

	var infoParent = document.getElementById("info-parent");

	var eventManager = new EventManager();

	var frameManager = new myleap.managers.FrameManager(breadCrumb);
	frameManager.run();

	var breadCrumb = new BreadCrumb({'containerID': "breadcrumb-container"}, frameManager);

	// context
	var htmlContext = {
		canvasElement : canvasElement
	};

	// pointers
	var fingerPointerVisible = new myleap.pointers.FingerPointer(canvasElement, true);	
	var fingerPointer = new myleap.pointers.FingerPointer(canvasElement, false);
	var palmPointer = new myleap.pointers.PalmPointer(canvasElement, true);
	var toolPointer = new myleap.pointers.ToolPointer(canvasElement, true);

	// handlers
	var infoH = new myleap.handlers2.InfoHandler(htmlContext, palmPointer, breadCrumb);
	var fingersH = new myleap.handlers2.FingersHandler(htmlContext, fingerPointer, breadCrumb);
	var grabH2 = new myleap.handlers2.GrabHandler(htmlContext, palmPointer, breadCrumb);
	var touchH2 = new myleap.handlers2.TouchHandler(htmlContext, fingerPointerVisible, breadCrumb);
	var pinchH2 = new myleap.handlers2.PinchHandler(htmlContext, fingerPointerVisible, breadCrumb);
	var toolsH2 = new myleap.handlers2.ToolsHandler(htmlContext, toolPointer, breadCrumb);


	breadCrumb.addTile({'name' : 'INFO'}, [infoH]);
	breadCrumb.addTile({'name' : 'FINGERS'}, [fingersH]);
	breadCrumb.addTile({'name' : 'RANGE'}, [touchH2]);
	breadCrumb.addTile({'name' : 'GRAB'}, [grabH2]);
	breadCrumb.addTile({'name' : 'PINCH'}, [pinchH2]);
	breadCrumb.addTile({'name' : 'TOOLS'}, [toolsH2]);
	// breadCrumb.addTile({'name' : 'HAND STATE'}, [bothHandsH]);

	breadCrumb.update();	
})


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
