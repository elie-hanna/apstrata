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
dojo.provide("apstrata.apsdb.client.Client");

dojo.require("apstrata.apsdb.client.Connection");
dojo.require("apstrata.apsdb.client.ListStores");
dojo.require("apstrata.apsdb.client.CreateStore");
dojo.require("apstrata.apsdb.client.DeleteStore");
dojo.require("apstrata.apsdb.client.DeleteDocument");
dojo.require("apstrata.apsdb.client.SaveDocument");
dojo.require("apstrata.apsdb.client.Query");
dojo.require("apstrata.util.logger.Logger");

dojo.declare("apstrata.apsdb.client.Client", 
	[apstrata.util.logger.Logger], 
	{
		_q: [],

		constructor: function(connection) {
			if (connection == undefined) {
				this.connection = new apstrata.apsdb.client.Connection()
			} else {
				this.connection = connection
			}
		},


		//
		// The queue/execute methods allow operations to be executed in synchronously and sequentially
		//		
		queue: function(operation, attrs) {
			this._q.push({
				operation: operation,
				attrs: attrs
			})
		},
		
		execute: function(continueOnError) {
			var self = this
			if (continueOnError == undefined) continueOnError = false
			
			var o = this._q.shift()			

			// make first character lower case to correspond to the proper method of this class			
			var opName = o.operation.substring(0,1).toLowerCase() 
					+ o.operation.substring(1, o.operation.length)

			var op = this[opName](
				function() {
					self.execute()
				},
				function() {
					self.log("failed executing queued operation", o)
					if (continueOnError) self.execute(continueOnError)
				},
				o.attrs)
		},

		_operation: function(success, failure, operation, attrs) {
			var self = this
			if (success != undefined) {
				dojo.connect(operation, "handleResult", function() {
					success(operation)
				})
				if (failure != undefined) {
					dojo.connect(operation, "handleError", function() {
						failure(operation)
					})
				}
			}

			operation.execute(attrs)

			return operation
		},

		createStore: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.CreateStore(this.connection)
			return this._operation(success, failure, op, attrs)
		},

		listStores: function(success, failure) {
			var op = new apstrata.apsdb.client.ListStores(this.connection)
			return this._operation(success, failure, op)
		},
		
		deleteStore: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.DeleteStore(this.connection)
			return this._operation(success, failure, op, attrs)
		},
		
		saveDocument: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.SaveDocument(this.connection)
			return this._operation(success, failure, op, attrs)
		},
		
		deleteDocument: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.DeleteDocument(this.connection)
			return this._operation(success, failure, op, attrs)
		},

		query: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.Query(this.connection)
			return this._operation(success, failure, op, attrs)
		}
		
	})
