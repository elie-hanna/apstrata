/*******************************************************************************
 *  Copyright 2009 apstrata
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *
 *  You may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0.html
 *  This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 *  CONDITIONS OF ANY KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations under the License.
 * *****************************************************************************
 */

dojo.provide("apstrata.apsdb.client.SaveDocument");

dojo.require("apstrata.apsdb.client.Get");

/**
 * Allows the creation of an apstrata database document
 * @class apstrata.apsdb.client.SaveDocument
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.SaveDocument",
[apstrata.apsdb.client.Get],
{
    /**
     * @constructor SaveDocument Does not require any parameters
     */
    constructor: function() {
        this.apsdbOperation= "SaveDocument"
    },

	// TODO: still to implement the reverse operation
  /**
   * @function flatten Recurses inside an object and flattens it
   * Example: o.property1.property2 = value ---> o["property1!property2"] = value
   * @param o The Object to be flattened
   */
	flatten: function (o) {
		function _flatten(o, newObject, label) {
			for (i in o) {
				var l = ((label==undefined)?"":(label+"!"))
				if (typeof(o[i]) == "object") _flatten(o[i], newObject, l+i);
				else newObject[l+i] = o[i]
			}
		}
		
		var newObject = {}
		_flatten(ob, newObject)
		return newObject
	},

	// TODO: save typed values
    /**
     * @function execute Creates or updates an apstrata database document
     * @param attrs An array of parameters that must contain the parameter 'store'
     */
    execute: function(attrs, flatten) {
console.dir(attrs)		
        this.request.apsdb.store = attrs.store

        // if this object doesn't contain a document key, generate new one
//		if (attrs.documentKey) this.request.apsdb.documentKey = attrs.documentKey
		
//        if (attrs.fields[this.connection._KEY_APSDB_ID] != undefined) this.request.apsdb.documentKey = attrs.fields[this.connection._KEY_APSDB_ID]

		for (prop in attrs.fields) {
	            //if (prop != this.connection._KEY_APSDB_ID) 
				this.request[prop] = attrs.fields[prop];
		}
	    
		this.inherited(arguments);
    }
});
