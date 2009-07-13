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

dojo.provide("apstrata.apsdb.client.Query");

dojo.require("apstrata.apsdb.client.Get");

dojo.declare("apstrata.apsdb.client.Query",
[apstrata.apsdb.client.Get],
{
	_DEFAULT_PAGE_NUMBER: 1,
	_DEFAULT_RESULTS_PER_PAGE: 10,

    constructor: function() {
        this.apsdbOperation= "Query"
    },

    execute: function(attrs) {
		if ((attrs.store != undefined) && (attrs.query != undefined) && (attrs.queryFields != undefined)) {
			this.request.apsdb.store = attrs.store	
			this.request.apsdb.query = attrs.query
			this.request.apsdb.queryFields = attrs.queryFields

//			if (attrs.documentKey) this.request.apsdb.documentKey = attrs.documentKey 

	        if (attrs.resultsPerPage != undefined) this.request.apsdb.resultsPerPage = attrs.resultsPerPage
//				else this.request.apsdb.resultsPerPage = this._DEFAULT_RESULTS_PER_PAGE

	        if (attrs.pageNumber != undefined) this.request.apsdb.pageNumber = attrs.pageNumber
//				else this.request.apsdb.pageNumber = this._DEFAULT_PAGE_NUMBER

	        if (attrs.count != undefined) this.request.apsdb.count = attrs.count
//				else this.request.apsdb.count = "false"
/*
			if (attrs.ftsString != undefined) this.request.apsdb.ftsString = attrs.ftsString;
	        	else this.request.apsdb.ftsString = ""

	        if (attrs.forceCurrentSnapshot != undefined) this.request.apsdb.forceCurrentSnapshot = attrs.forceCurrentSnapshot
				else this.request.apsdb.forceCurrentSnapshot = "false"
*/
		} else {
			throw "Query attributes store, query and queryFields are mandatory"
		}

		this.inherited(arguments);
    }
})