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
dojo.provide("apstrata.horizon.blue.NewList")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.NewList")
dojo.require("apstrata.horizon.blue.TestData")

dojo.declare("apstrata.horizon.blue.NewList", 
[apstrata.horizon.NewList], 
{
	labelAttribute: "Album",
	
	constructor: function() {
		var self = this

		//
		// widget attributes
		//
		this.filterable = true
		this.sortable = true
		this.editable = true
		this.maximizable = false
		
		this.store = musicStore // defined in apstrata.horizon.blue.TestData
	},
		
	postCreate: function() {
		dojo.style(this.domNode, "width", "240px")
		this.inherited(arguments)	
	},
	
	isItemDeleteable: function(item) {
		return item.canBeDeleted
	},
	
	isItemEditable: function(item) {
		return item.canBeEdited
	},
	
	//
	// Calculate special item attributes: label, id, isDeleteable, isEditable
	//
	itemIsDeleteable: function(item) {
		return item.canBeDeleted
	},
	
	itemIsEditable: function(item) {
		return item.canBeEdited
	}	
})
