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
dojo.provide("apstrata.horizon.blue.List")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.List")
dojo.require("apstrata.horizon.blue.TestData")

dojo.declare("apstrata.horizon.blue.List", 
[apstrata.horizon.List], 
{
	
	idProperty: 'id',
	labelProperty: 'Name',
	
	constructor: function() {
		var self = this

		//
		// widget attributes
		//
		this.filterable = true
		this.sortable = true
		this.editable = true
		this.maximizable = false
		
		//
		// Read only attributes
		//
		this.isDeletableCondition = {
			field: "canBeDeleted",
			value: true
		}
		
		this.isEditedCondition = {
			field: "canBeEdited",
			value: true
		}

		this.store = musicStore // defined in apstrata.horizon.blue.TestData
	},
		
	postCreate: function() {
		dojo.style(this.domNode, "width", "250px")
		this.inherited(arguments)	
	},
	
	itemIsDeleteable: function(item) {
		return true
	},

	itemIsEditable: function(item) {
		return false
	},

	onClick: function(index, id) {},
	
	onDeleteRequest: function(id, item) {
		var self = this
		new apstrata.horizon.PanelAlert({
			panel: self,
			width: 320,
			height: 100,
			message: "Are you sure you want to delete item: " + '[' + item.label + "] ?",
			//icon: "apstrata/horizon/resources/images/pencil-icons/bin-full.png",
			iconClass: "deleteIcon",
			actions: [
				'Yes',
				'No'
			],
			actionHandler: function(action) {
				if (action=='Yes') {
					self.deleteItem(id)
				}
			}
		})
	},
	
	onChangeRequest: function(id, oldValue, newValue, doChange, doRevert) {
		var self = this
		new apstrata.horizon.PanelAlert({
			panel: self,
			width: 320,
			height: 100,
			message: "Are you sure you want to change the label: " + '[' + oldValue + "] to [" + newValue + "] ?",
			//icon: "apstrata/horizon/resources/images/pencil-icons/draft.png",
			iconClass: "editIcon",
			actions: [
				'Yes',
				'No'
			],
			actionHandler: function(action) {
				if (action=='Yes') {
					self.changeItemLabel(id, newValue)
					self.setEditMode(false)
				} else {
					self.revertItemEdit()
				}
			}
		})
		
	}
})
