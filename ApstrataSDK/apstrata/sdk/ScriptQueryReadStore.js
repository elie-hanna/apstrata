dojo.provide("apstrata.sdk.ScriptQueryReadStore");

dojo.require("dojox.data.QueryReadStore");
dojo.require("apstrata.sdk.Client");
dojo.require("apstrata.sdk.Connection");

dojo.declare("apstrata.sdk.ScriptQueryReadStore", [dojox.data.QueryReadStore], {
	/**
     * Script to be called when calling RunScript on apstratabase.
     * @field
     * @memberof apstrata.sdk.ScriptQueryReadStore
     */ 
	scriptName: null,
	
	/**
     * The apstrata.sdk.Client used to make server calls
     * @field
     * @memberof apstrata.sdk.ScriptQueryReadStore
     */
	client: null,
	
	/**
     * A map of fields to their apstrata types, used to construct a valid apstrata sort clause.
     * @field
     * @memberof apstrata.sdk.ScriptQueryReadStore
     */
	fieldTypeMap: null,
	
	/**
     * Object containing additional parameters to be sent to the apstratabase script. 
     * @field
     * @memberof apstrata.sdk.ScriptQueryReadStore
     */
	queryFilter: null,
	
	/**
     * Extends the base dojox.data.QueryReadStore.fetch() to build a serverQuery compatible with apstratabase scripts.
     * Adds the required apsdb.scriptName parameter.
     * Adds any extra script parameters provided in the queryFilter object.
     * @function
     * @memberof apstrata.sdk.ScriptQueryReadStore
     */
	fetch: function(request) {
		request.serverQuery = {"apsdb.scriptName": this.scriptName};
		if (this.queryFilter) {
			dojo.mixin(request.serverQuery, this.queryFilter);
		}
		return this.inherited("fetch", arguments);
	},
	
	/**
     * Extends the base dojox.data.QueryReadStore._fetchItems() to replace dojo.xhr usage with apstrata.sdk.client.call()
     * Converts internal sort/count parameters into the equivalent apsdb.pageNumber parameter and appends it to the serverQuery.
     * @function
     * @memberof apstrata.sdk.ScriptQueryReadStore
     */
	_fetchItems: function(request, fetchHandler, errorHandler){
		//	summary:
		// 		The request contains the data as defined in the Read-API.
		// 		Additionally there is following keyword "serverQuery".
		//
		//	The *serverQuery* parameter, optional.
		//		This parameter contains the data that will be sent to the server.
		//		If this parameter is not given the parameter "query"'s
		//		data are sent to the server. This is done for some reasons:
		//		- to specify explicitly which data are sent to the server, they
		//		  might also be a mix of what is contained in "query", "queryOptions"
		//		  and the paging parameters "start" and "count" or may be even
		//		  completely different things.
		//		- don't modify the request.query data, so the interface using this
		//		  store can rely on unmodified data, as the combobox dijit currently
		//		  does it, it compares if the query has changed
		//		- request.query is required by the Read-API
		//
		// 		I.e. the following examples might be sent via GET:
		//		  fetch({query:{name:"abc"}, queryOptions:{ignoreCase:true}})
		//		  the URL will become:   /url.php?name=abc
		//
		//		  fetch({serverQuery:{q:"abc", c:true}, query:{name:"abc"}, queryOptions:{ignoreCase:true}})
		//		  the URL will become:   /url.php?q=abc&c=true
		//		  // The serverQuery-parameter has overruled the query-parameter
		//		  // but the query parameter stays untouched, but is not sent to the server!
		//		  // The serverQuery contains more data than the query, so they might differ!
		//

		var serverQuery = request.serverQuery || request.query || {};
		//Need to add start and count
		if(!this.doClientPaging){
			// aps: Modifying here to calculate the page number and send the apstrata parameter.
			var page = 1;
			var start = request.start || 0;
			// Count might not be sent if not given.
			if(request.count){
				var count = request.count;
				page = (start/count) + 1;
				serverQuery["apsdb.resultsPerPage"] = count;
			}
			serverQuery["apsdb.pageNumber"] = page;
		}
		if(!this.doClientSorting && request.sort){
			var sortInfo = [];
			var self = this;
			dojo.forEach(request.sort, function(sort){
				if(sort && sort.attribute){
					sortInfo.push(self._formatApstrataSortClause(sort));
				}
			});
			serverQuery["apsdb.sort"] = sortInfo.join(',');
		}
		// Compare the last query and the current query by simply json-encoding them,
		// so we dont have to do any deep object compare ... is there some dojo.areObjectsEqual()???
		if(this.doClientPaging && this._lastServerQuery !== null &&
			dojo.toJson(serverQuery) == dojo.toJson(this._lastServerQuery)
			){
			this._numRows = (this._numRows === -1) ? this._items.length : this._numRows;
			fetchHandler(this._items, request, this._numRows);
		}else{
			
			// aps: modifying here to use the provided client.
			var self = this;
			
			this.client.call("RunScript", serverQuery, null, {method: "get"}).then(
				function(data) {
					if (data.metadata.status != "success") {
						errorHandler(data.metadata, request);
					}
					self._xhrFetchHandler(data.result, request, fetchHandler, errorHandler);
				},
				function(error) {
					errorHandler(error, request);
				}
			);
			
			this.lastRequestHash = new Date().getTime()+"-"+String(Math.random()).substring(2);
			this._lastServerQuery = dojo.mixin({}, serverQuery);
			
		}
	},
	
	/**
	 * Format the sort parameter into the one understandable by apstrata: fieldName<fieldType:ORDER>
	 * @function
     * @memberof apstrata.sdk.ScriptQueryReadStore 
	 */
	_formatApstrataSortClause: function(sort) {
		var sortField = sort.attribute;
		var sortFieldType = "string";
		if (this.fieldTypeMap && this.fieldTypeMap[sortField]) {
			sortFieldType = this.fieldTypeMap[sortField];
		}
		return sortField + "<" + sortFieldType + ":" + (sort.descending ? "DESC" : "ASC") + ">";
	}
});