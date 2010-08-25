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
dojo.provide("apstrata.widgets.Curtain")

dojo.require("dijit._Templated")
dojo.require("dijit._Widget")

dojo.require("dojo.fx.easing")

dojo.declare("apstrata.widgets.Curtain", 
[dijit._Widget, dijit._Templated], 
{
	templateString:"<div style='background: #000; opacity: 1;'></div>",
	
	container: null,
	width: null,
	height: null,
	content: null,
	actions: null,
	onClose: null,
	
	constructor: function(attrs) {
		if (attrs) {
			if (attrs.container) this.container = attrs.container
		}
	},
	
	postCreate: function() {
		dojo.style(this.domNode, {
		    position: "absolute",
			visibility: "hidden"
		})
		dojo.place(this.domNode, dojo.body())
	},
	
	show: function() {
		var self = this
		var pos = dojo.position(this.container, true)
		dojo.style(this.domNode, {
		    left: pos.x + "px",
		    top: pos.y + "px",
		    width: pos.w + "px",
		    height: pos.h + "px",
			visibility: "visible"
		})

        dojo.style(this.domNode, "opacity", "0");
		
		dojo.anim(this.domNode, { opacity: .85 }, 1000);
		
//		dojo.fadeOut(fadeArgs).play();

	},
	
	hide: function() {
		var self = this
		dojo.anim(this.domNode, 
			{opacity: 0}, 
			1000,
			null,
			function() {
				dojo.style(self.domNode, {
										visibility: "hidden"
									})
			}
		)
	}
})
