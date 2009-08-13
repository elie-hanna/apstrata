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

dojo.provide("apstrata.apsdb.client.SaveDocumentPost");

dojo.require("apstrata.apsdb.client.Post");

/**
 * Allows the creation of an apstrata database document
 * @class apstrata.apsdb.client.SaveDocument
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.SaveDocumentPost",
[apstrata.apsdb.client.Post],
{
    /**
     * @constructor SaveDocument Does not require any parameters
     */
    constructor: function() {
        this.apsdbOperation= "SaveDocument"
    },


	// TODO: save typed values
    /**
     * @function execute Creates or updates an apstrata database document
     * @param attrs An array of parameters that must contain the parameter 'store'
     */
    execute: function(attrs) {
console.dir(attrs)
        this.request.apsdb.store = attrs.store
		
		this.request.apsdb.formId = attrs.formId

        // if this object doesn't contain a document key, generate new one
//		if (attrs.documentKey) this.request.apsdb.documentKey = attrs.documentKey
		
//        if (attrs.fields[this.connection._KEY_APSDB_ID] != undefined) this.request.apsdb.documentKey = attrs.fields[this.connection._KEY_APSDB_ID]
/*
		for (prop in attrs.fields) {
	            //if (prop != this.connection._KEY_APSDB_ID) 
				this.request[prop] = attrs.fields[prop];
		}
*/	    
		this.inherited(arguments);
    }
});
