dojo.provide("apstrata.home.GalleryItemViewer")

dojo.require("dojo.fx.easing")
dojo.require("dijit.layout.BorderContainer")
dojo.require("dijit.layout.ContentPane")

dojo.require("dojox.dtl._Templated")

dojo.declare("apstrata.home.GalleryItemViewer",
[dijit._Widget, dojox.dtl._Templated],
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.home", "templates/GalleryItemViewer.html"),
	
	dimension: {width: 800, height: 420},
	
	constructor: function(options) {
		this.resultSet = options.resultSet
		this.data = options.resultSet[options.cursor]
		this.cursor = options.cursor
	},
	
	postCreate: function() {
		var self = this
		dojo.place(this.domNode, dojo.body())
		
		var v = dijit.getViewport()
		this._curtain = dojo.create("div", {"class": "curtain"}, dojo.body())
		dojo.style(this._curtain, {
			left:"0px",
			top: "0px",
			width: v.w + "px",
			height: v.h + "px"
		
		})
		
		dojo.connect(this._curtain, "onclick", function() {
			self.destroyRecursive()
			self._curtain.parentNode.removeChild(self._curtain)
		})
		
		dojo.animateProperty({
			node:self.domNode,
			easing: dojo.fx.easing.bounceInOut,
			properties: {
				left: {start: v.w/2 ,end: (v.w - self.dimension.width)/2},
				top: {start: v.h/2, end: (v.h - self.dimension.height)/2},
				width: {start: 0, end: self.dimension.width},
				height: {start: 0, end: self.dimension.height}
			}
		}).play();						
		
		this.render()

		this.inherited(arguments)
	},
	
	render: function() {
		var self = this
		this.inherited(arguments)
		
		var v = dijit.getViewport()
		var w = {w: self.dimension.width, h: self.dimension.height}

		dojo.style(this.domNode, {
			left: (v.w - w.w)/2 + "px",
			top: (v.h - w.h)/2 + "px",
			width: self.dimension.width + "px",
			height: self.dimension.height + "px"
		})

		var xhrArgs = {
			url: "manage/wikiProxy.php?api="+self.data.label,
			handleAs: "text",
			timeout: apstrata.apConfig.timeout
		}
		this._xhrLoad = dojo.xhrGet(xhrArgs)
		dojo.addClass(this.dvDescription, "waitAnimation")
		dojo.when (
			this._xhrLoad,
			function(text) {
				dojo.removeClass(self.dvDescription, "waitAnimation")
				self.dvDescription.innerHTML = text
			},
			function(e) {
				dojo.removeClass(self.dvDescription, "waitAnimation")
				self.dvDescription.innerHTML = "Error loading text"
			}
		)

		if (this.cursor==0) {
			dojo.addClass(this.dvPrevious, "disabledNavigation")
		} else {
			dojo.removeClass(this.dvPrevious, "disabledNavigation")
		}
		
		if (this.cursor==(this.resultSet.length-1)) {
			dojo.addClass(this.dvNext, "disabledNavigation")
		} else {
			dojo.removeClass(this.dvNext, "disabledNavigation")
		}

	},
	
	setButtonVisibility: function() {
	},
	
	_next: function() {
		if (this.cursor==(this.resultSet.length-1)) return
		this.cursor++
		this.data = this.resultSet[this.cursor]
		this.render()
	},
	
	_previous: function() {
		if (this.cursor==0) return
		this.cursor--
		this.data = this.resultSet[this.cursor]		
		this.render()
	}
})

	

