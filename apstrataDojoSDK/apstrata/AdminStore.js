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
dojo.provide("apstrata.AdminStore")

dojo.require("apstrata.ObjectStore")

dojo.declare("apstrata.AdminStore", 
[apstrata.ObjectStore], 
{

	constructor: function(attrs) {
	},
	
	queryStores: function(attrs, options) {
		var self = this
		
		var deferred = new dojo.Deferred();

		this.idProperty = "name"

		var queryAttrs = {
			action: self.action,
			load: function(operation) {
//				operation.response.result.documents.total = operation.response.result.count
				deferred.resolve(operation.response.result.stores)
			},
			error: function(operation) {
				deferred.reject(operation.response.metadata)
			}
		}
		
		if (this.useHttpMethod) queryAttrs.useHttpMethod = this.useHttpMethod

		this.client.call(queryAttrs)
		
		return this.queryResults(deferred)
	},
	
	_query: function(action, dataProperty, attrs, options) {
		var self = this
		
		var deferred = new dojo.Deferred();

		this.idProperty = "name"

		var queryAttrs = {
			action: action,
			load: function(operation) {
//				operation.response.result.documents.total = operation.response.result.count
				deferred.resolve(operation.response.result[dataProperty])
			},
			error: function(operation) {
				deferred.reject(operation.response.metadata)
			}
		}
		
		if (this.useHttpMethod) queryAttrs.useHttpMethod = this.useHttpMethod

		this.client.call(queryAttrs)
		
		return this.queryResults(deferred)
	},
	
	query: function(attrs, options) {
		switch (this.type) {
			case 'stores': 
				return this._query("ListStores", "stores", attrs, options)
				break;

			case 'schemas':
				return this._query("ListSchemas", "schemas", attrs, options)
			 	break;
				
			case 'scripts': 
				return this._query("ListScripts", "scripts", attrs, options)
				break;

			case 'SavedQueries': 
				return this._query("ListSavedQueries", "savedQueries", attrs, options)
				break;

			case 'users':
				return this._query("ListUsers", "users", attrs, options)
				break;

			case 'groups': 
				return this._query("ListGroups", "groups", attrs, options)
				break;

			case 'documents': 
				return this.inherited(arguments)
				break;

			case 'RunScript': break;
		}
		
	},
	
	get: function(id) {
		var deferred = new dojo.Deferred();

		switch (this.type) {
			case 'stores':
				this.inherited(arguments)
				break; 
			case 'scripts': 
				this.client.call({
					action: "GetScript",
					request: {
						apsdb: {
							scriptName: id
						}
					},
					load: function(operation) {
						deferred.resolve({id: id, script: operation.response.result})
						
	//					self._initCodeEditor()
					},
					error: function(operation) {
						deferred.reject(operation.response.metadata)
					}
				})
				break;

			case 'documents': 
				return this.inherited(arguments)
				break;

			case 'RunScript': break;
		}

		return this.queryResults(deferred)
	}
	

})