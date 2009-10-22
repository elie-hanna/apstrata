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

dojo.provide("apstrata.admin.UsersPanel")

dojo.declare("apstrata.admin.UsersPanel", 
[apstrata.widgets.HStackableList], 
{

	data: [],
	editable: true,

	msgDelete: "are you sure you want to delete user: ",

	postCreate: function() {
		this.refresh()
		this.inherited(arguments)
	},
	
	refresh: function() {
		var self = this

		this.container.client.call({
			action: "ListUsers",
			load: function(operation) {
				// Rearrange the result to suite the template
				self.data = []
				dojo.forEach(operation.response.result.users, function(user) {
					self.data.push({label: user['@name'], iconSrc: ""})
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
		var self = this
		if (this.openWidget) this.openWidget.destroy()


		this.container.client.call({
			action: "GetUser",
			fields: {
				apsim: {
					user: label
				}
			},
			load: function(operation) {
				var user = {}
				user.name = operation.response.result.user['@name']

				dojo.forEach(operation.response.result.user.attributes, function(attribute) {
					user[attribute['@name']] = attribute.values.value
				})
	
					var attrs = {	parentList: self, 
									container: self.container, 
									target: label,
									user: user}
					
				self.openWidget = new apstrata.admin.UserEditPanel(attrs)
	
				self.container.addChild(self.openWidget)

			},
			error: function(operation) {
			}
		})

		this.inherited(arguments)		
	},
	
	onDeleteItem: function(index, label) {
		var self = this

		this.container.client.call({
			action: "DeleteUser",
			fields: {
				apsim: {
					user: label
				}
			},
			load: function(operation) {
				if (self.openWidget) self.openWidget.destroy()
				self.refresh()
			},
			error: function(operation) {
			}
		})
	},
	
	newItem: function() {
		var self = this
		if (this.openWidget) this.openWidget.destroy()
		
		self.openWidget = new apstrata.admin.UserEditPanel({parentList: self, container: self.container, target: ''})
		self.container.addChild(self.openWidget)

		this.inherited(arguments)
	},
	
	destroy: function() {
		if (this.openWidget) this.openWidget.destroy()
		
		this.inherited(arguments)
	}
})
