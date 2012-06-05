/*******************************************************************************
 *  Copyright 2009 Apstrata
 *  
 *  This file is part of Apstrata Database Javascript Client.
 *  
 *  Apstrata Database Javascript Client is free software: you can redistribute it
 *  and/or modify it under the terms of the GNU Lesser General Public License as
 *  published by the Free Software Foundation, either version 3 of the License,
 *  or (at your option) any later version.
 *  
 *  Apstrata Database Javascript Client is distributed in the hope that it will be
 *  useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *  
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with Apstrata Database Javascript Client.  If not, see <http://www.gnu.org/licenses/>.
 * *****************************************************************************
 */

dojo.provide('apstrata.horizon.Container');

dojo.require('dojo.cookie');
dojo.require('dijit.layout._LayoutWidget')

dojo.require('apstrata.horizon.ControlToolbar');

/*
 * Layout widget container of the HStackable widgets
 */
dojo.declare("apstrata.horizon.Container", 
[dijit.layout._LayoutWidget], 
{
	
	// Provides a unique key for storing preferences data (by default to a cookie)
	applicationId: "horizon",

	_marginRight: 0,
	controlToolbarClass: apstrata.horizon.ControlToolbar,
	showToolbar: true,

	//
	// Widget attributes
	//
	margin: null,
	loginWidget: null,
	
	constructor: function(attrs) {
		if (attrs && attrs.applicationId) this.applicationId = attrs.applicationId
		
		this.loginWidget = attrs.loginWidget

		// Extract the request params into an object		
		var s = window.location.search.substring(1)
		var params = s.split('&')
		this.request = {}
		for (var i=0; i<params.length; i++) {
			var tmp = params[i].split('=')
			this.request[tmp[0]] = tmp[1]
		}

		// Decompose the path (request param path) into an array
		if (this.request['path']) this.path = this.request['path'].split('/');
		else this.path = [];
		this._maximize = false
		this._mainPanel = false
		this._count = 0
		this.__children = {}
		this.__childrenOrder = {}
	},
		
	postCreate: function() {
		var self = this

		// save the current position set in CSS
		this._savePosition = dojo.position(this.domNode)
		this._CSSdim = dojo.position(this.domNode)

		// Add the mandatory CSS class to the Layout widgets's dom node
		dojo.addClass(this.domNode, 'horizon')

		// Create the fixed left div
		this.fixedPanelNode = dojo.create("div", null, this.domNode.parentNode)
		dojo.addClass(this.fixedPanelNode, "horizon")

		// Create the background transparent div
		this.background = dojo.create("div", null, this.domNode.parentNode)
		dojo.addClass(this.background, "horizonBackground")
		
		// Only add the control toolbar if it is not already set by the user-application.
		if (this.showToolbar) {
			self._controlToolbar = new this.controlToolbarClass({container: self});
			dojo.place(self._controlToolbar.domNode, this.domNode.parentNode);
			dojo.connect(self._controlToolbar, "maximize", dojo.hitch(this, 'maximize'))
			dojo.connect(self._controlToolbar, "restore", dojo.hitch(this, 'restore'))
		}
		
		this.inherited(arguments)
	},
	
	_checkUrlHashChange: function() {
		if (!this._lastUrlHash) {
			this._lastUrlHash = document.location.hash
		} else {
			if (document.location.hash != this._lastUrlHash) this.onUrlHashChange(document.location.hash)
			this._lastUrlHash = document.location.hash
		}
	},
	
	onUrlHashChange: function(hash) {
		console.info('URL Hash changed to: ' + hash)
	},
	
	listenToHashChange: function(v) {
		if (v) {
			this._listenUrlHashChange = setInterval(dojo.hitch(this,"_checkUrlHashChange"), 500)
		} else {
			clearInterval(this._listenUrlHashChange)
		}
	},
	
	/**
	 * Overriden by child classes to login application
	 * 
	 * @param {Object} credentials
	 */
	onCredentials: function(credentials) {
		
	},
	
	startup: function() {
		var self = this
		//setTimeout(dojo.hitch(this, 'loadPreferences'), 3000)
		//setTimeout(dojo.hitch(this, 'layout'), 100)

		if (this.loginWidget) {
			//this.loginWidget.set("dimension", this._boundingRectangle)
			this.loginWidget.container = this; 
			dojo.place(this.loginWidget.domNode, dojo.body())
			this.showCurtain()
			this.loginWidget.then(function(credentials) {
				self.onCredentials(credentials)
				self._instantiateMainPanel()
				self.listenToHashChange(true)
				self.loginWidget.destroyRecursive()
				delete self.loginWidget
				self.hideCurtain()
			},
			function() {
			})
		} else {
			self.listenToHashChange(true)
		}
		
		this.inherited(arguments)
	},
	
	autoScroll: function() {
		try {
			this.domNode.scrollLeft = this.domNode.scrollWidth - this.domNode.clientWidth		
		} catch (e) {
//			console.error(e)
		}
		
	},
		
	getRemainingFreeWidth: function(excludeId) {
		var w = 0
		for (id in this.__children) {
			if (id != excludeId) {
				var child = this.__children[id]
				w += dojo.marginBox(child.domNode).w
			}
		}
		return dojo.contentBox(this.domNode).w - w
	},
	
	layout: function() {
		this._containerLayout()

		if (this.loginWidget) this.loginWidget.set("centerTo", this._boundingRectangle)

		// Call layout for each contained widget upon resize
		dojo.forEach(this.getChildren(), function(child) {
				child.resize()	
		})

		if (this._mainPanel) {
			this._mainPanel.resize();
		}

		this.inherited(arguments)
	},
	
	maximize: function() {
		this._maximize = true
		this.layout()
	},
	
	restore: function() {
		this._maximize = false
		this.layout()
	},
	
	_containerLayout: function() {
		var self = this

		var w = dijit.getViewport()

		// Get the border margin of from background div's CSS class
		var bMargin = dojo.style(this.background, "borderTopWidth")

		// Get control bar height
		var cBarH = 0
		if (this._controlToolbar) cBarH = dojo.position(this._controlToolbar.domNode).h

		// Calculate bounding dimensions
		var bounding = {}
		if (this._maximize) {
			bounding.top = cBarH + bMargin
			bounding.left = bMargin
			bounding.height = w.h - cBarH - 2*bMargin
			bounding.width = w.w - 2*bMargin
		} else if (this.margin) {
			bounding.top = this.margin.top + cBarH + bMargin
			bounding.left = this.margin.left + bMargin
			bounding.height = w.h - this.margin.top - this.margin.bottom - cBarH - 2*bMargin
			bounding.width = w.w - this.margin.left - this.margin.right - 2*bMargin
		} else {
			// restore dimensions from container CSS class
			bounding.top = this._CSSdim.y
			bounding.left = this._CSSdim.x
			bounding.height = this._CSSdim.h
			bounding.width = this._CSSdim.w
		}
		
		var container = {}
		var fixedPanel = {}
		
		if (this._mainPanel) {
			// get main panel's width
			var mpw = dojo.position(this._mainPanel.domNode).w

			// Calculate fixed section dimensions
			fixedPanel.top = bounding.top
			fixedPanel.width = mpw
			fixedPanel.left = bounding.left
			fixedPanel.height = bounding.height
	
			// Calculate Scrolling section dimensions
			container.top = bounding.top
			container.height = bounding.height
			container.left = bounding.left + fixedPanel.width
			container.width = bounding.width - fixedPanel.width			
		} else {
			// Calculate Scrolling section dimensions
			container = bounding			
		}

		// Calculate Background dimensions
		//	Make it wrap around bounding
		var background = {}
		background.top = (bounding.top - bMargin)
		background.left = (bounding.left - bMargin)
		background.width = (bounding.width)
		background.height = (bounding.height)

		this._boundingRectangle = background


		// Calculate Control toolbar position
		var toolbar = {}
		toolbar.top = (bounding.top - cBarH - bMargin)
		toolbar.left = (bounding.left + bMargin * 2)

		// Position divs
		dojo.style(this.domNode, {
			top: container.top + "px",
			left: container.left + "px",
			width: container.width  + "px",
			height: container.height  + "px",
			zIndex: "100"
		})
		dojo.style(this.fixedPanelNode, {
			top: fixedPanel.top + "px",
			left: fixedPanel.left + "px",
			width: fixedPanel.width  + "px",
			height: fixedPanel.height  + "px",
			zIndex: "100"
		})
		dojo.style(this.background, {
			top: background.top + "px",
			left: background.left + "px",
			width: background.width  + "px",
			height: background.height  + "px",
			zIndex: "1"
		})

		if (this._controlToolbar) this._controlToolbar.setPosition(toolbar.top + "px", toolbar.left + "px")
	},

	/**
	 * Shows the main panel (menu) of the Horizon application
	 * 
	 * @param {Object} child is an instance or Class function of the desired main panel
	 */
	addMainPanel: function (childOrClass, attrs) {
		var panel

		if (dojo.isFunction(childOrClass)) {
			this._mainPanelClass = childOrClass
		} else {
			// This is provided for compatibility with existing code
			//  if an instance is provided, deduce the class and reinstantiate
			this._mainPanelClass = dojo.getObject(childOrClass.declaredClass)
		}
		
		if (attrs) this._mainPanelAttrs = attrs; else this._mainPanelAttrs = {} 
		
		this._instantiateMainPanel()

		dojo.connect(this, "onUrlHashChange", this._instantiateMainPanel)
	},
	
	_instantiateMainPanel: function() {
		var self = this

		// Check if there's a hash string
		var s = window.location.hash
		if (s) {
			s = s.substring(1)
			
			// split it on slashes			
			var selectIds = s.split('/')
		}
		
		// pass selectIds to main to cascade open panels, this makes panels bookmarkable
		this._mainPanelAttrs.selectIds = selectIds
		this._mainPanelAttrs.container = self

		// Create the leftMost Panel
		this.main = new this._mainPanelClass(this._mainPanelAttrs)

		// Remove any existing main panel, we can only have one
		this.removeMainPanel()

		this._mainPanel = this.main
		this.main.setFixedPanel(true)
		
		dojo.addClass(this.main.domNode, "mainPanel")
		dojo.place(this.main.domNode, self.fixedPanelNode)
		apstrata.horizon.config.disableAnimation = false
		this.main.startup()
		
		// Disabling position animation when instantiating a container because it is making cascade open fail
		//  So we re-enable it after 200ms
		// TODO: temporary solution that needs to be replaced with more solid code 
		setTimeout(function() {
			apstrata.horizon.config.disableAnimation = true
		},200)
	},

	removeMainPanel: function () {
		if (this._mainPanel) {
			this._mainPanel.closePanel()
			this._mainPanel.destroyRecursive()
		}
	},
	
	addChild: function(child) {
		this.__children[child.id] = child
		this.__childrenOrder[child.id] = this._count++
		
		this.inherited(arguments)
	},

	getChildPosition: function(child) {
		return this.__childrenOrder[child.id]
	},	

	/* this doesn't work need to call the panel close method too */
	removeChild: function(child) {
		if (this.__children[child.id]) delete this.__children[child.id]

		// situation happened when refreshing domNode is null on IE
		if(child.domNode || !dojo.isIE)
			this.inherited(arguments)
	},

	loadPreferences: function() {
		var prefs = {}

		try {
			var prefs = dojo.fromJson(dojo.cookie(this.applicationId + "-prefs"))
			if (prefs) {
				//this.preferencesChanged(prefs); 
			} else {
				prefs = {};
			}
		} catch (err) {
			
		}
		
		return prefs
	},
	
	savePreferences: function(preferences, autoLogout) {
		dojo.cookie(this.applicationId + "-prefs", dojo.toJson(preferences), { expires: 365 });
		this.preferencesChanged(preferences, autoLogout);
	},

	preferencesChanged: function(preferences, autoLogout) {},
	
	showCurtain: function() {
		// Put a curtain over the entire window
		var w = dijit.getViewport()
		this._curtain = dojo.create('div', {}, dojo.body())
		dojo.addClass(this._curtain, "HorizonCurtain")

		dojo.style(this._curtain, {
			top: 0 + "px",
			left: 0 + "px",
			width: w.w + "px",
			height: w.h + "px"
		})
	},
	
	hideCurtain: function() {
		if (this._curtain) {
			this._curtain.parentNode.removeChild(this._curtain)
			this._curtain = null
		}
	}
})
