var myleap = myleap || {};

myleap.utils = {
	_getHand : function(frame, left) {
		var handResult = undefined;
		frame.hands.forEach(function(hand) {
			if (left ? hand.type === "left" : hand.type === "right") {
				handResult = hand;
			}				
		});
		return handResult;
	},
	getLeftHand : function(frame) {
		return this._getHand(frame, true);
	},
	getRightHand : function(frame) {
		return this._getHand(frame, false);
	},
	getAnyHand : function(frame) {
		var right = this.getRightHand(frame);
		if (right === undefined) {
			return this.getLeftHand(frame);
		}
		return right;
	}

};