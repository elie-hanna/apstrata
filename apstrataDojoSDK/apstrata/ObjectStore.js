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
dojo.provide("apstrata.ObjectStore")

dojo.require("apstrata.Connection")
dojo.require("apstrata.Client")
dojo.require("dojo.store.util.QueryResults")
dojo.require("dojo.store.api.Store")
dojo.require("dojo.data.ObjectStore")

dojo.declare("apstrata.ObjectStore", 
[dojo.store.api.Store], 
{
	
	idProperty: "apsdb.documentKey",
	
	/**
	 * Instantiates a new instance of ObjectStore
	 * <br>
	 * 
	 * @param {Object} options has
	 */
	constructor: function(options) {
		var self = this
		
		dojo.mixin(this, options);

		this.client = new apstrata.Client({
			connection: self.connection,
			handleResult: function(operation) {},
			handleError: function(operation) {}
		})
	},
	
	query: function(attrs, options) {
		var deferred = new dojo.Deferred();

		var apsdb = attrs || {}
		apsdb.store = this.store
		if (this.ftsQuery) apsdb.ftsQuery = this.ftsQuery
		if (this.queryExpression) apsdb.query = this.queryExpression
		if (this.queryFields) apsdb.queryFields = this.queryFields
		if (this.resultsPerPage) apsdb.resultsPerPage = this.resultsPerPage
		if (options.count) apsdb.resultsPerPage = options.count
		
		if (options.sort) {
			var type = 'string'
			
			if (this.fieldTypes && this.fieldTypes[options.sort[0].attribute]) type = this.fieldTypes[options.sort[0].attribute]
			
			apsdb.sort = options.sort[0].attribute + " <" + type +":" + (options.sort[0].descending?"DESC":"ASC") + ">"
		}
		
		
		if (options.start) {
			apsdb.pageNumber = options.start/options.count + 1 	
		} else {
			apsdb.pageNumber = 1
		}
		
		// TODO: this needs to be managed smarter so we don't ask the count on each query
		apsdb.count = true//(apsdb.pageNumber == 1)
	
		var queryAttrs = {
			action: "Query",
			request: {
				apsdb: apsdb
			},
			load: function(operation) {
				operation.response.result.documents.total = operation.response.result.count
				deferred.callback(operation.response.result.documents)
			},
			error: function(operation) {
				deferred.callback(null)
			}
		}
		
		if (this.useHttpMethod) queryAttrs.useHttpMethod = this.useHttpMethod
	
		this.client.call(queryAttrs)
		
		return this.queryResults(deferred)
	},
	
	getIdentity: function(object) {
		return object["apsdb.documentKey"]
	},
	
	get: function(id) {
		var deferred = new dojo.Deferred();

		var apsdb = {}
		apsdb.store = this.store
		apsdb.queryFields = this.queryFields
		apsdb.query = "apsdb.documentKey=\""+id+"\""
		
		var queryAttrs = {
			action: "Query",
			request: {
				apsdb: apsdb
			},
			load: function(operation) {
				deferred.callback(operation.response.result.documents[0])
			},
			error: function(operation) {
				deferred.callback(null)
			}
		}
	
		this.client.call(queryAttrs)
		
		return this.queryResults(deferred)
	},
	
	put: function(object, options) {
		console.debug('store.put')
		console.dir(object)
	},

	add: function(object, options) {
		console.dir(object)
	},

	remove: function(id) {
		var self = this
		var deferred = new dojo.Deferred();
		
		var attrs = {
			action: "DeleteDocument",
			request: {
				apsdb: {
					store: self.store,
					documentKey: id
				}
			},
			load: function(operation) {
				deferred.callback(operation.response.result)
			},
			error: function(operation) {
				deferred.callback(null)
			}
		}
	
		this.client.call(attrs)
		
		return deferred
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

dojo.declare("apstrata.ObjectStoreAdaptor", 
[dojo.data.ObjectStore], 
{
	onSet: function(item, attribute, old, value) {
		var object = item
		object[attribute] = value
		this.objectStore.put(object)
	}
})



