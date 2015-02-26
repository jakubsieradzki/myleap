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

	// pointers
	var fingerPointerVisible = new FingerPointer(canvasElement, true);	
	var fingerPointer = new FingerPointer(canvasElement, false);	

	// handlers
	var infoH = new InfoHanlder(canvasElement);
	var visibleNavigationH = new NavigationHandler(canvasElement, breadCrumb, fingerPointerVisible);
	var navigationH = new NavigationHandler(canvasElement, breadCrumb, fingerPointer);
	var pointerH = new PointerHanlder(canvasElement);
	var touchH = new TouchHandler(fingerPointerVisible)

	breadCrumb.addTile({'name' : 'RANGE'}, [touchH, navigationH]);
	breadCrumb.addTile({'name' : 'INFO'}, [visibleNavigationH, infoH]);
	breadCrumb.addTile({'name' : 'BASIC'}, [navigationH, pointerH]);
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
