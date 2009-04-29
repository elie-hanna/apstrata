dojo.provide("apstrata.apsdb.Query");

dojo.declare("apstrata.apsdb.Query",
[apstrata.apsdb.Get],
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

