// var frameInfo = new InfoBox("Frame");
var canvasElement = document.getElementById("main-canvas");
var drawingWidth = canvasElement.offsetWidth;
var drawingHeight = canvasElement.offsetHeight;

$(function() {
	canvasElement.width  = drawingWidth;
	canvasElement.height = drawingHeight;

	paper.setup(canvasElement);	

	var frameManager = new myleap.managers.FrameManager(breadCrumb);
	frameManager.run();

	var infoComponent = new InfoComponent('instruction-container');
	var breadCrumb = new BreadCrumb({'containerID': "breadcrumb-container"}, frameManager, infoComponent);

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
	var controlH = new myleap.handlers2.ControlHandler(htmlContext, palmPointer, breadCrumb);

	// instructions
	var controlInstruction = $('#intructions-text #control').html();
	var infoInstruction = $('#intructions-text #info').html();
	var fingersInstruction = $('#intructions-text #fingers').html();
	var rangeInstruction = $('#intructions-text #range').html();
	var grabInstruction = $('#intructions-text #grab').html();
	var pinchInstruction = $('#intructions-text #pinch').html();
	var toolsInstruction = $('#intructions-text #tools').html();


	breadCrumb.addTile({'name' : 'Info', 'instruction' : infoInstruction}, [infoH]);
	breadCrumb.addTile({'name' : 'Fingers', 'instruction' : fingersInstruction}, [fingersH]);
	breadCrumb.addTile({'name' : 'Range', 'instruction' : rangeInstruction}, [touchH2]);
	breadCrumb.addTile({'name' : 'Grab', 'instruction' : grabInstruction}, [grabH2]);
	breadCrumb.addTile({'name' : 'Pinch', 'instruction' : pinchInstruction}, [pinchH2]);
	breadCrumb.addTile({'name' : 'Control', 'instruction' : controlInstruction}, [controlH]);
	breadCrumb.addTile({'name' : 'Tools', 'instruction' : toolsInstruction}, [toolsH2]);	

	breadCrumb.update();

	$('.nav-item').on('click', function(event) {
		var index = $(event.target).index();		
		breadCrumb.set(index);
		paper.view.draw();
	});
})