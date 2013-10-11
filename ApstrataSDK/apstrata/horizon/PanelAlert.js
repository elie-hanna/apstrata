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
	
	_curtain: null,
	
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

		var a = dojo.position(this.panel.domNode);
		var w = dijit.getViewport();

		// Style and position the widget
		dojo.addClass(this.domNode, "apstrataHorizonAlert")
		
		/*
		var top = a.y - 5 + dojo.body().scrollTop;
		if (dojo.body().scrollTop > 0) {
			top = top + a.h/2;
		}*/
		var top = w.t + w.h/4;
		
		// Start with a small rectangle
		dojo.style(this.domNode, {
			top: top + "px",
			left: (a.x + a.w/2 - 4) + "px",
			height: "8px",
			width: 8 + "px"
		})
		dojo.place(this.domNode, dojo.body())
		
		dojo.style(this.dvMessage, "display", "none")
		
		this._curtain = self._getContainer().showCurtain()
		
		// Animate to full height
		dojo.animateProperty({
			node: this.domNode,
			duration: 100,
			properties: {
				top: top,
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
		
		var neededHeight = d.h;
		var neededWidth = d.w + (2 * i.w);
		var fontSize = Math.round((dojo.style(this.dvMessage, "fontSize")).replace(/px/, ""));
		// For some reason, on IE the font size is not being calculated
		if (!fontSize) {
			fontSize = 14;
		}
		var spaceBetweenLines = Math.round(dojo.style(this.dvMessage, "lineHeight")) - fontSize;
		var title = dojo.query(".alertTitle")[0];
		var titleSize = Math.round((dojo.style(title, "fontSize")).replace(/px/, ""));
		// For some reason, on IE the font size is not being calculated
		if (!titleSize) {
			titleSize = 32;
		}
		titleSize = titleSize ? titleSize * 2 : 50;	
		if (fontSize) {
			var msgLengthInPx = this.message.length * fontSize;
			var approxLines = msgLengthInPx / d.w;
			neededHeight = Math.round(approxLines * fontSize) + Math.round(approxLines * spaceBetweenLines);
			if (neededHeight < d.h) {
				neededHeight = d.h;
			}
			
			dojo.style(this.domNode, {
				width: neededWidth + "px",
				height: neededHeight + Math.round(titleSize) + 10 + "px"
			})
		}		

		// Position the actions at the center lower part
		dojo.style(this.dvActions, {
			left: (neededWidth/2 - b.w/2) + "px",
			top: (neededHeight) + "px"
		})
		
		dojo.style(this.dvMessage, {
			left: (i.w) + "px",
			width: d.w + "px",
			height: (neededHeight) + "px"
		})
	},
 	
 	postCreate: function() {
		this._layout()
		this.inherited(arguments)
 	},
	
	onClick: function(action) {
		this.actionHandler(action)
		this._getContainer().hideCurtain(this._curtain)
//		this._curtain.parentNode.removeChild(this._curtain)
		this.destroyRecursive()
	}
 })