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

dojo.provide("apstrata.dojoClient.apsdb.SaveDocument");

dojo.declare("apstrata.dojoClient.apsdb.SaveDocument",
[apstrata.dojoClient.apsdb.Get],
{
    apsdbOperation: "SaveDocument",
    
    constructor: function(auth, store, fields) {
	this.request.apsdb.store = store;

	for (prop in fields) {
	    this.request[prop] = fields[prop];
	}
    },

    execute: function() {
	
	this.inherited(arguments);
    }
});
