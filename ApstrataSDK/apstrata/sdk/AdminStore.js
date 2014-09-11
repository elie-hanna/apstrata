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
dojo.provide("apstrata.sdk.AdminStore")

dojo.require("apstrata.sdk.ObjectStore")

dojo.declare("apstrata.sdk.AdminStore", 
[apstrata.sdk.ObjectStore], 
{
	
	setType: function(type, dataProperty) {
		this.type = type
		this.dataProperty = dataProperty
	},
	
	_queryAsList: function(action, dataProperty, query, queryOptions) {
		var self = this
		
		var def = new dojo.Deferred()

		var options = {
			method: 'GET',
			timeout: self.connection.timeout	
		}
		
		this.client.call(action, null, null, options).then(
			function(response) {
				if (dataProperty && dataProperty != "") {
					if (response.result[dataProperty]) {
						def.resolve(response.result[dataProperty]);	
					} else {
						def.resolve([]);
					}
					
				} else {
					def.resolve(response.result)
				}
			},
			function(response) {
				def.reject(response.metadata)	
			}
		)
		
		return dojo.when(
			this.queryResults(def),
			function(results) {
				if (query || queryOptions) {
					return dojo.store.util.SimpleQueryEngine(query, queryOptions)(results)
				} else {
					return results
				}
			}
		)	
	},
	
	_queryDocuments: function(action, query) {
		var self = this
		
		var def = new dojo.Deferred()

		var options = {
			method: 'GET',
			timeout: self.connection.timeout	
		}
		
		this.client.call(action, query, null, options).then(
			function(response) {
				def.resolve(response.result['documents'])
			},
			function(response) {
				def.reject(response.metadata)	
			}
		)
		
		return this.queryResults(def)		
	},
	
	
	query: function(query, queryOptions) {
		switch (this.type) {
			case 'stores': 
				return this._queryAsList("ListStores", "stores", query, queryOptions)
				break;

			case 'schemas':
				return this._queryAsList("ListSchemas", "schemas", query, queryOptions)
			 	break;
				
			case 'scripts': 
				return this._queryAsList("ListScripts", (this.dataProperty && this.dataProperty != "") ? this.dataProperty : "scripts", query, queryOptions)
				break;

			case 'SavedQueries': 
				return this._queryAsList("ListSavedQueries", "savedQueries", query, queryOptions)
				break;

			case 'users':
				return this._queryAsList("ListUsers", "users", query, queryOptions)
				break;

			case 'devices':
				return this._queryAsList("ListDevices", "devices", query, queryOptions)
				break;

			case 'groups': 
				return this._queryAsList("ListGroups", "groups", query, queryOptions)
				break;
				
			case 'configuration': 
				return this._queryAsList("ListConfiguration", "", query, queryOptions)
				break;

			case 'documents': 
				return this._queryDocuments("Query", query)
				break;

			case 'RunScript': break;
		}
		
	},
	
	get: function(id, options) {
		var self = this;
		var deferred = new dojo.Deferred();
		
		var clientOptions = {
			method: 'GET',
			timeout: self.connection.timeout	
		}

		switch (this.type) {
			case 'stores':
				deferred.resolve({id: id})
				break;
				
			case 'storesConfig':
				this.client.call("ListConfiguration", null, null, clientOptions).then(
					function(response) {
						var storeConfig = {};
						if (response.result.stores) {
							 dojo.forEach(response.result.stores, function(store){
							 	if (store.name == id) {
							 		storeConfig = store.configurations;
							 	}
							 })
						}
						deferred.resolve({id: id, storeConfig: storeConfig})
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				break; 
			 

			case 'users':
				var params = {
					login: id
				} 
				
				if (options && options["apsdb.includeFieldType"]) {
					params["apsdb.includeFieldType"] = options["apsdb.includeFieldType"]
				}
				
				this.client.call("GetUser", params, null, clientOptions).then(
					function(response) {
						deferred.resolve({id: id, user: response.result.user})
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				break;

			case 'devices':
				var params = {
					id: id
				} 
				
				if (options && options["apsdb.includeFieldType"]) {
					params["apsdb.includeFieldType"] = options["apsdb.includeFieldType"]
				}
				
				this.client.call("GetDevice", params, null, clientOptions).then(
					function(response) {
						deferred.resolve({id: id, device: response.result.device})
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				break;

			case 'scripts': 
				this.client.call("GetScript", dojo.mixin({"apsdb.scriptName": id},options), null, clientOptions).then(
					function(response) {
						deferred.resolve({id: id, script: response.result})
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				break;

			case 'schemas': 
				this.client.call("GetSchema", {"apsdb.schemaName": id}, null, clientOptions).then(
					function(response) {
						deferred.resolve({id: id, schema: response.result})
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				break;
				
			case 'SavedQueries':
				this.client.call("GetSavedQuery", {"apsdb.queryName": id}, null, clientOptions).then(
					function(response) {
						deferred.resolve({id: id, query: response.result})
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)				
				break;

			case 'documents': 
				var idElements = id.split("|")
				var key = idElements[0]
				var versionNumber = 1
				if (idElements.length > 1) {
					versionNumber = Math.floor(idElements[[1]])
				}
								
				var requestParams = {
					"apsdb.query": "apsdb.documentKey=\"" + key + "\" and apsdb.versionNumber = " + versionNumber,
					"apsdb.queryFields": "*",
					"apsdb.includeFieldType": true
				}
				
				if (options && options.store) {
					requestParams["apsdb.store"] = options.store;
				} 
				
				this.client.call("Query", requestParams, null, clientOptions).then(
					function(response) {
						if (response.result.documents.length>0) {
							deferred.resolve(response.result.documents[0])
						} else {
							deferred.reject("NOT_FOUND")
						}
					}, 
					function(response) {
						deferred.reject(response.metadata)
					}
				)

			case 'RunScript': break;
		}

		return this.queryResults(deferred)
	},
	
	put: function(object, options) {
		var self = this
		var deferred = new dojo.Deferred()
		
		var clientOptions = {
			timeout: self.connection.timeout
		}
		
		var requestParams = {};
		if (options)
		 	requestParams = dojo.mixin(requestParams, options);
		
		switch (this.type) {
			case 'documents':
				var action = "SaveDocument";
				var request = object;
						
				if (request && request.domNode) {
					self.client.call(action, requestParams, request.domNode, clientOptions).then(
						function(response) {
							deferred.resolve(response)
						},
						function(response) {
							deferred.reject(response.metadata)
						}
					)
				}else {
					request = dojo.mixin(request, requestParams);
					self.client.call(action, request, null, clientOptions).then(
						function(response) {
							deferred.resolve(response)
						},
						function(response) {
							deferred.reject(response.metadata)
						}
					)
				}
				
				return deferred
				break;	
				
			case 'users':
				var action = "SaveUser";
				var request = object;
		
				if (request && request.domNode) {
					self.client.call(action, requestParams, request.domNode, clientOptions).then(
						function(response) {
							deferred.resolve(true)
						},
						function(response) {
							deferred.reject(response.metadata)
						}
					)
				}else {
					request = dojo.mixin(request, requestParams);
					self.client.call(action, request, null, clientOptions).then(
						function(response) {
							deferred.resolve(true)
						},
						function(response) {
							deferred.reject(response.metadata)
						}
					)
				}
				
				
				return deferred
				break;
				
			case 'devices':
				var action = "SaveDevice";
				var request = object;
		
				if (request && request.domNode) {
					self.client.call(action, requestParams, request.domNode, clientOptions).then(
						function(response) {
							deferred.resolve(response)
						},
						function(response) {
							deferred.reject(response.metadata)
						}
					)
				}else {
					request = dojo.mixin(request, requestParams);
					self.client.call(action, request, null, clientOptions).then(
						function(response) {
							deferred.resolve(response)
						},
						function(response) {
							deferred.reject(response.metadata)
						}
					)
				}
				
				
				return deferred
				break;
				
			case 'groups':
				var action = "SaveGroup";
				var request = object;

				self.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				
				return deferred
				break;
				
			case 'configuration':
				var action = "SaveConfiguration";
				var request = object;

				self.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				
				return deferred
				break;

			case 'stores':
				var action = "CreateStore";
				var request = object;
		
				self.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				);
				
				return deferred
				break;
				
			case 'storesConfig':
				var request = {}

				var store = object.store
				delete object.store

				for (var k in object) {
					request["apsdb." + store + "." + k] = object[k]
				}
				
				var action = "SaveConfiguration";
				
				this.client.call(action, request, null, clientOptions).then(
					function(response){
						deferred.resolve(true)
					},
					function(response){
						deferred.reject(response.metadata)
					}
				)
				return deferred
				break;
				
			case 'schemas':
				var request = {}
				if (options && options.overwrite) {
					request["apsdb.schemaName"] = object.id
					request["apsdb.newSchemaName"] = object["apsdb.newSchemaName"]
					request["apsdb.schema"] = object.schema
					request["apsdb.update"] = true
				} else request = object
				
				var action = "SaveSchema";
		
				self.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				return deferred
				break;
				
			case 'scripts':
				var request = {}
				if (options && options.overwrite) {
					request["apsdb.scriptName"] = object.id
					request["apsdb.newScriptName"] = object["apsdb.newScriptName"]
					request["apsdb.script"] = object.script
					request["apsdb.update"] = true
				} else request = object

				var action = "SaveScript";
		
				self.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				return deferred
				break;
			
			case 'SavedQueries':
				var request = {}
				if (options && options.overwrite) {
					request["apsdb.queryName"] = object.id
					request["apsdb.newQueryName"] = object["apsdb.newScriptName"]
					request["apsdb.query"] = object.script
					request["apsdb.update"] = true
				} else request = object

				var action = "SaveQuery";
		
				self.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				return deferred
				break;
		}
		
		return deferred
	},
	
	add: function(object, options) {
		var self = this

		switch (this.type) {
			case 'stores':
				return this.put(object, options)
				break;
			
			case 'users':
				return this.put(object, options)
				break;
			
			case 'devices':
				return this.put(object, options)
				break;
			
			case 'groups':
				return this.put(object, options)
				break;
				
			case 'schemas':
				return this.put(object, options)
				break;
			
			case 'scripts':
				return this.put(object, options)
				break;

			default:
				var newOptions = dojo.mixin(options, {overwrite: false})
				return this.put(object, newOptions)
		}
	},
	
	remove: function(id) {
		var self = this;
		var deferred = new dojo.Deferred();
		
		var clientOptions = {
			timeout: this.connection.timeout
		}

		switch (this.type) {
			case 'stores':
				var action = 'DeleteStore';
				var request = {
					"apsdb.store": id
				};
			
				this.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				);
			
				break;
				
			case 'users':
				var action = "DeleteUser";
				var request = {
					login: id
				};
							
				this.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				break;
			
			case 'devices':
				var action = "DeleteDevice";
				var request = {
					id: id
				};
							
				this.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				break;
			
			case 'groups':
				var action = "DeleteGroup";
				var request = {
					groupName: id
				};
			
				this.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				break;

			case 'schemas':
				var action = "DeleteSchema";
				var request = {
					"apsdb.schemaName": id
				};
			
				this.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				break;
			
			case 'scripts':
				var action = "DeleteScript"
				var request = {
					"apsdb.scriptName": id
				};
			
				this.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				break;
				
			case 'SavedQueries':
				var action = "DeleteSavedQuery"
				var request = {
					"apsdb.queryName": id
				};
			
				this.client.call(action, request, null, clientOptions).then(
					function(response) {
						deferred.resolve(true)
					},
					function(response) {
						deferred.reject(response.metadata)
					}
				)
				break;	
				
		}
		
		return deferred
	}

})