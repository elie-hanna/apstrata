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

dojo.provide("apstrata.dojo.client.apsdb.SaveDocument");

dojo.require("apstrata.dojo.client.apsdb.Get");

dojo.declare("apstrata.dojo.client.apsdb.SaveDocument",
[apstrata.dojo.client.apsdb.Get],
{    
    constructor: function() {
        this.apsdbOperation= "SaveDocument"
    },

    execute: function(attrs) {
        this.request.apsdb.store = attrs.store

        // set the document key properly in the request object
        if (attrs.fields[this.connection._KEY_APSDB_ID] != undefined) this.request.apsdb.documentKey = attrs.fields[this.connection._KEY_APSDB_ID]

	for (prop in attrs.fields) {
            if (prop != this.connection._KEY_APSDB_ID) this.request[prop] = attrs.fields[prop];
	}
    
	this.inherited(arguments);
    }
});
