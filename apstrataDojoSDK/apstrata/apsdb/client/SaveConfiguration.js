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

dojo.provide("apstrata.apsdb.client.SaveConfiguration");

dojo.require("apstrata.apsdb.client.Get");

/**
 * Allows the creation of account configuration
 * @class apstrata.apsdb.client.SaveConfiguration
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.SaveConfiguration",
[apstrata.apsdb.client.Get],
{
    /**
     * @constructor SaveConfiguration Does not require any parameters
    */
    constructor: function() {
        this.apsdbOperation= "SaveConfiguration"
    },

    /**
     * @function execute Saves the createSchemaACL attributes in user's profile
     * @param attrs An array of parameters that must contain the 'createSchemaACL' parameter
     * @throws Error
     */
    execute: function(attrs) {
        if ((attrs != undefined) &&
            (attrs.createSchemaACL != undefined)) {   
            this.request.apsdb.createSchemaACL = attrs.createSchemaACL;
            this.inherited(arguments);
        } else throw new Error("apstrata.apsdb.client.SaveConfiguration: missing createSchemaACL parameter.")
    }
});

