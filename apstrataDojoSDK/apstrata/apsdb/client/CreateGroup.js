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

dojo.provide("apstrata.apsdb.client.CreateGroup");

dojo.require("apstrata.apsdb.client.Get");

dojo.declare("apstrata.apsdb.client.CreateGroup",
[apstrata.apsdb.client.Get],
{
    constructor: function() {
        this.apsdbOperation= "CreateGroup"
    },
		    
    execute: function(attrs) {
        if ((attrs != undefined) &&
            (attrs.groupName != undefined)) {   
            this.request.apsdb.groupName = attrs.groupName;
            this.inherited(arguments);
        } else throw new Error("apstrata.apsdb.client.CreateGroup: missing group name.")
    }
});
