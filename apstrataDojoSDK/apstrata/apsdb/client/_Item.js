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

dojo.provide("apstrata.apsdb.client._Item");

dojo.declare("apstrata.apsdb.client._Item", 
	[], 
	{		
		constructor: function(attrs) {
			//    attrs:
			//        {
			//				item: Object
			//				fieldNames: Array
			//        }
			//
			//    The *item* parameter.
			//			Object
			//
			//			Name value pairs
			//
			//
			//    The *fieldNames* parameter.
			//
			//			Array of fieldNames
			//
			var self = this
			
			this.fieldsMap = {}
			this.loaded = false
			this._KEY_LABEL = "documentKey"
			
			if (attrs.documentKey) self[this._KEY_LABEL] = attrs.documentKey
			
			// item is obtained from the raw json response to apsdb fetch
			if (attrs.item != undefined) {
				// the key label from an apsdb query is @key
				self[this._KEY_LABEL] = attrs.item["@key"]

				self.fieldsMap = {}		
	
				dojo.forEach(attrs.item.fields, function(field) {
					self.fieldsMap[field["@name"]] = field
				})

				// Hack needed for dojo grid (and maybe other widgets), if a column is expected and it's not found in the item
				//  the widget breaks
				dojo.forEach(attrs.fieldNames, function(fieldName) {
					if (!self.getValues(fieldName)) {
						self.setValues(fieldName, "string", [null])
					}
				})
	
				delete attrs.item.fields 
				// item is considered loaded if instantiated with an apsdb native return item object
				self.loaded = true
			}
		},
		
		getValues: function(attribute) {
			if (this.fieldsMap[attribute]) return this.fieldsMap[attribute].values
		},
		
		getValue: function(/* attribute-name-string */ attribute,  /* value? */ defaultValue) {
			var value = defaultValue
			var values = this.getValues(attribute)
			if (values) {
				if (values.length>0) {
					value = values[0]
				}
			}
			
			return value
		},

		setValues: function(attribute, type, values) {
			var value = {}
			value["@type"] = type
			value["values"] = values
			this.fieldsMap[attribute] = value	
		},
		
		setValue: function(attribute, type, value) {
			this.setValues(attribute, type, [value])
		},
		
		getAttributes: function() {
			var attributeNames = []
			for (var a in this.fieldsMap) {
				attributeNames.push(a)
			}
			
			return attributeNames
		},

		hasAttribute: function(attribute) {
			return (this.fieldsMap[attribute] != undefined)
		},
		
		unsetAttribute: function(attribute) {
			delete this.fieldsMap[attribute]
		},
		
		containsValue: function(/* attribute-name-string */ attribute, /* anything */ value) {
			var values = this.getValues(attribute)

			var found = false
			dojo.forEach(values, function(v) {
				if (v == value) {
					found = true || found
				}
			})
			
			return found
		},
		
		setIdentity: function(key) {
			this[this._KEY_LABEL] = key
		},
		
		getIdentity: function() {
			return this[this._KEY_LABEL]
		},
		
		isLoaded: function() {
			return this.loaded
		},
		
		getFields: function() {
			var self = this
			var fields = {}
			
			for (fieldName in self.fieldsMap) {
				fields[fieldName] = self.fieldsMap[fieldName].values
			}
			
			fields["apsdb.documentKey"] = self.getIdentity()
			
			return fields
		},
		
		save: function() {
			
		},
		
		remove: function() {
			
		}

		
	})
