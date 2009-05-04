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

dojo.provide("apstrata.dojoClient.apsdb.Query");

dojo.declare("apstrata.dojoClient.apsdb.Query",
[apstrata.dojoClient.apsdb.Get],
{
    apsdbOperation: "Query",

    execute: function(store, query, queryFields) {
	this.request.apsdb.store = store;
	this.request.apsdb.query = query,
	this.request.apsdb.queryFields = queryFields,
	this.request.apsdb.resultsPerPage = 10,
	this.request.apsdb.pageNumber = 1,
	this.request.apsdb.ftsString = "",
	this.request.apsdb.count = "true",
	this.request.apsdb.forceCurrentSnapshot = "false",
	
	this.inherited(arguments);
    }
});

