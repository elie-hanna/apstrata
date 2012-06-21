/*******************************************************************************
 *  Copyright 2009-2012 Apstrata
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
dojo.provide('apstrata.ui.Curtain');

/**
 * Creates a translucid layer over any node to indicate busy or disabled status 
 * 
 */
dojo.declare('apstrata.ui.Curtain', 
[dijit._Widget, dijit._Templated], 
{
	templateString: "<div></div>",
	
	constructor: function(options) {
		this.options = options
	},
	
	show: function(message, node) {
		if (this._curtain) return
		
		if (!node) node = this.options.node
		
		var c = dojo.marginBox(node)
		this._curtain = dojo.create("div", {}, node)
		dojo.style(this._curtain, {
			top: c.t+"px", left: c.l+"px",
			width: c.w + "px", height: c.h + "px"
		})
		dojo.addClass(this._curtain, "Curtain")
		
		this._curtainAnimation = dojo.create("div", {}, this._curtain)
		dojo.addClass(this._curtainAnimation, "busyIcon")
		
		var i = dojo.contentBox(this._curtainAnimation)
		dojo.style(this._curtainAnimation, {
			top: (c.h - i.h)/2 + "px",
			left: (c.w - i.w)/2 + "px"
		})

		this._curtainMessage = dojo.create("div", {}, this._curtain)
		dojo.addClass(this._curtainMessage, "busyMessage")
		
		if (message) this.setBusyMessage(message); else this.setBusyMessage("")
	},
	
	hide: function() {
		if (this._curtain) {
			if (this._curtain.parentNode)
				this._curtain.parentNode.removeChild(this._curtain)
			delete this._curtain
		}
	},

	setBusyMessage: function(message) {
		this._curtainMessage.innerHTML = message

		var c = dojo.marginBox(this.domNode)
		var m = dojo.contentBox(this._curtainMessage)
		var i = dojo.marginBox(this._curtainAnimation)

		dojo.style(this._curtainMessage, {
			top: i.t+i.h + "px",
			left: i.l - (m.w - i.w)/2 + "px"
		})
	}
})
