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

dojo.provide("apstrata.ItemApsdbReadStore");

dojo.require("dojo.data.api.Request")

dojo.require("apstrata.Connection")
dojo.require("apstrata.Client")

dojo.require("apstrata._Item")

dojo.declare("apstrata.ItemApsdbReadStore", 
	[],
	{
		_KEY_LABEL: "documentKey",
		connection: null,
		apsdbStoreName: "",
		fields: "", 
		label: "",
		childrenAttrs: "",
		
		constructor: function(attrs) {
			// add log capabilities to object
//			_l = new apstrata.util.logger.Loggable()
//			dojo.mixin(this, _l)
			this._features = {'dojo.data.api.Read':true, 'dojo.data.api.Identity':true};

			// Arrays that hold fetched items
			this._items = []
			this._itemsMap = []

			this._connection = attrs.connection
			this._client = attrs.client
			this._store = attrs.apsdbStoreName

			// remove spaces from attrs.fields
			this._fieldsAttribute = attrs.fields 
			this._fields = attrs.fields.split(' ').join('')
			
			this._fieldsArray = this._fields.split(",")
			
			if (attrs.childrenAttrs) {
				this._childrenAttrs = attrs.childrenAttrs
				this._childrenArray = (attrs.childrenAttrs.split(' ').join('')).split(",")
			} else {
				this._childrenAttrs = ""
				this._childrenArray = []
			}
			if (attrs.resultsPerPage) this._resultsPerPage = attrs.resultsPerPage; else this._resultsPerPage = 10;
//			if (attrs.pageNumber) this._pageNumber = attrs.pageNumber

			// this._query = "XXYY != \"true\"" // TODO: dummy condition, is this right?
			this._label = attrs.label
			
			// save attrs for later use by loadItem
			this._attrs = attrs
		},
		
		getFeatures: function() {
			return this._features
		},

		_fetchSuccess: function(/* Object */ request) {
			var self = this

			if (request.onBegin) {
				request.onBegin(self._items.length, request)
			}
			
			if (request.onItem) {
				dojo.forEach(self._items, function(item) {
					request.onItem(item, request)
				})
				// onItem is present, call onComplete with null
				if (request.onComplete) request.onComplete(null, request)
			} else {

				// onItem is present, call onComplete with _items
				if (request.onComplete) {
					request.onComplete(self._items, request)
				}									
			}

			self.fetchSuccess() // Raise success event
		},
		
		_addItem: function(item) {
//			if (this._itemsMap(item.getIdentity())) {
//				this._removeItem(item)
//			}
			
			this._itemsMap[item.getIdentity()] = item
			this._items.push(item)
		},
		
		_removeItem: function(item) {
			delete this._itemsMap[item.getIdentity()]
			
			for (var i=0; i<this._items.length; i++) {
				if (this._items[i] === item) {
					this._items.splice(i,1)
					break
				}
			}
		},
		
		fetch: function(/* Object */ keywordArgs) {
			var self = this
			var request = dojo.mixin(keywordArgs, new dojo.data.api.Request());
			var queryExpression = keywordArgs.query.query //|| this._query
			var pageNumber = (keywordArgs.query.pageNumber!=undefined)?keywordArgs.query.pageNumber:1
			var count = (keywordArgs.query.count!=undefined)?keywordArgs.query.count:false
			
			var apsdb = {
				store: self._store,
				query: queryExpression,
				queryFields: self._fields, 
				resultsPerPage: self._resultsPerPage,
				pageNumber: pageNumber,
				count: count
			}

			var apsim = {}
			
			if (keywordArgs.query.runAs) apsim.runAs = keywordArgs.query.runAs

			if (keywordArgs.query.sort) apsdb.sort = keywordArgs.query.sort
			if (keywordArgs.query.ftsQuery) apsdb.ftsQuery = keywordArgs.query.ftsQuery

			if (keywordArgs.query.aggregates) {
				apsdb.aggregateExpression = keywordArgs.query.aggregates
				apsdb.aggregateGlobal = 'true'; // Add the aggregateGlobal parameter because the aggregate is only allowed globally for now
			}

			this._client.call({
				action: "Query",
				request: {
					apsdb: apsdb,
					apsim: apsim
				},
				load: function(operation) {
					self._items = []
					// operation.response.result
					
					var q = operation.response
					
					if (q.result.count) {
						self._pages = Math.ceil(q.result.count/self._resultsPerPage)
						self.totalPagesCalculated(self._pages, q.result.count)
					}
					
					// Throw an event with the page and global values of the aggregate if they are in the response
					if (q.result.aggregate) {
						self.aggregateCalculated(q.result.aggregate['pageValue'], q.result.aggregate['globalValue']);
					}
					
					self._itemsMap = []

					// if it's a * query, init fieldsArray with the fields in the 1st row
					if (apsdb.queryFields == '*') {
						self._fieldsArray = []
						if (q.result.documents[0]) {
							dojo.forEach(q.result.documents[0].fields, function(field) {
								self._fieldsArray.push(field['name'])
							})
						}						
					}
					
					dojo.forEach(q.result.documents, function(item) {
						var item = new apstrata._Item({item: item, fieldNames: self._fieldsArray, childrenNames: self._childrenArray})
						self._addItem(item)
					})
					
					self._fetchSuccess(request)
				},
				error: function(operation) {
					if (keywordArgs.onError) keywordArgs.onError({errorCode: operation.response.metadata.errorCode, errorMessage: operation.response.metadata.errorMessage}, request)
				}
			})

			return request
		},
				
		isItem: function(something) {
			var _v = false
			if (something) 
				if (something != null) 
					if (something.declaredClass)
						_v = (something.declaredClass == "apstrata._Item")
			return _v
		},
		
		getValues: function(/* item */ item, /* attribute-name-string */ attribute) {			
			return item.getValues(attribute)
		},
		
		getValue: function(/* item */ item, /* attribute-name-string */ attribute,  /* value? */ defaultValue) {
			return item.getValue(attribute, defaultValue)
		},

		getAttributes: function(item) {
			return item.getAttributes()
		},
		
		hasAttribute: function(item, attribute) {
			return item.hasAttribute(attribute)
		},
		
		containsValue: function(/* item */ item, /* attribute-name-string */ attribute, /* anything */ value) {
			return item.containsValue(attribute, value)
		},
		
		isItemLoaded: function(/* anything */ something) {
			if (this.isItem(something)) return something.isLoaded();
			else throw new Error("passed argument is not an item") 
		},
		
		loadItem: function(/* object */ keywordArgs) {
			//     keywordArgs:
			//        An anonymous object that defines the item to load and callbacks to invoke when the
			//        load has completed.  The format of the object is as follows:
			//        {
			//            item: object,
			//            onItem: Function,
			//            onError: Function,
			//            scope: object
			//        }
			//    The *item* parameter.
			//        The item parameter is an object that represents the item in question that should be
			//        contained by the store.  This attribute is required.
			//    The *onItem* parameter.
			//        Function(item)
			//        The onItem parameter is the callback to invoke when the item has been loaded.  It takes only one
			//        parameter, the fully loaded item.
			//
			//    The *onError* parameter.
			//        Function(error)
			//        The onError parameter is the callback to invoke when the item load encountered an error.  It takes only one
			//        parameter, the error object
			if (this.isItemLoaded(keywordArgs.item)) return 
			
			var self = this
			var params = {resultsPerPage: 1, 
							connection: self._connection, 
							apsdbStoreName: self._store,
							fields: self._fieldsAttribute, 
							childrenAttrs: self._childrenAttrs,
							label: self._label}
			var store = new apstrata.apsdb.client.ItemApsdbReadStore(params)

			store.fetch ({
							onComplete: function(items, request) {
								if (items.length > 0) {

									// TODO: temporary, needs to be implemented into _item like _item.copy(_item)
									keywordArgs.item.fieldsMap = items[0].fieldsMap
									keywordArgs.item.loaded = true
									keywordArgs.onItem(items[0])
									
									self._addItem(items[0])
									
								} else keywordArgs.onError("document with dockey " + keywordArgs.item.getIdentity() + " not found.")
							},
							
							onError: function(errorData, request) {
								keywordArgs.onError(errorData)
							},
							
				            query: {
								query: "apsdb.documentKey=\"" + keywordArgs.item.getIdentity() + "\"",
								count: false,
								pageNumber: 1
							}
						})
		},
		
		close: function(request) {
		},
		
		getLabel: function(/* item */ item) {
			return this.getValue(item, this._label)
		},
		
		getLabelAttributes: function(/* item */ item) {
			return [this._label]
		},
		
		//
		// dojo.data.api.Identity
		//
		
		getIdentity: function(/* item */ item) {
			if (!this.isItem(item)) throw new Error("not item")
			return item.getIdentity() 
		},
		
		getIdentityAttributes: function(/* item */ item) {
			return [item._KEY_LABEL]
		},
		
		fetchItemByIdentity: function(/* object */keywordArgs){
			var item = this._itemsMap[keywordArgs.identity]
			if (item!=undefined) {
				if (keywordArgs.onItem) keywordArgs.onItem(item) 								
			} else {
				if (keywordArgs.onError) keywordArgs.onError("not found") 
			}
		},
		
		//
		// ItemApsdbReadStore specific events
		//
		fetchSuccess: function() {
		},
		
		totalPagesCalculated: function(pages, itemsCount) {
		},
		
    aggregateCalculated: function(pageValue, globalValue) {
    }
	}) // end: ApsdbReadStore



