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

dojo.provide("apstrata.admin.UserEditPanel")
dojo.provide("apstrata.admin.UserEdit")

dojo.require("dijit.form.Form");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.HorizontalSlider")
dojo.require("dijit.form.HorizontalRuleLabels")


dojo.declare("apstrata.admin.UserEdit", 
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.admin", "templates/UserEditPanel.html"),
	
	constructor: function(attrs) {
		var self = this
		
		this.panel = attrs.panel
		this.connection = attrs.panel.connection
		this.container = attrs.panel.container
		this.update = false

		this.user = {
			user: '',
			password: '',
			password2: '',
			name: '',
			email: '',
			groups: ''
		}			
		
		if (attrs.panel.user) {
			this.user.user = attrs.panel.user.login
			this.user.name = attrs.panel.user.name
			this.user.email = attrs.panel.user.email
			
			this.update = true
		}
	},
	
	postCreate: function() {
	},
	
	_save: function() {
		var self = this
		
		if (this.password.value != this.password2.value) {
			alert("passwords don't match")
		}
		
		this.container.client.call({
			action: "SaveUser",
			fields: {
				apsim: {
					user: self.user.value,
					password: self.password.value,
					name: self.name.value,
					email: self.email.value,
					update: self.update
				}
			},
			load: function(operation) {
				self.panel.parentList.refresh()
				self.panel.destroy()
			},
			error: function(operation) {
			}
		})
	},
	
	_cancel: function() {
		this.panel.destroy()
	},
	
	destroy: function() {
		if (this.openWidget) this.openWidget.destroy()
		this.inherited(arguments)
	}
})

dojo.declare("apstrata.admin.UserEditPanel", 
[apstrata.widgets.HStackablePanel], 
{
	constructor: function(attrs) {
		this._target = attrs.target
		this.parentList = attrs.parentList
		this.user = attrs.user
	},

	postCreate: function() {
		var self = this
		this.panel = new apstrata.admin.UserEdit({panel: self}) // , target: self.target, container: self.container, connection: self.container.connection
		this.addChild(this.panel)
		
		this.inherited(arguments)
	},
	
	destroy: function() {
		this.panel.destroy()
		this.inherited(arguments)
	}
})
