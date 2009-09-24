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

dojo.provide("apstrata.widgets.QueryWidget")

dojo.require("dojox.grid.DataGrid")

dojo.require ("apstrata.widgets.PageNumberSelector")
dojo.require ("apstrata.apsdb.client.widgets.ConnectionStatus")

dojo.declare("apstrata.widgets.QueryWidget", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templateString: "<div style='width: 100%; height: 100%;'><div dojoAttachPoint='dvSpinner'></div><div dojoAttachPoint='dvGrid' style='width: 100%; height: 100%;'></div></div>",
	store: null,
	query: "X!=\"Y\"",
	columns: "apsdb.documentKey",
	runAs: "",
	aggregates: "",
	sort: "",
	ftsQuery: "",
	page: 1,
	rows: 10,

	constructor: function(attrs){
		var self = this
		if (attrs.store) this.store = attrs.store
		if (attrs.query) this.query = attrs.query
		if (attrs.page) this.page = attrs.page
		if (attrs.columns) this.columns = attrs.columns
	    if (attrs.runAs) this.runAs = attrs.runAs
	    if (attrs.aggregates) this.aggregates = attrs.aggregates
	    if (attrs.sort) this.sort = attrs.sort
	    if (attrs.ftsQuery) this.ftsQuery = attrs.ftsQuery
		if (attrs.layout) {
			this._layout=layout; 
		} else {
				this._layout = []
		
				// compute layout
				dojo.forEach(self.columns.split(","), function(field) {
					field = dojo.string.trim(field)
					self._layout.push({ field: field, name: field, width: 'auto' })
				})		
			}
	},
	
	postCreate: function() {
		var self = this

		dojo.connect(self.store, "totalPagesCalculated", function(pages, itemsCount) {
			if (self._spinner == undefined) {
				self._spinner = new apstrata.widgets.PageNumberSelector({min:1, max:pages, value:1, visibleRange: 10, bigStep: 5})
		        self.dvSpinner.appendChild(self._spinner.domNode);
				
				dojo.connect(self._spinner, "onChange", function() {
					self.page = self._spinner.value
					self._refresh()
				})
			}
		})			

		this._refresh()
	},
	
	destroy: function() {
		if (this._grid) {
			this._grid.destroy()
		}

		if (this._spinner) {
			this._spinner.destroy()
		}		
		
		this.inherited(arguments)
	},
	
	setQuery: function(query) {
		this.query = query
		this._refresh()
	},
	
	setPage: function(page) {
		this.page = page
		this._refresh()
	},
	
	_refresh: function() {
		var self = this
		
		if (this._grid) {
			this._grid.destroy()
			this.dvGrid.innerHTML = ""
		}
			
        // create a new grid:
        this._grid = new dojox.grid.DataGrid({
            query: {
				query: self.query,
				count: (self.page == 1),
				pageNumber: self.page,
		        runAs: self.runAs,
		        aggregates: self.aggregates,
		        sort: self.sort,
		        ftsQuery: self.ftsQuery
			}, 
            store: self.store,
            rowSelector: '15px',
            structure: self._layout
        }, document.createElement('div'));
	
        // append the new grid to the div "gridContainer4":
        this.dvGrid.appendChild(this._grid.domNode);

        // Call startup, in order to render the grid:
        this._grid.startup();			
	}
})


