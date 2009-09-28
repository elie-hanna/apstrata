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

dojo.provide("apstrata.apsdb.client.DeleteSavedQuery");

dojo.require("apstrata.apsdb.client.Get");

/**
 * Allows the deletion of an apstrata saved query
 * @class apstrata.apsdb.client.DeleteSavedQuery
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.DeleteSavedQuery",
[apstrata.apsdb.client.Get],
{
    /**
     * @constructor DeleteSavedQuery Does not require any parameters
    */
    constructor: function() {
        this.apsdbOperation= "DeleteSavedQuery"
    },

    /**
     * @function execute Deletes the query with the passed query name
     * @param attrs An array of parameters that must contain the 'queryName' parameter
     */
    execute: function(attrs) {
        if ((attrs != undefined) &&
            (attrs.queryName != undefined)) {   
            this.request.apsdb.queryName = attrs.queryName;
            this.inherited(arguments);
        } else console.debug("apstrata.apsdb.client.DeleteSavedQuery: missing query name.");
    }


});
