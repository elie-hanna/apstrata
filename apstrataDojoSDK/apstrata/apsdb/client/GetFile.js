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

dojo.provide("apstrata.apsdb.client.GetFile");

dojo.require("apstrata.apsdb.client.Get");

/**
 * Allows listing all the stores in an apstrata database account
 * @class apstrata.apsdb.client.ListStores
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.GetFile",
[apstrata.apsdb.client.Get],
{
    /**
     * @constructor ListStores Does not require any parameters
    */
    constructor: function() {
        this.apsdbOperation = "GetFile"
    },
	
    /**
     * @function execute Gets the user with the passed username
     * @param attrs An array of parameters that must contain the 'user' parameter
     */
    execute: function(attrs){
		
		this.inherited(arguments);
    },
	
	getUrl: function(attrs) {
        if (attrs) {
			this.request.apsdb.store = attrs.store	
			this.request.apsdb.documentKey = attrs.documentKey
			this.request.apsdb.fieldName = attrs.fieldName
			this.request.apsdb.fileName = attrs.fileName
			this.request.apsdb.setContentDisposition = attrs.setContentDisposition
		} else {
			throw new Error("apstrata.apsdb.client.GetFile: attributes not provided.")
		}
		
		return this.inherited(arguments)
	}
});
