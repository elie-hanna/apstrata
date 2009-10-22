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

dojo.provide("apstrata.admin.SchemaEditorPanel")
dojo.provide("apstrata.admin.SchemaEditor")

dojo.require("dijit.form.Form");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.HorizontalSlider")
dojo.require("dijit.form.HorizontalRuleLabels")

dojo.declare("apstrata.admin.SchemaEditor", 
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.admin", "templates/SchemaEditorPanel.html"),
	
	constructor: function(attrs) {
		this._target = attrs.target
		this.connection = attrs.connection
		this.container = attrs.container
		this.panel = attrs.panel
		
		this._target = 'presentation'
		this.connection = new apstrata.apsdb.client.Connection()
	},
		
	_save: function() {
		
	},
	
	destroy: function() {
		if (this.openWidget) this.openWidget.destroy()
		this.inherited(arguments)
	}
})

dojo.declare("apstrata.admin.SchemaEditorPanel", 
[apstrata.widgets.HStackablePanel], 
{
	constructor: function(attrs) {
		this._target = attrs.target
	},

	postCreate: function() {
		var self = this
		this.panel = new apstrata.admin.SchemaEditor({panel: self, target: self.target, container: self.container, connection: self.container.connection})
		this.addChild(this.panel)
		
		this.inherited(arguments)
	},
	
	destroy: function() {
		this.panel.destroy()
		this.inherited(arguments)
	}
})
