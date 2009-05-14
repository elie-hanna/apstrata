/*******************************************************************************
 *  Copyright 2009 Apstrata
 *  
 *  This file is part of Apstrata Database Javascript Client.
 *  
 *  Apstrata Database Javascript Client is free software: you can redistribute it
 *  and/or modify it under the terms of the GNU Lesser General Public License as
 *  published by the Free Software Foundation, either version 3 of the License,
 *  or (at your option) any later version.
 *  
 *  Apstrata Database Javascript Client is distributed in the hope that it will be
 *  useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *  
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with Apstrata Database Javascript Client.  If not, see <http://www.gnu.org/licenses/>.
 * *****************************************************************************
 */

dojo.provide("apstrata.dojo.client.apsdb.Query");

dojo.require("apstrata.dojo.client.apsdb.Get");

dojo.declare("apstrata.dojo.client.apsdb.Query",
[apstrata.dojo.client.apsdb.Get],
{
    apsdbOperation: "Query",

    execute: function(store, query, queryFields) {
	this.request.apsdb.store = store;
	this.request.apsdb.query = query,
	this.request.apsdb.queryFields = queryFields,
	this.request.apsdb.resultsPerPage = 50,
	this.request.apsdb.pageNumber = 1,
	this.request.apsdb.ftsString = "",
	this.request.apsdb.count = "true",
	this.request.apsdb.forceCurrentSnapshot = "false",
	
	this.inherited(arguments);
    }
});

