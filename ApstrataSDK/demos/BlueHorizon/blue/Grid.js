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
dojo.provide("apstrata.horizon.blue.Grid")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.sdk.ObjectStore")
dojo.require("apstrata.horizon.Grid")
dojo.require("apstrata.horizon.blue.TestData")

dojo.declare("apstrata.horizon.blue.Grid", 
[apstrata.horizon.Grid], 
{
	idProperty: 'key',
	labelProperty: 'title',
	editable: true,

	constructor: function() {
		var self = this
		
		this.rowsPerPage = 10

		this.gridParams = {
			rowsPerPage: self.rowsPerPage,
			
			store:  new apstrata.horizon.blue.ObjectStoreAdaptor({objectStore: musicStore}),
			
			structure: [
				// view 1
//				{ cells: [ new dojox.grid.cells.RowIndex({width: "30px"}) ], noscroll: true},
				// view 2
				[
					{ field: 'Genre', editable: 'false', width: 'auto' },
					{ field: 'Artist', editable: 'false', width: 'auto' },
					{ field: 'Name', editable: 'false', width: 'auto' },
					{ field: 'Composer', editable: 'false', width: 'auto' },
					{ field: 'Year', editable: 'false', width: 'auto' }
				]
			],
			rowSelector: "15px"
		}
	},
	
	postCreate: function() {
		dojo.style(this.domNode, "width", "600px")

		this.inherited(arguments)
	}

})

dojo.declare("apstrata.horizon.blue.ObjectStoreAdaptor", 
[dojo.data.ObjectStore], 
{
	onSet: function(item, attribute, old, value) {
		var object = item
		object[attribute] = value
		this.objectStore.put(object)
	}
})

