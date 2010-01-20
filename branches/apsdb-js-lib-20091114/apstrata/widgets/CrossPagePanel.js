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

dojo.provide("apstrata.widgets.CrossPagePanel")
 
dojo.require("dijit.layout._LayoutWidget")
dojo.require("dojox.dtl._Templated")
dojo.require("dojo.fx.easing");

 
dojo.declare("apstrata.widgets.CrossPagePanel", 
[dijit.layout._LayoutWidget], 
{
 	// dijit._Widget, dojox.dtl._Templated
	
	templatePath: dojo.moduleUrl("apstrata.widgets","templates/CrossPagePanel.html"),
	
	opacity: .97,
	
	constructor: function() {

		this.baseClass = 'CrossPagePanel'
		this._show = false
	},
	
	postCreate: function() {
		var self = this
		
		
		dojo.addClass(this.domNode, 'rounded')
		dojo.addClass(this.domNode, 'CrossPagePanel')
	},

	layout: function() {
		var self = this

		if (this._show) {
			var w = dijit.getViewport()
			var left = (w.w - this.domNode.offsetWidth) / 2
			var top = (w.h - this.domNode.offsetHeight) / 2
	
			dojo.style(this.domNode, {
				top: top + "px",
				left: left + "px",
				visibility: "visible",
				opacity: "0"
			})
	
			// Setup the basic animation for hiding/showing the Panel
			this._animation = {
				node: self.domNode,
				easing: dojo.fx.easing.bounceOut,
				duration: 500,
				onEnd: function() {
				}
			}
			
			// The animation coordinates top/left have already been calculated during resize
			this._animation.properties = {
				opacity: self.opacity
			}
			
			dojo.animateProperty(this._animation).play()
		} else {
			dojo.style(this.domNode, {
				visibility: "hidden",
				opacity: "0"
			})
		}
	},
	
	show: function() {
		this._show = true
		this.layout()
	},
	
	hide: function() {
		this._show = false
		this.layout()
	}
	
 })
