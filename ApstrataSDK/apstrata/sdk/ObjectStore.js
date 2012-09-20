 /*******************************************************************************
 *  Copyright 2011 Apstrata
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

/**
 * apstrata.ObjectStore provides a dojo Store implementation capable of interacting with the apstrata service
 * 
 * @fileOverview
 */
dojo.provide("apstrata.sdk.ObjectStore")

dojo.require("apstrata.sdk.Connection")
dojo.require("apstrata.sdk.Client")
dojo.require("dojo.store.util.QueryResults")
dojo.require("dojo.store.api.Store")
dojo.require("dojo.data.ObjectStore")

dojo.declare("apstrata.sdk.ObjectStore", 
[dojo.store.api.Store], 
{
	
	idProperty: "key",
	versionProperty: "versionNumber",
	
	/**
	 * Instantiates a new instance of ObjectStore
	 * <br>
	 * 
	 * @param {Object} options has
	 */
	constructor: function(options) {
		var self = this
		
		dojo.mixin(this, options);
		this.action = "Query"

		this.client = new apstrata.sdk.Client(self.connection)
	},
	
	query: function(attrs, options) {
		var self = this
		
		var deferred = new dojo.Deferred();

		var apsdb = attrs || {}
		if (this.store) apsdb.store = this.store
		if (this.ftsQuery) apsdb.ftsQuery = this.ftsQuery
		if (this.queryExpression) {
			apsdb.query = this.queryExpression
			if (this.schema)  {
				this.queryExpression = this.queryExpression.concat(" and apsdb.schema=\"" + this.schema + "\"");
			}
		}
		if (this.queryFields) apsdb.queryFields = this.queryFields
		if (this.resultsPerPage) apsdb.resultsPerPage = this.resultsPerPage
		if (this.runAs) apsdb.runAs = this.runAs
		if (options && options.count) apsdb.resultsPerPage = options.count
		
		if (options && options.sort) {
			var type = 'string'
			
			if (this.fieldTypes && this.fieldTypes[options.sort[0].attribute]) type = this.fieldTypes[options.sort[0].attribute]
			
			if (type.toLowerCase()=='string') {
				apsdb.sort = options.sort[0].attribute + " <" + type +":" + (options.sort[0].descending?"ci:DESC":"ci:ASC") + ">"
			} else {
				apsdb.sort = options.sort[0].attribute + " <" + type +":" + (options.sort[0].descending?"DESC":"ASC") + ">"
			}
		}
		
		
		if (options && options.start) {
			apsdb.pageNumber = options.start/options.count + 1 	
		} else {
			apsdb.pageNumber = 1
		}
		
		// TODO: this needs to be managed smarter so we don't ask the count on each query
		apsdb.count = true//(apsdb.pageNumber == 1)
	
		if (this.action == "RunScript") apsdb.scriptName = this.scriptName
	
		var queryAttrs = {}

		for (k in apsdb) {
			queryAttrs["apsdb." + k] = apsdb[k]			
		}

		this.client.call(this.action, queryAttrs, null, {method: "get"}).then (
			function(response) {
				response.result.documents.total = response.result.count
				deferred.callback(response.result.documents)
			},
			function(response) {
				deferred.callback(response.metadata)
			}
		)
		
		return this.queryResults(deferred)
	},
	
	getIdentity: function(object) {
		return object[idProperty] + "|" + object[versionProperty] 
	},
	
	get: function(id) {
		var self = this
		var deferred = new dojo.Deferred()
		
		var idElements = id.split("|")
		var key = idElements[0]
		var versionNumber = 1
		if (idElements.length > 1) {
			versionNumber = Math.floor(idElements[[1]])
		}
		
		var requestParams = {
			"apsdb.query": "apsdb.documentKey=\"" + key + "\" and apsdb.versionNumber = " + versionNumber, 
			"apsdb.queryFields": self.queryFields,
			"apsdb.store": self.store,
			"apsdb.includeFieldType": true
		}
		
		if (self.runAs) {
			requestParams["apsdb.runAs"] = self.runAs;
		}
		
		this.client.call("Query", requestParams).then(function(response) {
			if (response.result.documents.length>0) {
				deferred.resolve(response.result.documents[0])
			} else {
				deferred.reject("NOT_FOUND")
			}
		}, function(response) {
			deferred.reject(response.metadata)
		})
			
		return deferred
	},
	
	put: function(object, options) {
		var self = this
		var o = {"apsdb.update": true, "apsdb.store": self.store}
		if (options) {
			dojo.mixin(o, options);
		}
		if (object && object.domNode) {
			return this.client.call("SaveDocument", o, object.domNode);	
		}else {			
			return this.client.call("SaveDocument", o)
		}
	},

	add: function(object, options) {
		var self = this		
		var o = {"apsdb.store": self.store};
		if (options) {
			dojo.mixin(o, options);
		}
		if (self.schema) {
			o["apsdb.schema"] = self.schema;
		}
		if (object && object.domNode) {
			return this.client.call("SaveDocument", o, object.domNode);	
		}else {			
			return this.client.call("SaveDocument", o)
		}
	},

	remove: function(id, options) {
		var self = this
		var requestParams = {
			"apsdb.store": self.store,
			"apsdb.documentKey": id
		}
		
		if (self.runAs) {
			requestParams["apsdb.runAs"] = self.runAs;
		}
		
		return this.client.call("DeleteDocument", requestParams, null, options)
	},
	
	queryResults: function(results){
		// summary:
		//		A function that wraps the results of a store query with additional
		//		methods.
		//
		// description:
		//		QueryResults is a basic wrapper that allows for array-like iteration
		//		over any kind of returned data from a query.  While the simplest store
		//		will return a plain array of data, other stores may return deferreds or
		//		promises; this wrapper makes sure that *all* results can be treated
		//		the same.
		//
		//		Additional methods include `forEach`, `filter` and `map`.
		//
		// returns: Object
		//		An array-like object that can be used for iterating over.
		//
		// example:
		//		Query a store and iterate over the results.
		//
		//	|	store.query({ prime: true }).forEach(function(item){
		//	|		//	do something
		//	|	});
		
		if(!results){
			return results;
		}
		// if it is a promise it may be frozen
		if(results.then){
			results = dojo.delegate(results);
		}
		function addIterativeMethod(method){
			if(!results[method]){
				results[method] = function(){
					var args = arguments;
					return dojo.when(results, function(results){
						Array.prototype.unshift.call(args, results);
						return dojo.store.util.QueryResults(dojo[method].apply(dojo, args));
					});
				};
			}
		}
		addIterativeMethod("forEach");
		addIterativeMethod("filter");
		addIterativeMethod("map");
		if(!results.total){
			results.total = dojo.when(results, function(results){
				return results.total;
			});
		}
		return results;
	}		
})

dojo.declare("apstrata.sdk.ObjectStoreAdaptor", 
[dojo.data.ObjectStore], 
{
	onSet: function(item, attribute, old, value) {
		var object = item
		object[attribute] = value
		this.objectStore.put(object)
	}
})



