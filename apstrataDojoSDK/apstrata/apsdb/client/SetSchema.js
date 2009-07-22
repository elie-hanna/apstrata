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

dojo.provide("apstrata.apsdb.client.SetSchema");

dojo.require("apstrata.apsdb.client.Get");

dojo.declare("apstrata.apsdb.client.SetSchema",
[apstrata.apsdb.client.Get],
{
    constructor: function() {
        this.apsdbOperation= "SetSchema"
    },
		    
    execute: function(attrs) {
        if ((attrs != undefined) &&
            (attrs.schemaName != undefined)) {   
            this.request.apsdb.schemaName = attrs.schemaName;
            this.inherited(arguments);
        } else throw new Error("apstrata.apsdb.client.SetSchema: missing schema name.")
    }
});

