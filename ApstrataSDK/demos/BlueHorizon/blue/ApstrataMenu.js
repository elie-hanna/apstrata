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
dojo.provide("apstrata.horizon.blue.ApstrataMenu")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.Menu")

dojo.declare("apstrata.horizon.blue.ApstrataMenu", 
[apstrata.horizon.Menu], 
{
	items: [
		{	
			id:"home", 
			label: "Home", 
			iconSrc: apstrata.baseUrl+"/horizon/resources/images/pencil-icons/home.png",
			panelClass: "apstrata.horizon.blue.ApstrataHome"
		},
		{
			id:"list", 
			label: "List from apstrata", 
			iconSrc: apstrata.baseUrl+"/horizon/resources/images/pencil-icons/computer.png", 
			panelClass: "apstrata.horizon.blue.ApstrataList"
		},
		{
			id:"grid", 
			label: "Grid", 
			iconSrc: apstrata.baseUrl+"/horizon/resources/images/pencil-icons/computer.png", 
			panelClass: "apstrata.horizon.blue.ApstrataGrid"
		},
		{
			id:"gridWithPagination", 
			label: "Grid with pagination", 
			iconSrc: apstrata.baseUrl+"/horizon/resources/images/pencil-icons/computer.png", 
			panelClass: "apstrata.horizon.blue.ApstrataGridWithPagination"
		},
		{	
			id:"preferences", 
			label: "Preferences", 
			iconSrc: apstrata.baseUrl+"/horizon/resources/images/pencil-icons/tick.png", 
			panelClass: "apstrata.horizon.Preferences"
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
	}	
})

