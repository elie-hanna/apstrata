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

dojo.provide("apstrata.admin.StoresPanel")

dojo.declare("apstrata.admin.StoresPanel", 
[apstrata.widgets.HStackableList], 
{
	data: [],
	editable: true,
	
	postCreate: function() {
		var self = this

		var operation = this.container.client.listStores(function() {
			// Rearrange the result to suite the template
			self.data = []
			dojo.forEach(operation.result.stores, function(store) {
				self.data.push({label: store['@name'], iconSrc: ""})
			})

			// Cause the DTL to rerender with the fresh self.data
			self.render()

			dojo.connect(self, 'onClick', function(index, label) {
				if (self.openWidget) self.openWidget.destroy()

				self.openWidget = new apstrata.admin.StoreOperations({parentList: self, container: self.container, target: label})
				self.container.addChild(self.openWidget)
			})
		})				
		
		self.inherited(arguments)
	},
	
	destroy: function() {
		if (this.openWidget) this.openWidget.destroy()
		this.inherited(arguments)
	}
})			
