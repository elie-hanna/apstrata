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
dojo.provide("apstrata.devConsole.StoresPanel")
dojo.provide("apstrata.admin.StoreOperations")
dojo.provide("apstrata.devConsole.StoresEditPanel")

dojo.require("apstrata.devConsole.QueryPanel")

dojo.declare("apstrata.devConsole.StoreOperations", 
[apstrata.horizon.HStackableList], 
{
	data: [
		{label: "Query", iconSrc: "../../apstrata/resources/images/pencil-icons/search.png"},
		{label: "Saved Query", iconSrc: "../../apstrata/resources/images/pencil-icons/savedQuery.png"},
		{label: "Edit Store", iconSrc: "../../apstrata/resources/images/pencil-icons/schema.png"}
	],

	constructor: function(attrs) {
		this.target = attrs.target
	},

	postCreate: function() {
		var self = this
		
		dojo.publish("/apstrata/documentation/topic", [{
			topic: "apstrata Query APIs",
			id: "QueryAPI"
		}])

		dojo.connect(self, 'onClick', function(index, label) {
			if(label == 'Query') {
				self.closePanel()
				self.openPanel(apstrata.devConsole.QueryPanel, {target: self.target})
			} 
		})

		this.inherited(arguments)
	}
})
 
dojo.declare("apstrata.devConsole.StoresPanel",
[apstrata.horizon.HStackableList], 
{	
	data: [],
	editable: true,
	
	reload: function() {
		var self = this

		this.container.client.call({
			action: "ListStores",
			load: function(operation) {
				// Rearrange the result to suite the template
				self.data = []
				dojo.forEach(operation.response.result.stores, function(store) {
					self.data.push({label: store['name'], iconSrc: ""})
				})
	
				// Cause the DTL to rerender with the fresh self.data
				self.render()
	
				dojo.connect(self, 'onClick', function(index, label) {
					self.openPanel(apstrata.devConsole.StoreOperations, {target: label})
				})
			},
			error: function(operation) {
			}
		})
	},
	
	postCreate: function() {
		var self = this

		dojo.publish("/apstrata/documentation/topic", [{
			topic: "apstrata Stores APIs",
			id: "StoresAPI"
		}])

		this.reload()		

		self.inherited(arguments)
	},

	onDeleteItem: function(index, label){
		var self = this
		
		this.container.client.call({
			action: "DeleteStore",
			request: {
				apsdb: {
					store: label
				}
			},
			load: function(operation){
				self.reload()
			},
			error: function(operation){
			}
		})
	},

	newItem: function() {
		this.openPanel(apstrata.devConsole.StoresEditPanel)

		this.inherited(arguments)
	}
})

dojo.declare("apstrata.devConsole.StoresEditPanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/StoresEditPanel.html"),
	
	_save: function() {
		var self = this
		
		this.container.client.call({
			action: "CreateStore",
			request: {
				apsdb: {
					store: self.storeName.value
				}
			},
			load: function(operation) {
				self.getParent().reload()
				self.getParent().closePanel()
			},
			error: function(operation) {
			}
		})
	},
	
	_cancel: function() {
		this.panel.destroy()
	}
})


