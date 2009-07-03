/*******************************************************************************
 *  Copyright 2009 apstrata
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *
 *  You may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0.html
 *  This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 *  CONDITIONS OF ANY KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations under the License.
 * *****************************************************************************
 */
dojo.provide("apstrata.apsdb.client.ItemApsdbReadStore");

dojo.require("dojo.data.api.Request")

dojo.require("apstrata.apsdb.client.Connection")
dojo.require("apstrata.util.logger.Logger")
dojo.require("apstrata.apsdb.client.Client")

dojo.declare("apstrata.apsdb.client.ItemApsdbReadStore", 
	[],
	{
		_KEY_LABEL: "@key",
		
		constructor: function(attrs) {
			// add log capabilities to object
			_l = new apstrata.util.logger.Logger()
			dojo.mixin(this, _l)
			this._features = {'dojo.data.api.Read':true, 'dojo.data.api.Identity':true};

			// Instantiate apsdb client
			this._client = new apstrata.apsdb.client.Client(attrs.connection)
			this._store = attrs.apsdbStoreName

			// remove spaces from attrs.fields
			this._fields = attrs.fields.split(' ').join('')
			
			this._fieldsArray = this._fields.split(",")
			
			if (attrs.resultsPerPage) this._resultsPerPage = attrs.resultsPerPage
//			if (attrs.pageNumber) this._pageNumber = attrs.pageNumber

			// this._query = "XXYY != \"true\"" // TODO: dummy condition, is this right?
			this._label = attrs.label
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
		
		_normalizeItem: function(item) {
			item.fieldsMap = {}
			
			dojo.forEach(item.fields, function(field) {
				item.fieldsMap[field["@name"]] = field
			})
			
			// Hack needed for dojo grid (and maybe other widgets), if a column is expected and it's not found in the item
			//  the widget breaks
			dojo.forEach(this._fieldsArray, function(fieldName) {
				if (item.fieldsMap[fieldName] == undefined) {
					var value = {"@name": fieldName, "@type": "string", values: [null]}
					
					item.fieldsMap[fieldName] = value
					item.fields.push(value)
				}
			})
		},
		
		fetch: function(/* Object */ keywordArgs) {
			//
			//    keywordArgs:
			//        The keywordArgs parameter may either be an instance of
			//        conforming to dojo.data.api.Request or may be a simple anonymous object
			//        that may contain any of the following:
			//        {
			//            query: query-string or query-object,
			//            queryOptions: object,
			//            onBegin: Function,
			//            onItem: Function,
			//            onComplete: Function,
			//            onError: Function,
			//            scope: object,
			//            start: int
			//            count: int
			//            sort: array
			//        }
			var self = this
			var request = dojo.mixin(keywordArgs, new dojo.data.api.Request());
			var queryExpression = keywordArgs.query.query || this._query
			var pageNumber = (keywordArgs.query.pageNumber!=undefined)?keywordArgs.query.pageNumber:1
			var count = (keywordArgs.query.count!=undefined)?keywordArgs.query.count:false
			
			var q = this._client.query(
				function() {
					self._items = q.result.documents
					
					if (q.result.count) {
						self._pages = Math.ceil(q.result.count/self._resultsPerPage)
						self.totalPagesCalculated(self._pages)
					}

					self._itemsMap = []
					dojo.forEach(self._items, function(item) {
						// create hashtable _itemsMap for fetching items by identity
						self._itemsMap[item[self._KEY_LABEL]] = item
						
						// Create hashtable for accessig fields by name
						//  add missing fields
						self._normalizeItem(item) 
					})

					self._fetchSuccess(request)
				},
				function() {
					if (keywordArgs.onError) keywordArgs.onError({errorCode: q.errorCode, errorMessage: q.errorMessage}, request)
				},							
				{
					store: self._store,
					queryFields: self._fields,
					pageNumber: pageNumber,
					resultsPerPage: self._resultsPerPage,
					count: count,
					query: queryExpression
				})
			
			return request
		},
		
		isItem: function(something) {
			return true
		},
		
		getValues: function(/* item */ item, /* attribute-name-string */ attribute) {
			if (!this.isItem(item)) throw new Error("getValue: this is not an item", item)
			if (attribute == this._KEY_LABEL) {
				return [item[attribute]]
			} else {
				return item.fieldsMap[attribute].values
			}
		},
		
		getValue: function(/* item */ item, /* attribute-name-string */ attribute,  /* value? */ defaultValue) {
			var v = this.getValues(item, attribute)[0]
			if (v == undefined) {
				if (defaultValue != undefined) return defaultValue; else return undefined;
			} else return v
		},

		getAttributes: function(item) {
			var attributeNames = []
			for (var a in item.fieldsMap) {
				attributeNames.push(a)
			}
			
			return attributeNames
		},
		
		hasAttribute: function(item, attribute) {
			return (item.fieldsMap[attribute] != undefined)
		},
		
		containsValue: function(/* item */ item, /* attribute-name-string */ attribute, /* anything */ value) {
			var values = this.getValues(item, attribute)
			var found = false
			dojo.forEach(values, function(v) {
				if (v == value) {
					found = true || found
				}
			})
			
			return found
		},
		
		isItemLoaded: function(/* anything */ something) {
			return this.isItem(something) 
		},
		
		loadItem: function(/* object */ keywordArgs) {
			if (this.isItemLoaded(keywordArgs.item)) return 
			//TODO: needs implemenation 	
			
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
			return this.getValue(item, this._KEY_LABEL) 
		},
		
		getIdentityAttributes: function(/* item */ item) {
			return [this._KEY_LABEL]
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
		
		totalPagesCalculated: function(pages) {
			
		}

		
	}) // end: ApsdbReadStore



