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
dojo.provide("apstrata.devConsole.GroupsPanel")
dojo.provide("apstrata.devConsole.GroupEditPanel")

dojo.declare("apstrata.devConsole.GroupsPanel", 
[apstrata.horizon.HStackableList], 
{	
	data: [],
	editable: true,
	noEdit: true,
	
	reload: function() {
		var self = this

		this.container.client.call({
			action: "ListGroups",
			load: function(operation) {
				// Rearrange the result to suite the template
				self.data = []
				dojo.forEach(operation.response.result.groups, function(group) {
					self.data.push({label: group['@name'], iconSrc: ""})
				})
	
				// Cause the DTL to rerender with the fresh self.data
				self.render()
			},
			error: function(operation) {
			}
		})
	},
	
	postCreate: function() {
		this.reload()
		this.inherited(arguments)
	},
	
	onDeleteItem: function(index, label){
		var self = this
		
		this.container.client.call({
			action: "DeleteGroup",
			request: {
				apsim: {
					group: label
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
		this.openPanel(apstrata.devConsole.GroupEditPanel)

		this.inherited(arguments)
	}
})


dojo.declare("apstrata.devConsole.GroupEditPanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/GroupEditPanel.html"),
	
	_save: function() {
		var self = this
		
		this.container.client.call({
			action: "CreateGroup",
			request: {
				apsim: {
					group: self.groupName.value
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

