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

dojo.provide("apstrata.admin.GroupEditPanel")
dojo.provide("apstrata.admin.GroupEdit")

dojo.require("dijit.form.Form");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.HorizontalSlider")
dojo.require("dijit.form.HorizontalRuleLabels")


dojo.declare("apstrata.admin.GroupEdit", 
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.admin", "templates/GroupEditPanel.html"),
	
	constructor: function(attrs) {
		var self = this
		
		this.panel = attrs.panel
		this.connection = attrs.panel.connection
		this.container = attrs.panel.container
		this.update = false

		if (attrs.panel.group) {
			this.groupName = attrs.panel.groupName
			
			this.update = true
		} else {
			this.groupName = ""
		}
	},
	
	postCreate: function() {
	},
	
	_save: function() {
		var self = this
		
		var client = new apstrata.apsdb.client.Client(this.container.connection)
		
		var operation = client.CreateGroup(function() {
			alert('success')
			self.panel.parentList.refresh()
		},
		function() {
			
		},
		{groupName: self.groupName})
	},
	
	_cancel: function() {
		this.panel.destroy()
	},
	
	destroy: function() {
		if (this.openWidget) this.openWidget.destroy()
		this.inherited(arguments)
	}
})

dojo.declare("apstrata.admin.GroupEditPanel", 
[apstrata.widgets.HStackablePanel], 
{
	constructor: function(attrs) {
		this._target = attrs.target
		this.parentList = attrs.parentList
		this.groupName = attrs.groupName
	},

	postCreate: function() {
		var self = this
		this.panel = new apstrata.admin.GroupEdit({panel: self}) // , target: self.target, container: self.container, connection: self.container.connection
		this.addChild(this.panel)
		
		this.inherited(arguments)
	},
	
	destroy: function() {
		this.panel.destroy()
		this.inherited(arguments)
	}
})
