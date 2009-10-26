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

dojo.provide("apstrata.admin.GroupsPanel")

dojo.declare("apstrata.admin.GroupsPanel", 
[apstrata.widgets.HStackableList], 
{
	data: [],
	editable: true,
	noEdit: true,

	postCreate: function() {
		this.refresh()
		this.inherited(arguments)
	},
	
	refresh: function() {
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
		
		this.inherited(arguments)
	},
	
	onClick: function(index, label) {
	},
	
	onDeleteItem: function(index, label) {
		var self = this
		
		this.container.client.call({
			action: "DeleteGroup",
			fields: {
				apsdb: {
					groupName: label
				}
			},
			load: function(operation) {
				self.refresh()
			},
			error: function(operation) {
			}
		})
	},

	newItem: function() {
		var self = this
		if (this.openWidget) this.openWidget.destroy()
		
		self.openWidget = new apstrata.admin.GroupEditPanel({parentList: self, container: self.container, target: ''})
		self.container.addChild(self.openWidget)

		this.inherited(arguments)
	},

	destroy: function() {
		if (this.openWidget) this.openWidget.destroy()
		
		this.inherited(arguments)
	}
})
