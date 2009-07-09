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
			var self = this
			var item = new apstrata.apsdb.client._Item({fieldNames: this._fieldsArray})

			// Assign temporary ID
			item.setIdentity(this._key++)
			for (var attribute in keywordArgs) {
				item.setValue(attribute, "string", keywordArgs[attribute])
			}

			self._addItem(item)
			if (parentInfo!=undefined) {
				// update parent info to contain pointer to child
			}
			
			// push the item into the dirty buffer
			this._dirty.push({type: 'n', item: item})
			this.onNew (item, parentInfo)
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
			var oldValues = item.getValues(attribute)
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
					
					var fields = {}

					for (fieldName in dirtyWrapper.item.fieldsMap) {
						fields[fieldName] = dirtyWrapper.item.fieldsMap[fieldName].values
					}

					self._client.queue("SaveDocument", {
															store: self._store, 
															documentKey: docKey,
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
			
		},

		//
		// dojo.data.api.Notification
		//

		onSet: function(item, attribute, oldValue, newValue) {
			
		},
		
		onNew: function(newItem, parentInfo) {
			
		},
		
		onDelete: function(deletedItem) {
			
		}

	})