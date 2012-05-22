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
dojo.provide('apstrata.horizon.Menu');
dojo.require('apstrata.horizon.List');

dojo.declare("apstrata.horizon.Menu", 
[apstrata.horizon.List], 
{
	/*
	 * the items array member should have this form:
	items: [
			{	
				id:"<unique key>", 
				label: "<label>", 
				iconSrc: "(optional) <icon>",
				panelClass: "(optional) <class to instantiate>",
				args: (options) instantion arguments for panelClass
			}
		]
	 */
	
	onClick: function(index, id, args) {
		var self = this	

		if (args && !args.menuItemId) args.menuItemId = id;
		if (this.store) dojo.when(
			this.store.get(id),
			function(item) {
				if (item.attrs) args = dojo.mixin(args, item.attrs)
				
				// in case the item has an associated class
				if (item.panelClass) {
					// load it dynamically
					dojo.require(item.panelClass)
					// (dojo.addOnLoad will insure that the module is loaded)
					dojo.addOnLoad(function() {
						// open it as a child panel
						self.openPanel(dojo.getObject(item.panelClass), args)
					})
				}
			}			
		)
	}
})
