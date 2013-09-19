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
dojo.provide("apstrata.home.dashboard.Menu");

dojo.require("dojo.store.Memory");
dojo.require("apstrata.horizon.Menu");

dojo.declare("apstrata.home.dashboard.Menu", 
[apstrata.horizon.Menu], 
{
	
	items: [			
			{
				id :"profile", 
				label : "User Profile", 
				panelClass : "apstrata.home.dashboard.Profile",					
			},
			
			{
				id :"accounts", 
				label : "View accounts", 
				panelClass : "apstrata.home.dashboard.Accounts",					
			}		
			
	],
		
	constructor: function(args) {
		var self = this;
		this.filterable = false;
		this.sortable = false;
		this.editable = false;
				
		this.store = new dojo.store.Memory({data: self.items});
		if (args && args.connection){
			self.connection = args.connection;
			dojo.forEach(self.items, function(item, index){
				item.attrs["connection"] = self.connection;
			});
		}
	},
	
	startup: function() {
					
		this.inherited(arguments)
	},
	
	onClick: function(index, id, args) {
		if (id == 'logout') {
			this.getContainer().logout();;
		} else {
			this.inherited(arguments);
		}
	}
})