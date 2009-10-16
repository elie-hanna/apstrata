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
dojo.provide("apstrata.apsdb.client.SaveQuery");

dojo.require("apstrata.apsdb.client.Get");

/**
 * Allows the creation of an apstrata database query
 * @class apstrata.apsdb.client.SaveQuery
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.SaveQuery",
[apstrata.apsdb.client.Get],
{
    /**
     * @constructor SetQuery Does not require any parameters
    */
    constructor: function(){
        this.apsdbOperation = "SaveQuery"
    },

    /**
     * @function execute Creates or updates a query in apstrata database
     * @param attrs An array of parameters that must contain these parameters: 'query', 'queryName'. These parameters are optional: 'newQueryName', 'update'
     */
    execute: function(attrs){
    
        if ((attrs != undefined) &&
        (attrs.queryName != undefined) &&
        (attrs.query != undefined)) {
            this.request.apsdb.query = attrs.query;
            this.request.apsdb.queryName = attrs.queryName;
            if (attrs.newQueryName != undefined) 
                this.request.apsdb.newQueryName = attrs.newQueryName;
            if (attrs.update != undefined)
                this.request.apsdb.update = attrs.update;

            this.inherited(arguments);
        }
        else 
            throw new Error("apstrata.apsdb.client.SaveQuery: missing parameter.")
    }
});

