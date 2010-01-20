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

dojo.provide("apstrata._Item");
/**
 * Represents a data tuple/row/field that is used by item apsdb read/write stores
 * @class apstrata.apsdb.client._Item
*/
dojo.declare("apstrata._Item", 
	[], 
	{
    /**
     * @constructor _Item
     *     attrs:
     *        {
     *				item: Object
     *				fieldNames: Array
     *				childrenNames: Array
     *        }
     *
     *    The *item* parameter.
     *			Object
     *
     *			Name value pairs
     *
     *    The *fieldNames* parameter.
     *			Array of fieldNames
     */
		constructor: function(attrs) {
			//    attrs:
			//        {
			//				item: Object
			//				fieldNames: Array
			//				childrenNames: Array
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
						
			if (!attrs) return
						
			if (attrs.documentKey) self[this._KEY_LABEL] = attrs.documentKey
			
			// item is obtained from the raw json response to apsdb fetch
			if (attrs.item != undefined) {
				// the key label from an apsdb query is key
				self[this._KEY_LABEL] = attrs.item["key"]

				self.fieldsMap = {}		
	
				dojo.forEach(attrs.item.fields, function(field) {
					
					// If this is a children attribute
					if (dojo.indexOf(attrs.childrenNames, field["name"])>=0) {
						var _values = []
						dojo.forEach(field.values, function(value) {
							
							// instantiate _Item placeholders 
							var _item = new apstrata.apsdb.client._Item()
							_item.setIdentity(value)
							_values.push(_item)
						})
						
						var _field = {}
						_field.values = _values
						_field["name"] = field["name"]
						_field["type"] = self.declaredClass
						
						self.fieldsMap[field["name"]] = _field
					} else {
						self.fieldsMap[field["name"]] = field							
					}					
				})


				// Hack needed for dojo grid (and maybe other widgets), if a column is expected and it's not found in the item
				//  the widget breaks
/*
				dojo.forEach(attrs.fieldNames, function(fieldName) {
					if (!self.getValues(fieldName)) {
						self.setValues(fieldName, "string", null)
					}
				})
*/
				delete attrs.item.fields 
				// item is considered loaded if instantiated with an apsdb native return item object
				self.loaded = true
			}
		},
    
    /**
     * @function getValues Get all values of the passed attribute
     * @param attribute An Object whose values are to be fetched from the fields of this item
     * @returns The values of the field whose key is the passed attribute
		 */
		getValues: function(attribute) {
			if (this.fieldsMap[attribute]) return this.fieldsMap[attribute].values
		},
    
		/**
     * @function getValue Get the first value of the passed attribute
     * @param attribute An Object whose value is to be fetched from the fields of this item
     * @param defaultValue The defaultValue to be returned if the passed attribute does not exist
     * @returns The value of the field whose key is the passed attribute or the passed defaultValue if the attribute does not have a value
		 */
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

    /**
     * @function setValues Set multiple values for the specific attribute
     * @param attribute An Object whose value is to be set in the fields of this item
     * @param type The type of the field to be set
     * @param values The values of the attribute to be set
		 */
		setValues: function(attribute, type, values) {
			var value = {}
			value["type"] = type
			value["values"] = values
			this.fieldsMap[attribute] = value	
		},
		
    /**
     * @function setValue Set a single value for the specific attribute
     * @param attribute An Object whose value is to be set in the fields of this item
     * @param type The type of the field to be set
     * @param value The value of the attribute to be set
		 */
		setValue: function(attribute, type, value) {
			this.setValues(attribute, type, [value])
		},
		
    /**
     * @function getAttributes Get all the attributes of this item
     * @returns An array containing all the attributes of this item
		 */
		getAttributes: function() {
			var attributeNames = []
			for (var a in this.fieldsMap) {
				attributeNames.push(a)
			}
			
			return attributeNames
		},

    /**
     * @function hasAttribute Check if this item has the passed attribute
     * @param attribute The Object to be searched for
     * @returns true if the passed attribute is one of the attributes of this item, false otherwise
		 */
		hasAttribute: function(attribute) {
			return (this.fieldsMap[attribute] != undefined)
		},

    /**
     * @function unsetAttribute Delete the passed attribute from this item
     * @param attribute The attribute to be deleted
		 */
		unsetAttribute: function(attribute) {
			delete this.fieldsMap[attribute]
		},

    /**
     * @function containsValue Check if the passed attribute has the passed value
     * @param attribute The attribute whose values are to be searched
     * @param value The value to be searched for
     * @returns true if the value is one of the values of this attribute, false otherwise
		 */
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

    /**
     * @function setIdentity Set the key label of this item
     * @param key The key Object to be set as the label
		 */
		setIdentity: function(key) {
			this[this._KEY_LABEL] = key
		},

    /**
     * @function getIdentity Get the key label of this item
     * @returns The key label of this item
		 */
		getIdentity: function() {
			return this[this._KEY_LABEL]
		},

    /**
     * @function isLoaded Check if this item is loaded
     * @returns true if this item is loaded, false otherwise
		 */
		isLoaded: function() {
			return this.loaded
		},

    /**
     * @function getFields Get all the fields if this item. It also sets the 'apsdb.documentKey' field to this item's identity
     * @returns An array containing the all the fields of this item
		 */
		getFields: function() {
			var self = this
			var fields = {}
			
			for (fieldName in self.fieldsMap) {
				fields[fieldName] = self.fieldsMap[fieldName].values
			}
			
      // TODO: What is this for? And why is it done in this function only?
			if (self.getIdentity()) fields["apsdb.documentKey"] = self.getIdentity()
			
			return fields
		},

    /**
     * @function save Not implimented
		 */
		save: function() {
			
		},

    /**
     * @function remove Not implimented
		 */
		remove: function() {
			
		},

    /**
     * @function toString Returns a String representation of the fields of this item
     * @returns A String listing all the fields of this item
		 */
		toString: function() {
			return this.getFields()
		}

		
	})
