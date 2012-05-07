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
	
	setType: function(type) {
		this.type = type
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
		
		return dojo.when(
			this.queryResults(deferred),
			function(results) {
				return dojo.store.util.SimpleQueryEngine(attrs, options)(results)
			}
		)		
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
				deferred.resolve({id: id})
				break; 

			case 'users': 
				/*
					action: "ListUsers",
					request: {
						apsdb: {
							attributes: "*",
							query: "login=\""+id+"\""
						}
					},
				 
				 */
			
				this.client.call({
					action: "GetUser",
					request: {
						login: id
					},
					load: function(operation) {
						deferred.resolve({id: id, user: operation.response.result.user})
					},
					error: function(operation) {
						deferred.reject(operation.response.metadata)
					}
				})
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
					},
					error: function(operation) {
						deferred.reject(operation.response.metadata)
					}
				})
				break;

			case 'schemas': 
				this.client.call({
					action: "GetSchema",
					request: {
						apsdb: {
							schemaName: id
						}
					},
					load: function(operation) {
						deferred.resolve({id: id, schema: operation.response.result})
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
	},
	
	_putScript: function(object, options) {
		var self = this
		var deferred = new dojo.Deferred();
		
		var overwrite = true
		
		var request = {
			apsdb: {
				scriptName: self.store,
				update: false
			}
		}
		
		dojo.mixin(request, object)

		if (options.id) request.apsdb.documentKey = options.id
		if (options.overwrite) request.apsdb.update = options.overwrite
		
		dojo.mixin(request, object)
		
		// Create temporary form node that the POST needs
		var form = dojo.create('form')
		dojo.place(form, dojo.body())

		var attrs = {
			action: "SaveScript",
			request: request,
			formNode: form, // dojo.byId('noForm'),
			useHttpMethod: "POST",
			load: function(operation) {
				// remove temporary form node 
				form.parentNode.removeChild(form)
				deferred.resolve(operation.response.result.document.key)
			},
			error: function(operation) {
				// remove temporary form node 
				form.parentNode.removeChild(form)
				deferred.reject(operation.response.metadata)
			}
		}
	
		
		return deferred
	},


	put: function(object, options) {
		var self = this
		var deferred = new dojo.Deferred()
		
		switch (this.type) {
			case 'documents':
				return this.inherited(arguments)
				break;
				
			case 'users':
				var callAttrs = {
					action: "SaveUser",
					request: object,
					load: function(operation) {
						deferred.resolve(true)
					},
					error: function(operation) {
						deferred.reject(operation)
					}
				}
		
				self.client.call(callAttrs)
				return deferred
				break;	
				
			case 'groups':
				var callAttrs = {
					action: "SaveGroup",
					request: object,
					load: function(operation) {
						deferred.resolve(true)
					},
					error: function(operation) {
						deferred.reject(operation)
					}
				}
		
				self.client.call(callAttrs)
				return deferred
				break;

			case 'stores':
				var request = {}

				var store = object.store
				delete object.store

				for (var k in object) {
					request["apsdb." + store + "." + k] = object[k]
				}
				
				var attrs = {
					action: "SaveConfiguration",
					request: request,
					load: function(operation){
						deferred.resolve()
					},
					error: function(operation){
						deferred.reject(operation.response.metadata)
					}
				}
				
				this.client.call(attrs)
				break;
				
			case 'schemas':
				var request = {apsdb:{}}
				if (options && options.overwrite) {
					request.apsdb.schemaName = object.id
					request.apsdb.newSchemaName = object["apsdb.newSchemaName"]
					request.apsdb.schema = object.schema
					request.apsdb.update = true
				} else request = object
				
				var callAttrs = {
					action: "SaveSchema",
					request: request,
					load: function(operation) {
						deferred.resolve(true)
					},
					error: function(operation) {
						deferred.reject(operation)
					}
				}
		
				self.client.call(callAttrs)
				return deferred
				break;
				
			case 'scripts':
				var request = {apsdb:{}}
				if (options && options.overwrite) {
					request.apsdb.scriptName = object.id
					request.apsdb.newScriptName = object["apsdb.newSchemaName"]
					request.apsdb.script = object.schema
					request.apsdb.update = true
				} else request = object

				var callAttrs = {
					action: "SaveScript",
					request: request,
					load: function(operation) {
						deferred.resolve(true)
					},
					error: function(operation) {
						deferred.reject(operation)
					}
				}
		
				self.client.call(callAttrs)
				return deferred
				break;
			
		}
		
		return deferred
	},
	
	add: function(object, options) {
		var self = this
		var deferred = new dojo.Deferred()

		switch (this.type) {
			case 'stores':
				var callAttrs = {
					action: "CreateStore",
					request: object,
					load: function(operation) {
						deferred.resolve(true)
					},
					error: function(operation) {
						deferred.reject(operation)
					}
				}
		
				self.client.call(callAttrs)
				return deferred
				break;
			
			case 'users':
				return this.put(object)
				break;
			
			case 'groups':
				return this.put(object)
				break;
				
			case 'schemas':
				return this.put(object)
				break;
			
			case 'scripts':
				return this.put(object)
				break;

			default:
				var newOptions = dojo.mixin(options, {overwrite: false})
				return this.put(object, newOptions)
		}
	},
	
	remove: function(id) {
		var deferred = new dojo.Deferred();

		switch (this.type) {
			case 'stores':
				var attrs = {
					action: "DeleteStore",
					request: {
						apsdb: {
							store: id
						}
					},
					load: function(operation) {
						deferred.resolve(true)
					},
					error: function(operation) {
						deferred.reject(operation.response.metadata)
					}
				}
			
				this.client.call(attrs)
			
				break;
				
			case 'users':
				var attrs = {
					action: "DeleteUser",
					request: {
						login: id
					},
					load: function(operation) {
						deferred.resolve(true)
					},
					error: function(operation) {
						deferred.reject(operation.response.metadata)
					}
				}
			
				this.client.call(attrs)
				break;
			
			case 'groups':
				var attrs = {
					action: "DeleteGroup",
					request: {
						groupName: id
					},
					load: function(operation) {
						deferred.resolve(true)
					},
					error: function(operation) {
						deferred.reject(operation.response.metadata)
					}
				}
			
				this.client.call(attrs)
				break;

			case 'schemas':
				var attrs = {
					action: "DeleteSchema",
					request: {
						apsdb: {
							schemaName: id
						}
					},
					load: function(operation) {
						deferred.resolve(true)
					},
					error: function(operation) {
						deferred.reject(operation.response.metadata)
					}
				}
			
				this.client.call(attrs)
				break;
			
			case 'scripts': 
				var attrs = {
					action: "DeleteScript",
					request: {
						apsdb: {
							scriptName: id
						}
					},
					load: function(operation) {
						deferred.resolve(true)
					},
					error: function(operation) {
						deferred.reject(operation.response.metadata)
					}
				}
			
				this.client.call(attrs)
				break;	
				
			case 'SavedQueries':
				var attrs = {
					action: "DeleteSavedQuery",
					request: {
						apsdb: {
							queryName: id
						}
					},
					load: function(operation) {
						deferred.resolve(true)
					},
					error: function(operation) {
						deferred.reject(operation.response.metadata)
					}
				}
			
				this.client.call(attrs)
			
				break;
		}
		
		return deferred
	}

})