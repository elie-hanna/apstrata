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
dojo.provide("apstrata.horizon.blue.ListOfDocuments")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.ListOfDocuments")
dojo.require("apstrata.horizon.blue.TestData")

dojo.declare("apstrata.horizon.blue.ListOfDocuments", 
[apstrata.horizon.ListOfDocuments], 
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

		// css classes
		this.listCssClass = "listOfDocuments"
		this.formCssClass = "listOfDocumentsForm"
		
		// Store
		this.store = musicStore // defined in apstrata.horizon.blue.TestData
	
		// Form Definition	
		this.set("formDefinition", "all",  {
			label: "Album",
			fieldset: [
				{name: "Name"},	
				{name: "Artist"},	
				{name: "Genre"},
				{name: "Album"},	
				{name: "Track"},	
				{name: "Heard", type: "boolean"},
				{name: "Checked", type: "boolean"},
				{name: "Year"},
				{name: "Length"},	
				{name: "Composer"},	
				{name: "Download Date"},
				{name: "Last Played"}
			],
			actions: ['save', 'cancel']
		})
	}	
})
