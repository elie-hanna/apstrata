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

/**
 * Allows the creation of an apstrata database schema
 * @class apstrata.apsdb.client.SetSchema
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.SetSchema",
[apstrata.apsdb.client.Get],
{
    /**
     * @constructor SetSchema Does not require any parameters
    */
    constructor: function(){
        this.apsdbOperation = "SetSchema"
    },

    /**
     * @function execute Creates or updates a schema in apstrata database
     * @param attrs An array of parameters that must contain these parameters: 'schema', 'schemaName'. These parameters are optional: 'newSchemaName', 'update'
     */
    execute: function(attrs){
    
        if ((attrs != undefined) &&
        (attrs.schemaName != undefined) &&
        (attrs.schema != undefined)) {
            this.request.apsdb.schema = attrs.schema;
            this.request.apsdb.schemaName = attrs.schemaName;
            this.request.apsdb.schemaName = attrs.schemaName; // TODO: Should be removed!
            if (attrs.newSchemaName != undefined) 
                this.request.apsdb.newSchemaName = attrs.newSchemaName;
            if (attrs.update != undefined) 
                this.request.apsdb.update = attrs.update;
            
            this.inherited(arguments);
        }
        else 
            throw new Error("apstrata.apsdb.client.SetSchema: missing parameter.")
    }
});

