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
dojo.provide('apstrata.ui.FlashAlert');

dojo.require("dojox.html.ext-dojo.style");
dojo.require("dojox.fx.ext-dojo.complex");

/**
 * Creates a translucid layer over any node to indicate busy or disabled status 
 * 
 */
dojo.declare('apstrata.ui.FlashAlert', 
[dijit._Widget, dijit._Templated], 
{
	templateString: "<div class='FlashAlert'>${options.message}</div>",
	
	constructor: function(options) {
		this.options = options
	},
	
	postCreate: function() {
		var self = this
		
		dojo.place(this.domNode, this.options.node)
		
		var container = dojo.marginBox(this.options.node)
		var alert = dojo.marginBox(this.domNode)

		var pos = {
			top: (container.t + container.h/2 - alert.h/2) + "px",
			left: (container.l + container.w/2 - alert.w/2) + "px"
		}
		
		dojo.style(this.domNode, pos)
		
		dojo.animateProperty({
			node: self.domNode,
			properties:{
				MozTransform:{start:'scale(1,1)', end:'scale(5,5)'}, 
				opacity: 0.1
			},
			onEnd: function() {
//				setTimeout(dojo.hitch(self, "destroyRecursive"), 1000)
				self.destroyRecursive()
			},
			duration: 1000
		}).play()
	}
})