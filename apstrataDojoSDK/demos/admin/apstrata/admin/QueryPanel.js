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

dojo.provide("apstrata.admin.QueryPanel")
dojo.provide("apstrata.admin.Query")

dojo.require("dijit.form.Form");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.HorizontalSlider")
dojo.require("dijit.form.HorizontalRuleLabels")

dojo.require('apstrata.apsdb.client.ItemApsdbReadStore')
dojo.require('apstrata.widgets.QueryWidget')

dojo.declare("apstrata.admin.Query", 
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.admin", "templates/QueryPanel.html"),
	
	constructor: function(attrs) {
		this._target = attrs.target
		this.connection = attrs.connection
		this.container = attrs.container
		this.panel = attrs.panel
		
		this._target = 'presentation'
		this.connection = new apstrata.apsdb.client.Connection()
	},
	
	_refresh: function() {	
	},
	
	_query: function() {
			var self = this
			
			var queryString = this.txtQuery.value
			queryString = (queryString=="")?"q12345!=\"x12345\"":queryString
			
			var columnsString = self.fldFields.value
			var aggregatesString = self.fldAggregates.value
			var sortingString = self.fldSorting.value
			var FTSString = self.fldFts.value

			var store = new apstrata.apsdb.client.ItemApsdbReadStore({connection: self.connection, 
											resultsPerPage: 8,
											apsdbStoreName: self.target,
											fields: self.fldFields.value, 
											label: "name"})

			var attrs = {
				store: store,
				query: queryString,
//		        runAs: runAsString,
		        aggregates: self.fldAggregates.value,
		        sort: self.fldSorting.value,
		        ftsQuery: self.fldFts.value,
				columns: self.fldFields.value,
				page: 1
			}
			
			self.openWidget = new apstrata.admin.QueryResultsPanel({parentList: self.panel, container: self.container})
			self.container.addChild(self.openWidget)
	},
	
	destroy: function() {
		if (this.openWidget) this.openWidget.destroy()
		this.inherited(arguments)
	}
})

dojo.declare("apstrata.admin.QueryPanel", 
[apstrata.widgets.HStackablePanel], 
{
	constructor: function(attrs) {
		this._target = attrs.target
	},

	postCreate: function() {
		var self = this
		this.panel = new apstrata.admin.Query({panel: self, target: self.target, container: self.container, connection: self.container.connection})
		this.addChild(this.panel)
		
		this.inherited(arguments)
	},
	
	destroy: function() {
//		this.removeChild(this.panel)
		this.panel.destroy()
		this.inherited(arguments)
	}
})
