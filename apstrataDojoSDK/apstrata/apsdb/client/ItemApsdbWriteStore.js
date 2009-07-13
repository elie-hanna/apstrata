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


dojo.provide("apstrata.apsdb.client.ItemApsdbWriteStore");

dojo.require("dojo.data.api.Request")

dojo.require("apstrata.apsdb.client.Connection")
dojo.require("apstrata.util.logger.Logger")
dojo.require("apstrata.apsdb.client.Client")

dojo.declare("apstrata.apsdb.client.ItemApsdbWriteStore", 
	[apstrata.apsdb.client.ItemApsdbReadStore],
	{
		_dirty: [],
		
		constructor: function(attrs) {
			this._features = {'dojo.data.api.Read':true, 'dojo.data.api.Identity':true,
								'dojo.data.api.Write':true, 'dojo.data.api.Notification':true}
								
			this._key = 0
		},


		
		//
		// dojo.data.api.Write
		//		
		newItem: function(/* Object? */ keywordArgs, /*Object?*/ parentInfo){
			//    keywordArgs:
			//        A javascript object defining the initial content of the item as a set of JavaScript 'property name: value' pairs.
			// 		  if keyword args contains reserved attribute name '@key' assume this is the identity 
			//    parentInfo:
			//        An optional javascript object defining what item is the parent of this item (in a hierarchical store.  Not all stores do hierarchical items),
			//        and what attribute of that parent to assign the new item to.  If this is present, and the attribute specified
			//        is a multi-valued attribute, it will append this item into the array of values for that attribute.  The structure
			//        of the object is as follows:
			//        {
			//            parent: someItem,
			//            attribute: "attribute-name-string"
			//        }
			
			var self = this
			var item = new apstrata.apsdb.client._Item({fieldNames: this._fieldsArray})

			// if dockey is supplied
			if (keywordArgs["documentKey"]) item.setIdentity(keywordArgs["documentKey"]);
			// otherwise assign temporary ID
//			else item.setIdentity(this._key++)

			for (var attribute in keywordArgs) {
				// if keyword args contains reserved attribute name '@key' assume this is the identity 
				if (attribute != "documentKey") item.setValue(attribute, "string", keywordArgs[attribute])
			}
			
			// when a new item is created it is considered loaded
			item.loaded = true
			self._addItem(item)
			
			if (parentInfo==undefined) {
				// push the item into the dirty buffer
				this._dirty.push({type: 'n', item: item})
			} else {
				// update parent info to contain pointer to child
				if (!self.isItemLoaded(parentInfo.parent))  {
					self.loadItem({
						item: parentInfo.parent,
						onItem: function(parent) {
							self._addChildToParent(item, {parent: parent, attribute: parentInfo.attribute})
						},
						onError: function(error) {
							throw new Error(error)
						}
					})
				} else {
					self._addChildToParent(item, parentInfo)
				}				
			} 
			
			this.onNew (item, parentInfo)

			return item
		},
	
		_addChildToParent: function(item, parentInfo) {
			var self = this
			
			// get the exiting children
			var children = self.getValues(parentInfo.parent, parentInfo.attribute)
			if (!children) children = []

			// add new Item 
			children.push(self.getIdentity(item))

			// save
			self.setValues(parentInfo.parent, parentInfo.attribute, children)

			self._dirty.push({type: 'n', item: item})
			self._dirty.push({type: 'n', item: parentInfo.parent})
		},
		
		deleteItem: function(/* item */ item) {
			// push the item into the dirty buffer
			this._dirty.push({type: 'd', item: item})
			this._removeItem(item)
			
			this.onDelete(item)
		},
		
		setValue: function(/* item */ item, /* string */ attribute, /* almost anything */ value) {
			var oldValue = item.getValue(attribute)
			item.setValue(attribute, "string", value)
			this._dirty.push({type: 'u', item: item})
			
			this.onSet(item, attribute, oldValue, value)
		},
		
		setValues: function(/* item */ item, /* string */ attribute, /* array */ values) {
			var oldValues = dojo.clone(item.getValues(attribute))
			item.setValues(attribute, "string", values)			
			this._dirty.push({type: 'u', item: item})

			this.onSet(item, attribute, oldValues, values)
		},
		
		unsetAttribute: function(/* item */ item, /* string */ attribute) {
			var oldValues = item.getValues(attribute)
			item.unsetAttribute(attribute)
			this._dirty.push({type: 'u', item: item})

			this.onSet(item, attribute, oldValues, null)
		},
		
		save: function(/* object */ keywordArgs) {
			//    keywordArgs:
			//        {
			//            onComplete: function
			//            onError: function
			//            scope: object
			//        }
			var self = this
			
			dojo.forEach(this._dirty, function(dirtyWrapper) {
				if (dirtyWrapper.type == "d") {
					self._client.queue("DeleteDocument", {store: self._store, documentKey: dirtyWrapper.item.getIdentity()})
				} else {
					var docKey = ""
					
					if (dirtyWrapper.type == "u") {
						docKey = dirtyWrapper.item.getIdentity()
					}
					
					var fields = dirtyWrapper.item.getFields()
					
					self._client.queue("SaveDocument", {
															store: self._store, 
															fields: fields
														})
				}
			})
												
			this._client.execute({
									success: function(){
										keywordArgs.onComplete()
									},
									iterationFailure: function(operation) {
										keywordArgs.onError(operation.errorMessage)										
									},
									failure: function(){
									}
								})
								
			this._dirty = []					
									
		},
		
		revert: function() {
			
		},
		
		isDirty: function(/* item? */ item) {
			return (this._dirty.length > 0) 
		},

		//
		// dojo.data.api.Notification
		//
		onSet: function(item, attribute, oldValue, newValue) {},
		onNew: function(newItem, parentInfo) {},
		onDelete: function(deletedItem) {}
	})