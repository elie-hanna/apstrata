dojo.provide("apstrata.widgets.SlidingPanel")

dojo.require("dijit.layout._LayoutWidget")
dojo.require("dojo.fx.easing");

dojo.declare("apstrata.widgets.SlidingPanel", [dijit.layout._LayoutWidget], {
	visibleWidth: 10,		// pixels visible when the panel is closed
	attach: "top",			// the attach parameter determines where the panel is attached in the browser window, 
							//  values include: top|left|right|bottom
	offsetFromCenter: 0, 				// offsetFromCenter from the default left for (top|bottom) or top for (left|right)

	constructor: function() {
		this.baseClass = "SlidingPanel" 	// base CSS class attached to the Pabel

		this._open = false
	},
	
	postCreate: function() {
		var self = this

		// Setup the basic animation for hiding/showing the Panel
		this._animation = {
			node: self.domNode,
			easing: dojo.fx.easing.bounceOut,
			duration: 200,
			onEnd: function() {
			}
		}

		// The panel will be opened when the mouse is over it
		dojo.connect(this.domNode, "onmouseover", function() {
			self.open()
		})

		// The panel will be closed when the mouse is away
		dojo.connect(this.domNode, "onmouseout", function() {
			self.close()
		})
		
		// This widget is always positionned in absolute coordinates around the browser window
		dojo.style(this.domNode, {
			position: "absolute"
		})

		this.inherited(arguments)
	},
	
	startup: function() {
		dojo.style(this.domNode, {visibility: "visible"})

		this.inherited(arguments)
	},
	
	// Reposition widget if the browser window is resized
	layout: function() {
		var self = this
		
		// Calculate center positions
		var w = dijit.getViewport()
		var centerLeft = (w.w - self._contentBox.w) / 2
		var centerTop = (w.h - self._contentBox.h) / 2

		self._pos = {}

		// Decide where to reposition top/left based on the attach property
		switch (this.attach) {
			case "left":
				self._pos.top = centerTop + self.offsetFromCenter
				self._pos.left = 0
				self._pos.slideTop = centerTop  + self.offsetFromCenter
				self._pos.slideLeft = self.visibleWidth - self._contentBox.w
				break;
			case "right":
				self._pos.top = centerTop + self.offsetFromCenter
				self._pos.left = w.w - self._contentBox.w
				self._pos.slideTop = centerTop + self.offsetFromCenter
				self._pos.slideLeft = w.w - self.visibleWidth
				break;
				
			case "bottom":
				self._pos.top = w.h - self._contentBox.h
				self._pos.left = centerLeft + self.offsetFromCenter 
				self._pos.slideTop = w.h - self.visibleWidth
				self._pos.slideLeft = centerLeft + self.offsetFromCenter
				break;
				
			default:
				self._pos.top = 0
				self._pos.left = centerLeft + self.offsetFromCenter
				self._pos.slideTop = self.visibleWidth - self._contentBox.h
				self._pos.slideLeft = centerLeft + self.offsetFromCenter
		}

		dojo.style(this.domNode, {
			"top": self._pos.slideTop + "px",
			"left": self._pos.slideLeft + "px"
		})

		if (this._open) this.open(); else this.close();

		this.inherited(arguments)
	},

	// Slide panel to show its contents
	open: function() {
		var self = this
		
		// The animation coordinates top/left have already been calculated during resize
		this._animation.properties = {
			top: self._pos.top,
			left: self._pos.left
		}
		dojo.animateProperty(this._animation).play()
	},
	
	// Hide panel
	close: function() {
		var self = this

		// The animation coordinates top/left have already been calculated during resize
		this._animation.properties = {
			top: self._pos.slideTop,
			left: self._pos.slideLeft
		}

		dojo.animateProperty(this._animation).play()
	}
})
