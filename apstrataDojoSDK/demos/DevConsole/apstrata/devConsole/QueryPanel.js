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

dojo.provide("apstrata.devConsole.QueryPanel")
dojo.provide("apstrata.devConsole.QueryResultsPanel")

dojo.require("dijit.form.Form");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.DateTextBox");

dojo.require('apstrata.ItemApsdbReadStore')
dojo.require('apstrata.widgets.QueryWidget')

dojo.declare("apstrata.devConsole.QueryResultsPanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,	
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/QueryResultsPanel.html"),
		
	constructor: function(attrs) {
		this.attrs = attrs
	},
	
	postCreate: function() {
		var self = this

		dojo.style(this.domNode, {
			width: "800px",
		})
		
		this.grid = new apstrata.widgets.QueryWidget(this.attrs.query);
		dojo.place(this.grid.domNode, this.dvGrid, "first")		

		this.inherited(arguments)
	},
	
	destroy: function() {
		if (this.grid) this.grid.destroy()
	}
})

dojo.declare("apstrata.devConsole.QueryPanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/QueryPanel.html"),

	constructor: function(attrs) {
		this._target = attrs.target
	},
	
	_query: function() {
			var self = this
			
			var queryString = this.txtQuery.value
			
			var columnsString = self.fldFields.value
			var aggregatesString = self.fldAggregates.value
			var sortingString = self.fldSorting.value
			var FTSString = self.fldFts.value

			if ((queryString == "") && (FTSString == "")) queryString = "q12345!=\"x12345\""

			var store = new apstrata.ItemApsdbReadStore({client: self.container.client, 
														resultsPerPage: 10,
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

			self.closePanel()
			self.openPanel(apstrata.devConsole.QueryResultsPanel, {query: attrs})
	}	
})

