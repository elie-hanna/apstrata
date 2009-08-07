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
dojo.provide("apstrata.apsdb.client.ListUsers");

dojo.require("apstrata.apsdb.client.Get");

/**
 * Allows listing all the users in an apstrata database account
 * @class apstrata.apsdb.client.ListUsers
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.ListUsers",
[apstrata.apsdb.client.Get],
{
    /**
     * @constructor ListUsers Does not require any parameters
    */
    constructor: function(){
        this.apsdbOperation = "ListUsers"
    },

    /**
     * @function execute Lists all the users that belong to the passed group
     * @param attrs An array of parameters that must contain the 'groupName' parameter
     */
    execute: function(attrs){
        if (attrs != undefined && attrs.groupName != undefined) 
            this.request.apsdb.groupName = attrs.groupName;
        this.inherited(arguments);
    }
});
