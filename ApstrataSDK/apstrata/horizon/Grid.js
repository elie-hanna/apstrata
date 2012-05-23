/*******************************************************************************
 *  Copyright 2009-2011 Apstrata
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
dojo.provide("apstrata.horizon.Grid")

dojo.require("dojox.grid.DataGrid")

dojo.require("apstrata.horizon.Panel")
dojo.require("apstrata.horizon.GridFTSearch")

/*
 * This Grid component provides the necessary functionality to instantiate the grid, filter and action areas
 * it also provides the main event handlers for adding, deleting and filtering the grid
 */
dojo.declare("apstrata.horizon.Grid", 
[apstrata.horizon.Panel], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/Grid.html"),
	widgetsInTemplate: true,

	store: null,
	rowsPerPage: 20,
	
	constructor: function() {
		this.editable = true
		this.filterable = true
		// If no custom grid widget is specified use default dojox.grid.DataGrid 
		if (!this.gridClass) this.gridClass = dojox.grid.DataGrid
	},
	
	startup: function() {
		var self = this

		// If no custom grid widget is specified use default apstrata.horizon.GridFTSearch 
		if(!this.filterClass) this.filterClass = apstrata.horizon.GridFTSearch
		if (this.filterable) {
			var filterDv = dojo.create("div", null, this.dvHeader)
			this._filter = new this.filterClass(null, filterDv)
			dojo.connect(this._filter, "search", dojo.hitch(this, "filter"))
		}
		
		this.resize()
		
		this._grid = new this.gridClass(this.gridParams)
		dojo.place(this._grid.domNode, this.dvContent)
		this._grid.startup()
		this._handle = dojo.connect(this._grid, "onRowClick", dojo.hitch(this, "onClick")) 

		this.inherited(arguments)
	},

	onClick: function(e) {
		// To obtain the selected items and clicked
		//  this._grid.selection.getSelected(), e.rowIndex
	},
	
	// function called each time containers dimensions change
	resize: function() {
		var self = this

		dojo.style(this.dvContent, "height", self.getContentHeight() + "px")				
		
		if (this._grid) {
			this._grid.resize({h: self.getContentHeight()})
			this._grid.update()
		}

		this.inherited(arguments)
	},
	
	addNodeToHeader: function(n) {
		dojo.place(n, this.dvHeader)
	},

	filter: function(attr) {},
	editItems: function() {},
	newItem: function() {},
	deleteItems: function() {
		// This just deletes the top item from the selection for now
		var deferred = this.gridParams.store.objectStore.remove(this._grid.selection.getSelected()[0].key)
		
		deferred.then(function(attr) {
			if (!attr) console.debug('fail'); else console.debug('success')
		})
	},

	getContentHeight: function() {
		var h, c, f
		
		h = dojo.marginBox(this.dvHeader).h
		c = dojo.contentBox(this.domNode).h
		f = dojo.marginBox(this.dvFooter).h
		
		return  c  - h - f
	}
})

