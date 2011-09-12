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

dojo.provide('apstrata.Operation');

dojo.require('dojo.io.script');
dojo.require('dojox.encoding.digests.MD5');
dojo.require('apstrata.util.logger.BasicLogger');

/**
 * Extends the apstrata database logger to include request and response features
 * @class apstrata.apsdb.client.Operation
*/
dojo.declare("apstrata.Operation",
[],
{
		//
		// Constants
		//
		_FAILURE: "failure",
		_SUCCESS: "success",

    /**
     * @constructor Operation Initializes request attributes and instance variables
     * @param connection The underlying connection to be used when this operation calls the apstrata database server
     */
		constructor: function(connection) {
			var self = this

			this.connection = connection
			
			if (!apstrata.operationId) apstrata.operationId = 0
			this.operationId = apstrata.operationId++
			
			this.request= {};
			this.request.apsdb = {};
			this.request.apsim = {};
			this._timeoutHandler = 0;
			
			this.apsdbOperation= "";
			
			// Response values
			this.response = {}
			this.response.status= "";
			this.response.message= "";
			this.response.errorcode= "";
			this.response.response= {};
			this.response.responseTime= -1;
			this.response.operationAborted= false;
			this.response.operationTimeout= false;
						
			this.log = {
				warn: function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
					if (apstrata.logger) apstrata.logger.warn(self, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
				},
			
				info: function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
					if (apstrata.logger) apstrata.logger.info(self, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
				},
				
				debug: function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
					if (apstrata.logger) apstrata.logger.debug(self, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
				},
				
				error: function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
					if (apstrata.logger) apstrata.logger.error(self, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
				}
			}
			
		},
		
		buildActionUrl: function(responseType, isForce200ResponseStatus) {
			params = ""
		    return this.connection.signUrl(this.apsdbOperation, params, responseType, isForce200ResponseStatus).url;
		},

		/*
		 * covert object to query for request.apsdb, request.apsim etc.
		 */
		buildUrlPart: function(label) {
			var self = this

			var url = ""
			
			if (this.request[label]) {
				var o = {}
				
				for (k in this.request[label]) {
					o[label+"."+k] = self.request[label][k]
				}
				
				url = dojo.objectToQuery(o)
			} 
			
			return url
		},

		/*
		 * covert the request object to a query string.
		 */
		_buildQueryString: function() {
			var self=this
			var url = ''
			var o = {}
			
			for (k in this.request) {
				// if this is a multi-value or single value field put in o 
				if (dojo.isString(this.request[k]) || dojo.isArray(this.request[k]) || ((typeof this.request[k]) == 'number') || ((typeof this.request[k]) == 'boolean')) {
					o[k] = this.request[k]
				} else {
					// otherwise convert the (apsim, apsws etc.) object to a query and add to url
					url += ((url.length>0)?"&":"") + self.buildUrlPart(k)
				}
			}

			// convert o to object and add to URL
			url += ((url.length>0)?"&":"") + dojo.objectToQuery(o)

			return url
		},

		buildUrl: function() {
			// sign url with operation
			return this.connection.signUrl(this.apsdbOperation, this._buildQueryString());
		},
		
		/*
		 * flattens the request object to use in dojo.io.ifram Post content field.
		 */
		buildRequestObject: function() {
			/*
			var self=this
			var o = {}
			
			for (k in this.request) {
				// if this is a multi-value or single value field put in o 
				if (dojo.isArray(self.request[k]) || dojo.isString(self.request[k])) {
					o[k] = self.request[k]
				} else {
					for (i in self.request[k]) {
						o[k+"."+i] = self.request[k][i]
					}
				}
			}
			*/
			return dojo.queryToObject(this._buildQueryString())
		},
		
	    /**
	     * @function Abstract function.
	     */
		execute: function () {},

	    // Sets the timeout of the operation to the timeout of the connection
		_setTimeout: function() {
			var self = this;
			if (self.connection.timeout>0) {
				self._timeoutHandler = setTimeout (dojo.hitch(self, "timeout"), self.connection.timeout);
				this.log.debug('timeout handler set:', self.connection.timeout, ",", self._timeoutHandler)
			}
		},

    	// Removes the timeout of the operation
		_clearTimeout: function() {
			if (this._timeoutHandler) {
				this.log.debug('timeout handler cleared:', this._timeoutHandler+"")
				clearTimeout (this._timeoutHandler);
				this._timeoutHandler = 0;
			}
		},

	    /**
	     * @function timeout Force the operation to timeout
	     */
		timeout: function() {
			var self=this
			this.log.warn("Timeout or communication error")
			
			this.operationTimeout = true;

			this.response = {}
			this.response.metadata = {}
			this.response.metadata.errorCode = "timeout_communication_error";
			this.response.metadata.errorDetail = "Timeout or communication error";

			this.responseTime = this.connection.timeout
	
			dojo.publish("/apstrata/operation", [{
					id: self.operationId,
					method: 'GET',
					type: "message",
					success: false,
					response: "<span style='font-size: 2em;'>&#8734</span>",
					message: "&#8734"
			}])

			this.handleError();
		},

	    /**
	     * @function abort Abort the operation
	     */
		abort: function() {
			this.log("Abort received");

			// Clear the timeout if the operation is aborted
			if (this._timeoutHandler) {
				clearTimeout (this._timeoutHandler);
				this.log.debug('abort: timeout handler, unset', this._timeoutHandler)
			}
			
			this.operationAborted = true;
		},
		//
		//

	    /**
	     * @function handleResult Stop receiving the response and handle what was collected
	     */
		handleResult: function() {
			//this.connection.activity.stop(this);
		},

	    /**
	     * @function handleError Stop receiving the response and log the error that occurred
	     */
		handleError: function() {
			//this.connection.activity.stop(this)
        	this.log.warn("errorCode:", this.response.metadata.errorCode)
        	this.log.warn("errorDetail:", this.response.metadata.errorDetail)
		}
	});
