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
	
	reload: function() {
		var self = this

		this.container.client.call({
			action: "ListGroups",
			load: function(operation) {
				// Rearrange the result to suite the template
				self.data = []
				dojo.forEach(operation.response.result.groups, function(group) {
					self.data.push({label: group['name'], iconSrc: ""})
				})
	
				// Cause the DTL to rerender with the fresh self.data
				self.render()

				dojo.connect(self, 'onClick', function(index, label) {
					self.openPanel(apstrata.devConsole.GroupEditPanel, {target: label})
				})
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
				groupName: label
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
	groupName: '',
	update: false,
	newGroupName: '',

	constructor: function(attrs) {
		if (typeof attrs != 'undefined') {
			if (attrs.target) {
				this.groupName = attrs.target;
			} else {
				this.groupName = '';
			}

			if (attrs.target) {
				this.update = true;
			} else {
				this.update = false;
			}
		}
	},

	postCreate: function() {
		var self = this;
		self.groupNameField.value = self.groupName;
		this.inherited(arguments);
	},

	_save: function() {
		var self = this
		if (self.update) self.newGroupName = self.groupNameField.value;
		else self.groupName = self.groupNameField.value;

		// Do not update the group if the group name has not been changed.
		if (self.groupName == self.newGroupName) {
			dialog = new apstrata.widgets.Alert({width: 200,
				height: 250,
				actions: "Close",
				message: "<p>Group name not changed.</p>",
				clazz: "rounded-sml Alert",
				iconSrc: apstrata.baseUrl + "/resources/images/pencil-icons/alert.png",
				modal: true })
			dialog.show();

			dojo.connect(dialog, "buttonPressed", function(label) {
				dialog.hide();
			});
		} else {
			this.container.client.call({
				action: "SaveGroup",
				request: {
					"apsdb": {
						update: self.update
					},
					groupName: self.groupName,
					newGroupName: self.newGroupName
				},
				load: function(operation) {
					self.getParent().reload();
					self.getParent().closePanel();
				},
				error: function(operation) {
				}
			})
		}
	},
	
	_cancel: function() {
		this.panel.destroy()
	}
})

