var myleap = myleap || {};

myleap.managers = (function() {

    /* FrameManager */
    var FrameManager = function(breadcrumb) {
        this.breadcrumb = breadcrumb;
        this.handlers = [];
        this.controller = {};
        this.running = false;
    };

    FrameManager.prototype.addHandler = function(handler) {
        var size = this.handlers.length;
        this.handlers[size] = handler;
    };

    FrameManager.prototype.initHanlders = function() {
        paper.project.activeLayer.removeChildren();
        this.handlers.forEach(function(handler) {
            handler.init();
        });
    };

    FrameManager.prototype.run = function() {
        var that = this;
        var contollerOptions = {
            enableGestures: true,
            frameEventName: "animationFrame"
        };

        this.controller = Leap.loop(contollerOptions, function(frame) {
            if (that.running) {
                that.handlers.forEach(function(handler) {
                    handler.handle(frame);
                });
                paper.view.draw();
            }
        });
    };

    FrameManager.prototype.changeHandlers = function(_handlers) {
        this.running = false;
        this.handlers = _handlers;
        this.initHanlders();
        this.running = true;
    };

    return {
    	FrameManager: FrameManager
    };

})();