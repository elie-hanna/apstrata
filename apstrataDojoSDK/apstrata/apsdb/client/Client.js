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
dojo.provide("apstrata.apsdb.client.Client");

dojo.require("apstrata.apsdb.client.Connection");
dojo.require("apstrata.apsdb.client.ListStores");
dojo.require("apstrata.apsdb.client.CreateStore");
dojo.require("apstrata.apsdb.client.DeleteStore");
dojo.require("apstrata.apsdb.client.ListGroups");
dojo.require("apstrata.apsdb.client.CreateGroup");
dojo.require("apstrata.apsdb.client.DeleteGroup");
dojo.require("apstrata.apsdb.client.ListUsers");
dojo.require("apstrata.apsdb.client.DeleteUser");
dojo.require("apstrata.apsdb.client.SaveUser");
dojo.require("apstrata.apsdb.client.GetUser");
dojo.require("apstrata.apsdb.client.ListSchemas");
dojo.require("apstrata.apsdb.client.DeleteDocument");
dojo.require("apstrata.apsdb.client.SaveDocument");
dojo.require("apstrata.apsdb.client.Query");
dojo.require("apstrata.apsdb.client.SetSchema");
dojo.require("apstrata.apsdb.client.GetSchema");
dojo.require("apstrata.apsdb.client.ListSchemas");
dojo.require("apstrata.util.logger.Logger");

dojo.declare("apstrata.apsdb.client.Client", 
	[apstrata.util.logger.Logger], 
	{

		constructor: function(connection) {
			this.clearQueue()
			
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
		
		clearQueue: function() {
			this._q = []
		},
		
		execute: function(attrs) {
			//    summary:
			//			Kicks the sequential execution of the operations added to the queue
			//
			//    keywordArgs:
			//        {
			//            continueOnError: boolean
			//            success: function
			//            failure: function
			//            iterationSuccess: function
			//            iterationFailure: function
			//			  _error: boolean
			//        }
			//
			//    The *continueOnError* parameter.
			//			boolean
			//
			//			if true, the queue will attempt to execute all operations in the queue, even if one or more
			//			have failed. Otherwise, the execution stops at the first failed operation
			//
			//    The *success* parameter.
			//			function();
			//
			//			callback invoked when the queue has executed entirely with all operations succesful
			//			or in case of errors in one or more of the operations but *continueOnError* is set to true.
			//
			//    The *failure* parameter.
			//			function();
			//
			//			callback invoked after the execution of the queue if 1 operation has failed at least.
			//
			//    The *iterationSuccess* parameter.
			//			function(operation);
			//			
			//			callBack invoked after each individual operation is performed successfully
			//
			//    The *iterationFailure* parameter.
			//			function(operation);
			//
			//			callBack invoked after each individual operation is performed unsuccessfully
			//
			//    The *_error* parameter.
			//			boolean
			//
			//			set to true by an execute iteration so subsequent calls to execute know that 
			//			there has been an error in executing a previous operation from the queue earlier
			//
			//    returns:
			//        Nothing.  Since all operations are asynchronous, there is
			//        no need to return anything.  All results are passed via callbacks.
			//    examples:
			//        client.execute({continueOnError: true, success: function() {}});

			var self = this
			
			var continueOnError = false
			if (attrs && attrs.continueOnError) continueOnError = attrs.continueOnError

			if (self._q.length == 0) {
				self.log(self._LOGGER.ERROR, "Queue empty.")
				return
			}
			
			var o = this._q.shift()

			// make first character lower case to correspond to the proper method of this class			
			var opName = o.operation.substring(0,1).toLowerCase() 
					+ o.operation.substring(1, o.operation.length)

			// invoke method
			var op = this[opName](
				function() {
					if (attrs && attrs.iterationSuccess) attrs.iterationSuccess(op)

					// If it's the end of the queue, invoke callback
					//	else continue through queue
					if (self._q.length == 0) {
						if (attrs._error) {
							if (attrs && attrs.failure) attrs.failure()
						} else {
							if (attrs && attrs.success) attrs.success(); 														
						}					
					} else {
						 self.execute(attrs)
					}
				},
				function() {
					self.log("failed executing queued operation", o)

					if (attrs && attrs.iterationFailure) attrs.iterationFailure(op)

					if (self._q.length == 0) {
						// If it's the end of the queue, invoke callback
						if (attrs && attrs.failure) attrs.failure()
						// if it's not the end of the queue
					} if (continueOnError) {
						//	if continueOnError is requested, continue the execution
						attrs._error = true
						self.execute(attrs)
					} else if (attrs && attrs.failure) {
						//  invoke the failure callback and stop execution
						attrs.failure(op)							
					}
				},
				o.attrs)
		},

		_operation: function(success, failure, operation, attrs) {
			var self = this

			if (success != undefined) {
				dojo.connect(operation, "handleResult", function() {
					success(operation)
				})
			}

			if (failure != undefined) {
				dojo.connect(operation, "handleError", function() {
					failure(operation)
				})
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
		createGroup: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.CreateGroup(this.connection)
			return this._operation(success, failure, op, attrs)
		},
		listGroups: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.ListGroups(this.connection)
			return this._operation(success, failure, op, attrs)
		},
		deleteGroup: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.DeleteGroup(this.connection)
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
		},
		setSchema: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.SetSchema(this.connection)
			return this._operation(success, failure, op, attrs)
		},
		getSchema: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.GetSchema(this.connection)
			return this._operation(success, failure, op, attrs)
		},
		listSchemas: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.ListSchemas(this.connection)
			return this._operation(success, failure, op, attrs)
		},
		
		saveUser: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.SaveUser(this.connection)
			return this._operation(success, failure, op, attrs)
		},
		listUsers: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.ListUsers(this.connection)
			return this._operation(success, failure, op, attrs)
		},
		getUser: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.GetUser(this.connection)
			return this._operation(success, failure, op, attrs)
		},
		deleteUser: function(success, failure, attrs) {
			var op = new apstrata.apsdb.client.DeleteUser(this.connection)
			return this._operation(success, failure, op, attrs)
		}
		
	})
