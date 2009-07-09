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

dojo.provide("apstrata.apsdb.client.ItemApsdbReadStore");

dojo.require("dojo.data.api.Request")

dojo.require("apstrata.apsdb.client.Connection")
dojo.require("apstrata.util.logger.Logger")
dojo.require("apstrata.apsdb.client.Client")
dojo.require("apstrata.apsdb.client._Item")

dojo.declare("apstrata.apsdb.client.ItemApsdbReadStore", 
	[],
	{
		_KEY_LABEL: "@key",
		
		constructor: function(attrs) {
			// add log capabilities to object
			_l = new apstrata.util.logger.Logger()
			dojo.mixin(this, _l)
			this._features = {'dojo.data.api.Read':true, 'dojo.data.api.Identity':true};

			// Arrays that hold fetched items
			this._items = []
			this._itemsMap = []

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
		
		_addItem: function(item) {
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
					self._items = []
					if (q.result.count) {
						self._pages = Math.ceil(q.result.count/self._resultsPerPage)
						self.totalPagesCalculated(self._pages)
					}

					self._itemsMap = []
					dojo.forEach(q.result.documents, function(item) {
						var item = new apstrata.apsdb.client._Item({item: item, fieldNames: this._fieldsArray})
						self._addItem(item)
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
			return (something.declaredClass == "apstrata.apsdb.client._Item")
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
			return item.getIdentity() 
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



