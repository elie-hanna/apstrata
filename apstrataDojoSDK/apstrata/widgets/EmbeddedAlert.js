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
dojo.provide('apstrata.widgets.EmbeddedAlert');

dojo.require('dijit._Templated');
dojo.require('dijit._Widget');

dojo.require('dojo.fx.easing');

dojo.declare("apstrata.widgets.EmbeddedAlert", 
[dijit._Widget, dijit._Templated], 
{
	templateString:"<div class='EmbeddedAlert'><table height='100%' width='100%'><tr height='90%'><td valign='top'><div dojoAttachPoint='dvContent'></div></td></tr><tr><td align='center' width='100%'><div dojoAttachPoint='dvActions' class='actions'></div></td></tr></table></div>",
	
	container: null,
	width: null,
	height: null,
	content: null,
	actions: null,
	onClose: null,
	
	constructor: function(attrs) {
		if (attrs) {
			if (attrs.container) this.container = attrs.container
			if (attrs.width) this.width = attrs.width
			if (attrs.height) this.height = attrs.height			
			if (attrs.content) this.content = attrs.content	
			if (attrs.actions) this.actions	= attrs.actions
			if (attrs.onClose) this.onClose = attrs.onClose
		}
	},
	
	postCreate: function() {
		var self = this
		var pos = dojo.position(this.container, true)
		
		dojo.place(this.domNode, dojo.body())

		var left, width
		
		// calculate dimensions 
		if (self.width) {
			left = pos.x + (pos.w - self.width)/2
			width = self.width
		} else {
			left = pos.x
			width = pos.w
		}
		
		var height = (self.height?self.height:pos.h)
		
		dojo.style(this.domNode, {
		    position: "absolute",
		    left: left + "px",
		    top: pos.y + "px",
		    width: width + "px",
		    height: height + "px"
		})
		
		this.dvContent.innerHTML = this.content
		
		var _actions = this.actions.split(",")
		dojo.forEach(_actions, function(action) {
	        var button = new dijit.form.Button({
	            label: action,
	            onClick: function() {
					self.onClose(action)
					self.destroyRecursive()
	            }
	        })
			
			dojo.place(button.domNode, self.dvActions)
			if (self.startFocus == button.label) button.focus();
		}) 
	}
})
