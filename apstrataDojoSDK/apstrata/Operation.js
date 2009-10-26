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

dojo.provide("apstrata.Operation")

dojo.require ("dojo.io.script")
dojo.require ("dojox.encoding.digests.MD5")
dojo.require ("apstrata.util.logger.BasicLogger")

/**
 * Extends the apstrata database logger to include request and response features
 * @class apstrata.apsdb.client.Operation
 * @extends apstrata.util.logger.Loggable
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
		
		buildRequestObject: function() {
		    var params = ""; var i=0;
			var request = {}

		    if (this.request.apsdb != null) {
				for (prop in this.request.apsdb) {
					request["apsdb."+prop] = this.request.apsdb[prop]
				}
		    }
			
			if (this.request.apsim != null) {
				for (prop in this.request.apsim) {
					request["apsim."+prop] = this.request.apsim[prop]
				}
		    }

			if (this.request.apsws != null) {
				for (prop in this.request.apsws) {
					request["apsws."+prop] = this.request.apsws[prop]
				}
			}

		    for (prop in this.request) {
				if (prop != "apsdb" && prop != "apsim" && prop != "apsws") {
					request[prop] = this.request[prop]
				}				
		    }
			
			return request
		},
		
		buildActionUrl: function(responseType) {
			params = ""
		    return this.connection.signUrl(this.apsdbOperation, params, responseType).url;
		},

	    /**
	     * @function buildUrl Allows you to build the standard URL, could be overriden when necessary
	     * @returns The URL to be called
	     */
		buildUrl: function() {
		    var params = ""; var i=0;

		    if (this.request.apsdb != null) {
				for (prop in this.request.apsdb) {
				    if (i>0) params += "&";
				    i++;
				    params += "apsdb." + prop + "=" + encodeURIComponent(this.request.apsdb[prop]); 
				}
		    }
			
			if (this.request.apsim != null) {
				for (prop in this.request.apsim) {
				    if (i>0) params += "&";
				    i++;
				    params += "apsim." + prop + "=" + encodeURIComponent(this.request.apsim[prop]); 
				}
		    }

			if (this.request.apsws != null) {
				for (prop in this.request.apsws) {
				    if (i>0) params += "&";
				    i++;
				    params += "apsws." + prop + "=" + encodeURIComponent(this.request.apsws[prop]); 
				}
			}
			
		    for (prop in this.request) {
				if (i>0) params += "&";
				i++;
				
				if (prop != "apsdb" && prop != "apsim" && prop != "apsws") {
					var value = this.request[prop]
					if (dojo.isArray(value)) {
						dojo.forEach(value, function(v) {
							params +=  prop + "=" + encodeURIComponent(v) + "&"
						})
					} else {
						params +=  prop + "=" + encodeURIComponent(value) + "&"
					}
				}				
		    }

		    var urlValue = this.connection.signUrl(this.apsdbOperation, params);

		    return urlValue;
		},

    /**
     * @function abstrata function
     */
		execute: function () {},

    // Sets the timeout of the operation to the timeout of the connection
		_setTimeout: function() {
			var self = this;
			if (self.connection.getTimeout()>0) {
				self._timeoutHandler = setTimeout (dojo.hitch(self, "timeout"), self.connection.getTimeout());
				this.log.debug('timeout handler set:', self.connection.getTimeout(), ",", self._timeoutHandler)
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
			this.response.metadata.errorMessage = "Timeout or communication error";

			this.responseTime = this.connection.getTimeout()
	
			dojo.publish("/apstrata/operation", [{
					id: self.operationId,
					method: 'GET',
					type: "message",
					success: false,
					response: " ",
					message: " "
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
        	this.log.warn("errorMessage:", this.response.metadata.errorMessage)
		}
	});
