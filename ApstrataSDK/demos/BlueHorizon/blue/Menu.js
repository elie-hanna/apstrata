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
dojo.provide("apstrata.horizon.blue.Menu")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.Menu")

dojo.declare("apstrata.horizon.blue.Menu", 
[apstrata.horizon.Menu], 
{
	items: [
			{	
				id:"home", 
				label: "Home", 
				iconSrc: apstrata.baseUrl+"/../horizon/resources/images/pencil-icons/home.png",
				panelClass: "apstrata.horizon.blue.Home"
			},
			{
				id:"panel", 
				label: "Panel", 
				iconSrc: apstrata.baseUrl+"/../horizon/resources/images/pencil-icons/computer.png", 
				panelClass: "apstrata.horizon.blue.Panel"
			},
			{
				id:"listOfDocs", 
				label: "List of docs", 
				iconSrc: apstrata.baseUrl+"/../horizon/resources/images/pencil-icons/computer.png",
				panelClass: "apstrata.horizon.blue.ListOfDocuments"
			},
			{
				id:"list", 
				label: "List", 
				iconSrc: apstrata.baseUrl+"/../horizon/resources/images/pencil-icons/computer.png", 
				panelClass: "apstrata.horizon.blue.List"
			},
			{
				id:"grid", 
				label: "Grid", 
				iconSrc: apstrata.baseUrl+"/../horizon/resources/images/pencil-icons/computer.png", 
				panelClass: "apstrata.horizon.blue.Grid"
			},
			{
				id:"colors", 
				label: "Colors", 
				iconSrc: apstrata.baseUrl+"/../horizon/resources/images/pencil-icons/computer.png", 
				panelClass: "apstrata.horizon.blue.Colors"
			},
			{
				id:"newList", 
				label: "New List", 
				iconSrc: apstrata.baseUrl+"/../horizon/resources/images/pencil-icons/computer.png",
				panelClass: "apstrata.horizon.blue.NewList"
			},
			{
				id:"wrapper", 
				label: "Wrapper", 
				iconSrc: apstrata.baseUrl+"/../horizon/resources/images/pencil-icons/computer.png",
				panelClass: "apstrata.horizon.WrapperPanel",
				attrs: {
					widgetClass: "dijit.form.Button",
					attrs: {
						label: "KILL BILL"
					} 
				}
			},
			{
				id:"apstrata", 
				label: "apstrata widgets", 
				iconSrc: apstrata.baseUrl+"/../horizon/resources/images/pencil-icons/datebase.png", 
				panelClass: "apstrata.horizon.blue.ApstrataMenu"
			}
	],
	
	
	constructor: function(args) {
		var self = this
		//
		// widget attributes
		//
		this.filterable = true
		this.sortable = true
		this.editable = false

		this.store = new dojo.store.Memory({data: self.items})
	},
	
	startup: function() {
		
		dojo.require("apstrata.horizon.blue.Home")
		//var a = this.openPanel(apstrata.horizon.blue.Home)
		//a.deferred.then(function() {
		//	console.debug(a.id +' done')
		//})
		
		this.inherited(arguments)
	}
})

