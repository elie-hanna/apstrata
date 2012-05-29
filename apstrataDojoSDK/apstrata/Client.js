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
dojo.provide('apstrata.Client');

dojo.require('apstrata.Connection');
dojo.require('apstrata.Get');
dojo.require('apstrata.Post');

dojo.declare('apstrata.Client', 
	null, 
	{
		
		_MESSAGE_DURATION: 1000,

		/**
		 * This constructor will generate a new connection object if one is not sent as a parameter.
		 *
		 * @param connection
		 * 			A connection object that is expected to be an "apstrata.Connection" or an instance
		 * 			of an object that extends it.
		 * @param handleResult (Optional)
		 * 			A generic handler function to be called after receiving a successful response.
		 * @param handleError (Optional)
		 * 			A generic handler function to be called after receiving a failure response.
		 * @param handleJSErrors (Optional)
		 * 			A generic handler function to be called when the provided success or failure
		 * 			handlers break and throw an exception.
		 */
		constructor: function(attrs) {
			if (attrs) {
				if (attrs.connection) {
					this.connection = attrs.connection;
				}
				if (attrs.handleResult) {
					this.handleResult = attrs.handleResult;
				}
				if (attrs.handleError) {
					this.handleError = attrs.handleError;
				}
				if (attrs.handleJSErrors) {
					this.handleJSErrors = attrs.handleJSErrors;
				}
			}

			if (!this.connection) {
				this.connection = new apstrata.Connection();
			}
		},

		call: function(attrs) {
			var self = this

			// Check that the connection is still live before trying to use it to make a request.
			var checkConnectionResult = self.connection.checkConnection();
			if (checkConnectionResult && checkConnectionResult.status == "failure") {
				dojo.publish("/apstrata/connection", [{
					action: 'stopped',
					message: checkConnectionResult.errorDetail,
					type: "error"
				}]);

				return;
			}

			dojo.publish("/apstrata/connection", [{
					action: 'start',
					message: "Calling apstrata API: <b>" + attrs.action + "</b>", 
					type: "message", 
					duration: self._MESSAGE_DURATION
			}])
			
			if (attrs.useHttpMethod) {
				if (attrs.useHttpMethod=="POST") {
					var operation = new apstrata.Post(this.connection)
				} else {
					var operation = new apstrata.Get(this.connection)
				} 
			} else {
				if ((attrs.action == "SaveDocument") || (attrs.action == "SaveSchema") || (attrs.action == "SaveScript")) {
					var operation = new apstrata.Post(this.connection)
				} else {
					var operation = new apstrata.Get(this.connection)
				}
			}

			// If a timeout is sent, then set it on the operation.
			if (attrs.timeout) {
				operation.setTimeout(attrs.timeout);
			}

			operation.apsdbOperation = attrs.action

			operation.request = attrs.request

			var handle1 = dojo.connect(operation, "handleResult", function() {
				if (self.handleResult) self.handleResult(operation);
				var possibleException = null;
				try {
					attrs.load(operation);
				} catch (e) {
					possibleException = e;
				}
				
				dojo.disconnect(handle1)
				dojo.disconnect(handle2)

				dojo.publish("/apstrata/connection", [{
					action: 'end',
					success: true,
					message: "Call to apstrata API: <b>" + attrs.action + "</b> successful", 					
					type: "message", 
					duration: self._MESSAGE_DURATION,
					operation: operation
				}]);

				if (possibleException) {
					if (attrs.JSErrors) {
						attrs.JSErrors(possibleException);
					} else if (self.handleJSErrors) {
						self.handleJSErrors(possibleException);
					} else if (console) {
						console.error(possibleException);
						console.dir(possibleException);
					}
				}
			})

			var handle2 = dojo.connect(operation, "handleError", function() {
				if (self.handleError) self.handleError(operation);
				var possibleException = null;
				try {
					attrs.error(operation);
				} catch (e) {
					possibleException = e;
				}

				dojo.disconnect(handle1)
				dojo.disconnect(handle2)

				dojo.publish("/apstrata/connection", [{
					action: 'end',
					success: false,
					message: "Call to apstrata API: <b>" + attrs.action + "</b> failed", 					
					type: "warning", 
					duration: self._MESSAGE_DURATION,
					operation: operation
				}]);

				if (possibleException) {
					if (attrs.JSErrors) {
						attrs.JSErrors(possibleException);
					} else if (self.handleJSErrors) {
						self.handleJSErrors(possibleException);
					} else if (console) {
						console.error(possibleException);
						console.dir(possibleException);
					}
				}
			})

			operation.execute(attrs)		
			this.url = operation.url		
		} 
	})