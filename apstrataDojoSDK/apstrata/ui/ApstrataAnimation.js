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
dojo.provide('apstrata.ui.ApstrataAnimation');

dojo.require("dijit._Templated")

/**
 * Creates a translucid layer over any node to indicate busy or disabled status 
 * 
 */
dojo.declare('apstrata.ui.ApstrataAnimation', 
[dijit._Widget, dijit._Templated], 
{
	templateString: "<div class='apstrataAnimation'></div>",
	
	constructor: function(options) {
		if (options) this.options = options; else this.options = {mode: "center"}
		
		this.options = options
	},
	
	postCreate: function() {
		if (dojo.isString(this.options.node)) this.node = dojo.byId(this.options.node); else this.node = this.options.node
		this.inherited(arguments)
	},
	
	show: function() {
		dojo.style(this.domNode, "display", "block")
		
		dojo.place(this.domNode, this.node)
		
		var n = dojo.marginBox(this.node)
		var a = dojo.marginBox(this.domNode)
	
		if (this.options.mode) {
			if (this.options.mode == "center") {
				dojo.style(this.domNode, {
					top: (n.h - a.h)/2 + "px",
					left: (n.w - a.w)/2 + "px"
				})
			} else if (this.options.mode == "max") {
				dojo.style(this.domNode, {
					top: "0px",
					left: "0px",
					width: n.w + "px",
					height: n.h + "px"
				})
			} 
		} else {
			dojo.style(this.domNode, {
				top: (n.h - a.h)/2 + "px",
				left: (n.w - a.w)/2 + "px"
			})
		}
	},
	
	hide: function() {
		dojo.style(this.domNode, "display", "none")
	}
	
	
})
