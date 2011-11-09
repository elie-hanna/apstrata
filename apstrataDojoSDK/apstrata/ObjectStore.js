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
		apsdb.queryFields = this.queryFields
		if (this.resultsPerPage) apsdb.resultsPerPage = this.resultsPerPage

		var queryAttrs = {
			action: "Query",
			request: {
				apsdb: apsdb
			},
			load: function(operation) {
				deferred.callback(operation.response.result.documents)
			},
			error: function(operation) {
				deferred.callback(null)
			}
		}
	
		this.client.call(queryAttrs)
		
		return dojo.store.util.QueryResults(deferred)
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
		
		return dojo.store.util.QueryResults(deferred)
	},
	
	put: function(object, options) {
		console.debug('store.put')
		console.dir(object)
	},

	add: function(object, options) {
		console.dir(object)
	},

	remove: function(id) {
		console.dir(object)
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

