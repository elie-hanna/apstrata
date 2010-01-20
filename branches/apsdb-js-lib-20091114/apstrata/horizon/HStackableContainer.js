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

dojo.provide("apstrata.horizon.HStackableContainer")

dojo.require("apstrata.horizon._HStackableMixin")
dojo.require("apstrata.horizon.HStackableList")
dojo.require("apstrata.horizon.HStackablePanel")

dojo.require("dojo.cookie")

/*
 * Layout widget container of the HStackable widgets
 */
dojo.declare("apstrata.horizon.HStackableContainer", 
[dijit.layout._LayoutWidget], 
{
	
	applicationId: "horizon",
	
	_marginRight: 5,

	__children: {},
	
	constructor: function(attrs) {
		if (attrs && attrs.applicationId) this.applicationId = attrs.applicationId
	},
	
	startup: function() {
		setTimeout(dojo.hitch(this, 'loadPreferences'), 3000)
		
		this.inherited(arguments)
	},
	
	addChild: function(child) {
		this.__children[child.id] = child
		
		this.inherited(arguments)
	},
	
	removeChild: function(child) {
		if (this.__children[child.id]) delete this.__children[child.id]
		
		this.inherited(arguments)
	},
	
	autoScroll: function() {
		this.domNode.scrollLeft = this.domNode.scrollWidth - this.domNode.clientWidth
	},
		
	getRemainingFreeWidth: function(excludeId) {
		var w = 0
		
		for (id in this.__children) {
			if (id != excludeId) {
				var child = this.__children[id]
				
				w += child.domNode.offsetWidth
			}
		}

//	todo: don't know why this is not working on logout		
//		dojo.forEach(this.__children, function(child) {
//			w += child.domNode.offsetWidth
//		})
		return this.domNode.offsetWidth - w - this._marginRight * this.getChildren().length
	},

	/*
	 * Auto calculate coordinates and size of Explorer based on 
	 *  window size and this.margin analog to CSS margin
	 */
	_layoutMarginMode: function() {
		var w = dijit.getViewport()
		
		var coord = {}

		coord.top = (this.margin.top + this._marginRight) + "px"
		coord.left = (this.margin.left + this._marginRight) + "px"
		coord.width = (w.w - this.margin.left - this.margin.right - 2*this._marginRight) + "px"
		coord.height = (w.h - this.margin.top - this.margin.bottom - 2*this._marginRight) + "px"
		dojo.style(this.background, {
			top: (this.margin.top) + "px",
			left: (this.margin.left) + "px",
			width: (w.w - this.margin.left - this.margin.right) + "px",
			height: (w.h - this.margin.top - this.margin.bottom) + "px",
			zIndex: "10"
		})
		dojo.style(this.domNode, {
			top: coord.top,
			left: coord.left,
			width: coord.width,
			height: coord.height,
			zIndex: "100"
		})
	},

	/*
	 * Auto calculate coordinates and size of Explorer based on 
	 *  window size and explorer target size
	 */
	_layoutSizeMode: function() {
		coord.top = ((w.h - this.height)/2)
		coord.left = ((w.w - this.width)/2)
		coord.width = (this.width)
		coord.height = (this.height)


		dojo.style(this.background, {
			top: (this.margin.h/2) + "px",
			left: (this.margin.w/2) + "px",
			width: (w.w - this.margin.w) + "px",
			height: (w.h - this.margin.h) + "px",
			zIndex: "10"
		})

		dojo.style(this.domNode, {
			top: coord.top + "px",
			left: coord.left + "px",
			width: coord.width + "px",
			height: coord.height + "px",
			zIndex: "100"
		})
	},
	
	layout: function() {
		this._layoutMarginMode()

		// Call layout for each contained widget upon resize
		dojo.forEach(this.getChildren(), function(child) {
			child.layout()
		})

		this.inherited(arguments)
	},
	
	postCreate: function() {
		dojo.addClass(this.domNode, 'horizon')

		// Create the background transparent div
		this.background = dojo.create("div", null, dojo.body())
		dojo.addClass(this.background, "horizonBackground")
		dojo.addClass(this.background, "rounded-sml")
		
//		this.maximize = dojo.create("div", null, dojo.body())
		
		this.inherited(arguments)
	},
	
	savePreferences: function(preferences) {
		dojo.cookie(this.applicationId + "-prefs", dojo.toJson(preferences))
		this.preferencesChanged(preferences)
	},
	
	loadPreferences: function() {
		var prefs = {}

		try {
			var prefs = dojo.fromJson(dojo.cookie(this.applicationId + "-prefs"))
			if (prefs) this.preferencesChanged(prefs); else prefs = {}
		} catch (err) {
			
		}
		
		return prefs
	},

	preferencesChanged: function(preferences) {}
})


