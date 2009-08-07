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

/**
 * Allows querying the apstrata database documents of an account
 * @class apstrata.apsdb.client.Query
 * @extends apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.Query",
[apstrata.apsdb.client.Get],
{
	_DEFAULT_PAGE_NUMBER: 1, // TODO: Not in use, should b removed
	_DEFAULT_RESULTS_PER_PAGE: 10, // TODO: Not in use, should b removed

    /**
     * @constructor Query Does not require any parameters
    */
    constructor: function() {
        this.apsdbOperation= "Query"
    },

    /**
     * @function execute Queries the apstrata database documents of an account
     * @param attrs An array of parameters that must contain these parameters: 'store', 'query', 'queryFields'. These parameters are optional: 'resultsPerPage', 'pageNumber', 'count', 'sort'
     */
    execute: function(attrs) {
		if ((attrs.store) && (attrs.query) && (attrs.queryFields)) {
			this.request.apsdb.store = attrs.store	
			this.request.apsdb.query = attrs.query
			this.request.apsdb.queryFields = attrs.queryFields

//			if (attrs.documentKey) this.request.apsdb.documentKey = attrs.documentKey 

	        if (attrs.resultsPerPage) this.request.apsdb.resultsPerPage = attrs.resultsPerPage
//				else this.request.apsdb.resultsPerPage = this._DEFAULT_RESULTS_PER_PAGE

	        if (attrs.pageNumber) this.request.apsdb.pageNumber = attrs.pageNumber
//				else this.request.apsdb.pageNumber = this._DEFAULT_PAGE_NUMBER

	        if (attrs.count) this.request.apsdb.count = attrs.count
//				else this.request.apsdb.count = "false"

			if (attrs.sort) this.request.apsdb.sort = attrs.sort

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