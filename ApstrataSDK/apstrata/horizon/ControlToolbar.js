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

dojo.provide('apstrata.horizon.ControlToolbar');

dojo.require('dojox.dtl._Templated')

dojo.declare("apstrata.horizon.ControlToolbar", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/ControlToolbar.html"),
	top: 0,
	left: 0,
	_maximized: false,
	_actionName: "maximize",

	LOGGED_OUT_MSG: "click on any item to login",

	constructor: function(attrs) {
		this.container = attrs.container
		this._loginMessage = this.LOGGED_OUT_MSG
		this._defaultMargin = dojo.clone(this.container.margin)
	},
	
	postCreate: function() {
		var self = this

		dojo.subscribe("/apstrata/connection/login/success", function(data) {
			if (connection.getLoginType() == connection.LOGIN_USER) {
				self._loginMessage = "You are logged in as: " + connection.credentials.username + "@" + connection.credentials.key
			} else {
				self._loginMessage = "You are logged in as Account Owner for: " + connection.credentials.key
			}
			self.render()
		})

		dojo.subscribe("/apstrata/connection/logout", function(data) {
			self._loginMessage = self.LOGGED_OUT_MSG
			self.render()
		})

		dojo.subscribe("/apstrata/connection/logout/success", function(data) {
			self._loginMessage = self.LOGGED_OUT_MSG;
			self.render();
		})
	},
	
	setPosition: function(top, left) {
		this.top = top
		this.left = left
		this.reposition()
	},
	
	reposition: function() {
		var self = this
//console.debug(this.top, this.left)		
		dojo.style(this.domNode, {
			top: self.top,
			left: self.left
		})
	},
	
	render: function() {
		this.inherited(arguments)
		this.reposition()
	},
	
	_maximize: function() {
		if (!this._maximized) {
			this._maximized = true
			
			this._MinMaxIcon.src = this._horizonRoot +"/resources/images/pencil-icons/restore.png"
			this._actionName = "minimize"
			this.maximize()		
		} else {
			this._maximized = false
			
			this._MinMaxIcon.src = this._horizonRoot +"/resources/images/pencil-icons/maximize.png"
			this._actionName = "minimize"
			this.restore()
		}
	},
	
	maximize: function() {},
	restore: function() {}
})