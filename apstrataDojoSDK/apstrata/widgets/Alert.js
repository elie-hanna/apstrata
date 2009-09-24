dojo.provide("apstrata.widgets.Alert")

dojo.require("dijit._Templated")
dojo.require("dijit._Widget")

dojo.require("dojo.fx.easing")

dojo.declare("apstrata.widgets.Alert", 
[dijit._Widget, dijit._Templated], 
{
	templateString:"<div class='Alert'><div class='icon' dojoAttachPoint='icon'></div><div class='content' dojoAttachPoint='content' dojoAttachEvent='onmouseover: _showButtons, onmouseout: _hideButtons'>Content</div><div class='control' dojoAttachEvent='onmouseover: _showButtons' dojoAttachPoint='control'></div></div>",
	width: 200,
	height: 200,
	expandFrom: null,
	clazz: "",
	message: "",
	_factor: .2,
	actions: "close",
	iconSrc: "",
	modal: false,
	
	constructor: function(attrs) {
		var self = this
		if (attrs) {
			if (attrs.width) this.width = attrs.width
			if (attrs.height) this.height = attrs.height
			if (attrs.message) this.message = attrs.message
			if (attrs.iconSrc) this.iconSrc = attrs.iconSrc
			
			if (attrs.expandFrom) {
				this.originNode = dojo.byId(attrs.expandFrom)
			}
			
			if (attrs.clazz) this._classes = attrs.clazz.split(' '); else this._classes = ['rounded']
			
			if (attrs.actions) this._actions = attrs.actions.split(','); else this._actions = ['close']
		}
		
	},
	
	create: function(/*Object?*/params, /*DomNode|String?*/srcNodeRef){
		this._inTheDom = (srcNodeRef != undefined)
		
		if (srcNodeRef) {
			
			this._message = dojo.trim(srcNodeRef.innerHTML)
/*
			if (srcNodeRef.getAttribute('class')) {
				this._classes = (srcNodeRef.getAttribute('class')).split(' ');
				srcNodeRef.setAttribute("class", "")
			}
*/						
		}
		
//					if (!this._classes) this._classes = ['Dialog', 'rounded']
		
		this.inherited(arguments)
	},
	
	postCreate: function() {
		var self = this

		var w = dijit.getViewport()
		
		
		if (this.modal) {
			this._curtain = document.createElement('div')

			dojo.place(this._curtain, document.body, "last")
			this._curtain.setAttribute("class", "AlertCurtain")

			dojo.style(this._curtain, {
				position: "absolute",
				top: 0 + "px",
				left: 0 + "px",
				width: w.w + "px",
				height: w.h + "px",
				visibility: "hidden",
//				background: "grey",
//				opacity: ".50",
//				"zIndex": 1
			})
		}

		if (!this._inTheDom) {
			document.body.appendChild(this.domNode)
		}
		
		if (this._message && (this._message != "")) this.message = this._message


		if (this.originNode) {
			this.origin = {
				t: self.originNode.offsetTop,
				l: self.originNode.offsetLeft,
				w: self.width * self._factor,
				h: self.height * self._factor
			}
		} else {
			this.origin = {
				t: (w.h - self.height * self._factor) / 2,
				l: (w.w - self.width * self._factor) / 2,
				w: self.width * self._factor,
				h: self.height * self._factor
			}
		}
		
		this.destination = {
			t: (w.h - self.height) / 2,
			l: (w.w - self.width) / 2,
			w: self.width,
			h: self.height
		}
		
		this._buttons = []
		dojo.forEach(this._actions, function(action) {
			var b = new dijit.form.Button({label: action})
			dojo.place(b.domNode, self.control, "last")
			dojo.connect(b, "onClick", function() {
				self.buttonPressed(b.label)
			})
			self._buttons.push(b)
		})
		
		if (this.iconSrc) {
			var img = document.createElement('img')
			img.setAttribute('src', this.iconSrc)
			dojo.place(img, this.icon, "only")
		}
		
		this._hideButtons()
	},
	
	buttonPressed: function(action) {
	},
	
	show: function(handler) {
		var self = this;

		for (var i=0; i<this._classes.length; i++) {
			dojo.addClass(self.domNode, this._classes[i])
		}

		dojo.style(this.domNode, {
			top: self.origin.t + "px",
			left: self.origin.l + "px",
			width: (self.origin.w) + "px",
			height: (self.origin.h) + "px",
			visibility: "visible",
			"zIndex": 99999
		})

		dojo.style(this.control, {
			top: (self.height - 42) + "px",
			width: (self.width - 15) + "px"
		})

		if (this.modal) dojo.style(this._curtain, {
			visibility: "visible",
			"zIndex": 99998
		})

		self.content.innerHTML = self.message

		this._animation = {
			node: self.domNode,
			easing: dojo.fx.easing.bounceOut,
			duration: 200,
			onEnd: function() {
				if (handler) handler()
			}
		}
		
		this._animation.properties = {
			top: self.destination.t,
			left: self.destination.l,
			width: (self.destination.w),
			height: (self.destination.h)
		}

		dojo.animateProperty(this._animation).play()
	},
	
	hide: function(handler) {
		var self = this

		var w = dijit.getViewport()

		if (this.modal) dojo.style(this._curtain, {
			visibility: "hidden",
		})

		this._animation = {
			node: self.domNode,
			easing: dojo.fx.easing.bounceOut,
			duration: 200,
			onEnd: function() {
				dojo.style(self.domNode, {
					visibility: "hidden"
				})
				if (handler) handler()
			}
		}
		this._animation.properties = {
			top: self.origin.t,
			left: self.origin.l,
			width: 0,
			height: 0
		}

		dojo.animateProperty(this._animation).play()
	},
	
	destroy: function() {
		// delete modal curtain
		//if (this.modal) 
		
		this.inherited(arguments)
	},
	
	// TODO: showing/hiding the button on mouse over is not working
	_showButtons: function() {
		return
		
		console.debug('show')
		
		dojo.forEach(this._buttons, function(button) {
			dojo.style(button, {
				visibility: 'visible'
			})
		})
	},
	
	_hideButtons: function() {
		return 
		
		console.debug('hide')
		dojo.forEach(this._buttons, function(button) {
			dojo.style(button, {
				visibility: 'hidden'
			})
		})
	}

})
