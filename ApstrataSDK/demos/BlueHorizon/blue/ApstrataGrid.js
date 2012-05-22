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
dojo.provide("apstrata.horizon.blue.ApstrataGrid")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.Grid")

dojo.declare("apstrata.horizon.blue.ApstrataGrid", 
[apstrata.horizon.Grid], 
{
	idProperty: 'key',
	labelProperty: 'title',
	editable: true,

	constructor: function() {
		var self = this
		
		this.rowsPerPage = 10

		var storeParams = {
			connection: bluehorizon.config.apstrataConnection,
			store: "DefaultStore",
			resultsPerPage: self.rowsPerPage,
			//queryExpression: 'testData="batch4"',
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
			rowSelector: "15px"
		}
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
			// queryExpression: 'testData="batch3"',  // AND title="' + search + '"
			queryFields: "id, title, ownername, tags, views, datetaken",
			fieldTypes: ['string', 'string', 'string', 'numeric', 'date']
		}

		if (attr.search.trim()!='') {
				storeParams.ftsQuery = attr.search
		} 
		
		self._grid.setStore(new apstrata.ObjectStoreAdaptor({objectStore: new apstrata.ObjectStore(storeParams)}))
	}
})
