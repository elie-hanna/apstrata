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
dojo.provide("apstrata.apsdb.client.DeleteUser");

dojo.require("apstrata.apsdb.client.Get");

/**
 * Allows the deletion of an apstrata database user
 * @class apstrata.apsdb.client.DeleteUser
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.DeleteUser",
[apstrata.apsdb.client.Get],
{
    /**
     * @constructor DeleteUser Does not require any parameters
    */
    constructor: function(){
        this.apsdbOperation = "DeleteUser"
    },

    /**
     * @function execute Deletes a user with the passed username
     * @param attrs An array of parameters that must contain the 'user' parameter
     */
    execute: function(attrs){
        if ((attrs != undefined) &&
        (attrs.user != undefined)) {
            this.request.apsim.user = attrs.user;
            this.inherited(arguments);
        }
        else 
            console.debug("apstrata.apsdb.client.DeleteUser: missing user name.");
    }
    
    
});
