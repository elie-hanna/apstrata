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

dojo.provide("apstrata.admin.LoginPanel")
dojo.provide("apstrata.admin.Login")

dojo.require("dijit.form.Form");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.HorizontalSlider")
dojo.require("dijit.form.HorizontalRuleLabels")

dojo.declare("apstrata.admin.Login", 
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.admin", "templates/LoginPanel.html"),
	
	constructor: function(attrs) {
	},
	
	loginMaster: function() {
		var self = this

		self.connection.credentials.key = this.mKey.value
		self.connection.credentials.secret = this.mSecret.value
//		self.connection.defaultStore = this.frmSettings.getValues().defaultStore
//		self.connection.serviceUrl  = this.frmSettings.getValues().serviceUrl
		
		self.container.connection.login({
			success: function() {
				console.debug('login')
			},
			
			failure: function(error, message) {
				var msg = (error == "INVALID_SIGNATURE")?"Invalid credentials.":"[" + error + "] " + message
				self.container.alert(msg, self)
			}
		})
	},
	
	loginUser: function() {
		
	},
	
	_onMouseoverMaster: function() {
		dojo.style(this.dvMaster, {background: "#AAAADD"})
	},
	
	_onMouseoutMaster: function() {
		dojo.style(this.dvMaster, {background: "#DDDDee"})
	},
	
	_onMouseoverUser: function() {
		dojo.style(this.dvUser, {background: "#AAAADD"})
	},
	
	_onMouseoutUser: function() {
		dojo.style(this.dvUser, {background: "#DDDDee"})
	},

	destroy: function() {
		if (this.openWidget) this.openWidget.destroy()
		this.inherited(arguments)
	}
})

dojo.declare("apstrata.admin.LoginPanel", 
[apstrata.widgets.HStackablePanel], 
{
	constructor: function(attrs) {
		this._target = attrs.target
	},

	postCreate: function() {
		var self = this
		this.panel = new apstrata.admin.Login({panel: self, container: self.container, connection: self.container.connection})
		this.addChild(this.panel)
		
		this.inherited(arguments)
	},
	
	destroy: function() {
		this.panel.destroy()
		this.inherited(arguments)
	}
})
