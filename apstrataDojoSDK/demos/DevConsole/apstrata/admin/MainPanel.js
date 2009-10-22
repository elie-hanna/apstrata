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
		{label: "favourites", iconSrc: "../../apstrata/resources/images/pencil-icons/favourites.png"}
	],
	
	postCreate: function() {
		var self = this
		
		dojo.connect(self, 'onClick', function(index, label) {
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
			} else if (label == 'stores') {
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
//				self.openWidget = new apstrata.admin.QueryPanel({parentList: self, container: self.container})
				self.openWidget = new apstrata.admin.SchemaEditorPanel({parentList: self, container: self.container})
				self.container.addChild(self.openWidget)
			} 
		})
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
