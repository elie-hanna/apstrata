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

dojo.provide("apstrata.dojo.client.apsdb.DeleteStore");

dojo.require("apstrata.dojo.client.apsdb.Get");

dojo.declare("apstrata.dojo.client.apsdb.DeleteStore",
[apstrata.dojo.client.apsdb.Get],
{
    constructor: function() {
        this.apsdbOperation= "DeleteStore"
    },
    
    execute: function(attrs) {
        if ((attrs != undefined) &&
            (attrs.name != undefined)) {   
            this.request.apsdb.store = attrs.name;
            this.inherited(arguments);
        } else console.debug("apstrata.dojo.client.apsdb.DeleteStore: missing store name.");
    }


});
