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
dojo.provide("apstrata.horizon.PanelAlert") 
dojo.require("dojo.fx.easing")
 
dojo.declare("apstrata.horizon.PanelAlert", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/PanelAlert.html"),
 	widgetsInTemplate: true,

	/**
	 * 
	 * @param {Object} attr: {panel: rootPanel, message: "", actions: ['button1', 'button2'], actionHandler: function(action) {} }
	 */
	width: 300,
	height: 200,
	
 	constructor: function(attr) {
		dojo.mixin(this, attr)
 	},
	
	/**
	 * This class might be isntantiated with a panel or the container, this finds the pointer to the container
	 */
	_getContainer: function() {
		if (this.panel.showCurtain) return this.panel; else return this.panel.getContainer()
	},
	
	_layout: function() {
		var self = this

		var a = dojo.position(this.panel.domNode)

		// Style and position the widget
		dojo.addClass(this.domNode, "apstrataHorizonAlert")

		// Start with a small rectangle
		dojo.style(this.domNode, {
			top: (a.y-5) + "px",
			left: (a.x + a.w/2 - 4) + "px",
			height: "8px",
			width: 8 + "px"
		})
		dojo.place(this.domNode, dojo.body())
		
		dojo.style(this.dvMessage, "display", "none")
		
		self._getContainer().showCurtain()
		
		// Animate to full height
		dojo.animateProperty({
			node: this.domNode,
			duration: 100,
			properties: {
				top: a.y,
				height: self.height,
			}, 
			onEnd: function() {
				// Animate to full width
				dojo.animateProperty({
					node: self.domNode,
					duration: 200,
					easing: dojo.fx.easing.bounceInOut,
					properties: {
						width: self.width,
						left: (a.x + a.w/2 - self.width/2) 
					}, 
					onEnd: function() {
						// Setup content after animation
						self._setupDialogContent()
					}
				}).play()
			}
		}).play()
	},
	
	_setupDialogContent: function() {
		var self = this
		dojo.style(self.dvMessage, "display", "block")

		// Add the buttons
		for (var i=0; i<self.actions.length; i++) {
			var button = new dijit.form.Button({
				label: self.actions[i],
				onClick: function() {
					self.onClick(this.label)
				}
			})
			dojo.place(button.domNode, self.dvActions)
		}
		
		// If an icon path is specified, show the img
		if (self.icon) {
			var img = dojo.create("img", {}, self.dvIcon)
			img.onload = dojo.hitch(self, "_reflowContent")
			dojo.attr(img, "src", self.icon)
		} else if (self.iconClass) {
			dojo.addClass(self.dvIcon, self.iconClass)
			self._reflowContent()
		} else {
			self._reflowContent()
		}
	},

	_reflowContent: function() {
		// Position elements
		var d = dojo.contentBox(this.domNode)
		var m = dojo.position(this.dvMessage)
		var b = dojo.position(this.dvActions)
		var i = dojo.position(this.dvIcon)

		// Position the actions at the center lower part
		dojo.style(this.dvActions, {
			left: (d.w/2 - b.w/2) + "px",
			top: (d.h - b.h) + "px"
		})
		dojo.style(this.dvMessage, {
			left: (i.w) + "px",
			width: (d.w-i.w) + "px",
			height: (d.h - b.h) + "px"
		})
	},
 	
 	postCreate: function() {
		this._layout()
		this.inherited(arguments)
 	},
	
	onClick: function(action) {
		this.actionHandler(action)
		this._getContainer().hideCurtain()
//		this._curtain.parentNode.removeChild(this._curtain)
		this.destroyRecursive()
	}
 })