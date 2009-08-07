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

dojo.provide("apstrata.apsdb.client.DeleteDocument");

dojo.require("apstrata.apsdb.client.Get");

/**
 * Allows the deletion of an apstrata database document
 * @class apstrata.apsdb.client.DeleteDocument
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.DeleteDocument",
[apstrata.apsdb.client.Get],
{
    /**
     * @constructor DeleteDocument Does not require any parameters
    */
    constructor: function() {
        this.apsdbOperation= "DeleteDocument"
    },

    /**
     * @function execute Deletes a document from the passed store with the passed document key
     * @param attrs An array of parameters that must contain the 'store' and 'documentKey' parameters
     */
    execute: function(attrs) {
		this.request.apsdb.store = attrs.store;
		this.request.apsdb.documentKey = attrs.documentKey;
		
		this.inherited(arguments);
    }
});

