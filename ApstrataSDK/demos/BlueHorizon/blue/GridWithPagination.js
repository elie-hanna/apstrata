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
dojo.provide("apstrata.horizon.blue.GridWithPagination")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.Grid")
dojo.require("dojox.grid.EnhancedGrid")
dojo.require("dojox.grid.enhanced.plugins.Pagination");

dojo.declare("apstrata.horizon.blue.GridWithPagination", 
[apstrata.horizon.Grid], 
{
	idProperty: 'key',
	labelProperty: 'title',

	constructor: function() {
		var self = this
		
		this.rowsPerPage = 25
		this.editable= false

		var storeParams = {
			connection: bluehorizon.config.apstrataConnection,
			store: "DefaultStore",
			resultsPerPage: self.rowsPerPage,
			queryFields: "id, title, ownername, tags, views, datetaken",

			// used to indicate the sort type to be applied to a column
			fieldTypes: {
				id: "strting",
				title: "string",
				ownername: "string",
				tags: "string",
				views: "numeric",
				datetaken: "date"
			}
		}

		this.gridParams = {
			rowsPerPage: self.rowsPerPage,
			
			store:  new apstrata.ObjectStoreAdaptor({objectStore: new apstrata.ObjectStore(storeParams)}),
			
			structure: [
				// view 1
				{ cells: [ new dojox.grid.cells.RowIndex({width: "30px"}) ], noscroll: true},
				// view 2
				[
					// { field: 'key', width: 'auto' },
					{ field: 'id', editable: 'false', width: 'auto' },
					{ field: 'title', editable: 'false', width: 'auto' },
					{ field: 'ownername', editable: 'false', width: 'auto' },
					{ field: 'tags', editable: 'false', width: 'auto' },
					{ field: 'views', editable: 'false', width: '35px' },
					{ field: 'datetaken', editable: 'false', width: 'auto' }
				]
			],
			
			plugins: {
				pagination: {
					pageSizes: ["10", "25", "50", "100"],	// Array, custom the items per page button
					itemTitle: "docs", 	// String, custom the item' title of description
					description: "100px",	// boolean, custom whether or not the description will be displayed
					sizeSwitch: "100px",	// boolean, custom whether or not the page size switch will be displayed
					pageStepper: "100px",	// boolean, custom whether or not the page step will be displayed
					gotoButton: true,	// boolean, custom whether or not the goto page button will be displayed
					maxPageStep: 7,		// Integer, custom how many page step will be displayed
					position: "bottom"	// String, custom the position of the pagination bar
											// there're three options: top, bottom, both
					// ,descTemplate: "${1} ${0}" // A template of the current position description.
				}
			},
			
			rowSelector: "15px"
		}

		this.gridClass = dojox.grid.EnhancedGrid
	},
	
	postCreate: function() {
		dojo.style(this.domNode, "width", "600px")

		this.inherited(arguments)
	},
	
	filter: function(attr) {
		var self = this
		
		var storeParams = {
			connection: bluehorizon.config.apstrataConnection,
			store: "DefaultStore",
			resultsPerPage: self.rowsPerPage,
			queryExpression: 'testData="UFO"',  // AND title="' + search + '"
			queryExpression: 'tags like "' + attr.search.trim() + '%"',
			queryFields: "id, title, ownername, tags, views, datetaken",
			fieldTypes: ['string', 'string', 'string', 'numeric', 'date']
		}

//		storeParams.ftsQuery = attr.search.trim()
		
		self._grid.setStore(new apstrata.ObjectStoreAdaptor({objectStore: new apstrata.ObjectStore(storeParams)}))
	}
})
