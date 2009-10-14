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

	postCreate: function() {
		var self = this

		var client = new apstrata.apsdb.client.Client(this.container.connection)

		var operation = client.listGroups(function() {
			self.data = []
			dojo.forEach(operation.result.groups, function(group) {
				self.data.push({label: group['@name'], iconSrc: ""})
			})			
			
			self.render()
		},
		function() {
			
		})

		self.inherited(arguments)
	},
	
	onClick: function(index, label) {
	},
	
	onDeleteItem: function(index, label) {
		
	},

	newItem: function() {
		var self = this
		if (this.openWidget) this.openWidget.destroy()
		
		self.openWidget = new apstrata.admin.GroupEditPanel({parentList: self, container: self.container, target: ''})
		self.container.addChild(self.openWidget)

		this.inherited(arguments)
	}
})
