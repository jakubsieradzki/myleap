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

	var frameManager = new FrameManager(breadCrumb);
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

	// handlers
	var infoH = new myleap.handlers2.InfoHandler(htmlContext, palmPointer, breadCrumb);
	var fingersH = new myleap.handlers2.FingersHandler(htmlContext, fingerPointer, breadCrumb);


	
	// var infoH = new InfoHanlder(canvasElement);
	var visibleNavigationH = new NavigationHandler(canvasElement, breadCrumb, fingerPointerVisible);
	var navigationH = new NavigationHandler(canvasElement, breadCrumb, fingerPointer);
	var pointerH = new PointerHanlder(canvasElement);
	var touchH = new TouchHandler(fingerPointerVisible)
	var grabH = new GrabHandler(canvasElement, new myleap.pointers.PalmPointer(canvasElement, true));
	var pinchH = new myleap.handlers.PinchHandler(canvasElement, fingerPointerVisible);
	var toolsH = new myleap.handlers.ToolsHandler(canvasElement);
	var handStateH = new myleap.handlers.HandStateHandler(canvasElement, true);
	var bothHandsH = new myleap.handlers.BothHandsHanlder(canvasElement);

	breadCrumb.addTile({'name' : 'FINGERS'}, [fingersH]);
	breadCrumb.addTile({'name' : 'INFO'}, [infoH]);
	breadCrumb.addTile({'name' : 'GRAB'}, [grabH, new NavigationHandler(canvasElement, breadCrumb, palmPointer)]);
	breadCrumb.addTile({'name' : 'RANGE'}, [touchH, navigationH]);
	breadCrumb.addTile({'name' : 'PINCH'}, [pinchH, navigationH]);
	breadCrumb.addTile({'name' : 'TOOLS'}, [toolsH, navigationH]);
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
