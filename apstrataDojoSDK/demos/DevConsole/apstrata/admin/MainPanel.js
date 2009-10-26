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
dojo.provide("apstrata.admin.MainPanel")

dojo.require('apstrata.admin.HomePanel')

dojo.require("apstrata.admin.LoginPanel")

dojo.require('apstrata.admin.StoresPanel')
dojo.require('apstrata.admin.StoreOperations')
dojo.require('apstrata.admin.UsersPanel')
dojo.require('apstrata.admin.UserEditPanel')
dojo.require('apstrata.admin.GroupsPanel')
dojo.require('apstrata.admin.GroupEditPanel')
dojo.require("apstrata.admin.QueryPanel")
dojo.require("apstrata.admin.QueryResultsPanel")
dojo.require('apstrata.admin.SchemasPanel')
dojo.require("apstrata.admin.SchemaEditorPanel")
dojo.require("apstrata.admin.PreferencesPanel")


dojo.declare("apstrata.admin.MainPanel", 
[apstrata.widgets.HStackableList], 
{
	data: [
		{label: "home", iconSrc: "../../apstrata/resources/images/pencil-icons/home.png"},
		{label: "stores", iconSrc: "../../apstrata/resources/images/pencil-icons/datebase.png"},
		{label: "schemas", iconSrc: "../../apstrata/resources/images/pencil-icons/schema.png"},
		{label: "scriptlettes", iconSrc: "../../apstrata/resources/images/pencil-icons/configuration.png"},
		{label: "groups", iconSrc: "../../apstrata/resources/images/pencil-icons/users.png"},
		{label: "users", iconSrc: "../../apstrata/resources/images/pencil-icons/user-man.png"},
		{label: "favourites", iconSrc: "../../apstrata/resources/images/pencil-icons/favourites.png"},
		{label: "preferences", iconSrc: "../../apstrata/resources/images/pencil-icons/tick.png"},
//		{label: "logout", iconSrc: "../../apstrata/resources/images/pencil-icons/left.png"}
	],
	
	postCreate: function() {
		var self = this
		
		dojo.subscribe("/apstrata/connection/login/success", function(data) {
			self.data.push({label: "logout", iconSrc: "../../apstrata/resources/images/pencil-icons/left.png"})
			self.render()
			
			if (self.openTarget) self.open(self.openTarget)
			delete self.openTarget
		});
		
		dojo.subscribe("/apstrata/connection/logout", function(data) {
			self.data.pop()
			self.render()
			self.open("home")
		});

		dojo.connect(self, 'onClick', function(index, label) {
			if (label == 'logout') {
				self.container.connection.logout()
			} else self.open(label)
		})
	},
	
	open: function(label) {
		var self = this

		//  add this and open panels will not be refereshed
		//	 if their label is clicked while they're already open
		//	if (label == self._lastLabel) return
		//  self._lastLabel = label
		
		if (self.openWidget) {
			self.openWidget.destroy()
			delete self.openWidget
		}

		if (label == 'home') {
			self.openWidget = new apstrata.admin.HomePanel({parentList: self, container: self.container})
			self.container.addChild(self.openWidget)
		} else {
			this.openTarget = label
			
			if (!this.container.connection.hasCredentials()) {
					self.openWidget = new apstrata.admin.LoginPanel({parentList: self, container: self.container})
					self.container.addChild(self.openWidget)
			} else {
				if (label == 'stores') {
					self.openWidget = new apstrata.admin.StoresPanel({parentList: self, container: self.container})
					self.container.addChild(self.openWidget)
				} else if (label == 'schemas') {
					self.openWidget = new apstrata.admin.SchemasPanel({parentList: self, container: self.container})
					self.container.addChild(self.openWidget)
				} else if (label == 'groups') {
					self.openWidget = new apstrata.admin.GroupsPanel({parentList: self, container: self.container})
					self.container.addChild(self.openWidget)
				} else if (label == 'users') {
					self.openWidget = new apstrata.admin.UsersPanel({parentList: self, container: self.container})
					self.container.addChild(self.openWidget)
				} else if (label == 'favourites') {
					self.openWidget = new apstrata.admin.LoginPanel({parentList: self, container: self.container})
					self.container.addChild(self.openWidget)
	//				self.openWidget = new apstrata.admin.QueryPanel({parentList: self, container: self.container})
	//				self.openWidget = new apstrata.admin.SchemaEditorPanel({parentList: self, container: self.container})
	//				self.container.addChild(self.openWidget)
				} else if (label == 'preferences') {
					self.openWidget = new apstrata.admin.PreferencesPanel({parentList: self, container: self.container})
					self.container.addChild(self.openWidget)
				} else if (label == 'logout') {
					this.container.connection.logout()
					self.open('home')
				}
			}
		}
	},
	
	startup: function() {
		this.home()		
	},
	
	home: function() {
		var self = this
		
		if (self.openWidget) {
			self.openWidget.destroy()
			delete self.openWidget
		}

		self.openWidget = new apstrata.admin.HomePanel({parentList: self, container: self.container})
		self.container.addChild(self.openWidget)
	}
})
