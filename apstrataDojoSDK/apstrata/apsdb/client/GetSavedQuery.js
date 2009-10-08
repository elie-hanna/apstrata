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

dojo.provide("apstrata.apsdb.client.GetSavedQuery");

dojo.require("apstrata.apsdb.client.Get");

/**
 * Allows getting the description of a saved query from apstrata database
 * @class apstrata.apsdb.client.GetSavedQuery
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.GetSavedQuery",
[apstrata.apsdb.client.Get],
{
    /**
     * @constructor GetSavedQuery Does not require any parameters
    */
    constructor: function() {
        this.apsdbOperation= "GetSavedQuery"
    },

    /**
     * @function execute Gets the query with the passed query name
     * @param attrs An array of parameters that must contain the 'queryName' parameter
     */
    execute: function(attrs) {
        if ((attrs != undefined) &&
            (attrs.queryName != undefined)) {  
            this.request.apsdb.queryName = attrs.queryName;
            this.inherited(arguments);
        } else throw new Error("apstrata.apsdb.client.GetSavedQuery: missing query name.")
    }
});

