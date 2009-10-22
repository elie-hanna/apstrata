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

dojo.provide("apstrata.admin.QueryResultsPanel")
dojo.provide("apstrata.admin.QueryResults")

dojo.require('apstrata.widgets.QueryWidget')


dojo.declare("apstrata.admin.QueryResults", 
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,	
	templatePath: dojo.moduleUrl("apstrata.admin", "templates/QueryResults.html"),
	
	constructor: function(attrs) {
		this.attrs = attrs
	},
	
	postCreate: function() {
		this.grid = new apstrata.widgets.QueryWidget(this.attrs.query);
		dojo.place(this.grid.domNode, this.dvGrid, "first")		
	},
	
	destroy: function() {
		if (this.grid) this.grid.destroy()
		this.inherited(arguments)
	}
})

dojo.declare("apstrata.admin.QueryResultsPanel", 
[apstrata.widgets.HStackablePanel], 
{
	constructor: function(attrs) {
		this.attrs = attrs
	},

/*
	postCreate: function() {
		var self = this
	
		
		
		var grid = new apstrata.widgets.QueryWidget(this.attrs.query);

		this.addChild(grid)		
		this.inherited(arguments)
	},
*/
	postCreate: function() {
		var self = this

		dojo.style(this.domNode, {
			width: "800px",
		})

		this.panel = new apstrata.admin.QueryResults({panel: self, 
												container: self.container, 
												attrs: self.attrs})

		this.addChild(this.panel)
		
		this.inherited(arguments)
	},
	
	destroy: function() {
		if (this.panel) this.panel.destroy()
		this.inherited(arguments)
	}
	
})
