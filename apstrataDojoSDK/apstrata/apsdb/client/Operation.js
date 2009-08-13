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

dojo.provide("apstrata.apsdb.client.Operation")

dojo.require ("dojo.io.script")
dojo.require ("dojox.encoding.digests.MD5")
dojo.require ("apstrata.util.logger.Logger")

/**
 * Extends the apstrata database logger to include request and response features
 * @class apstrata.apsdb.client.Operation
 * @extends apstrata.util.logger.Logger
*/
dojo.declare("apstrata.apsdb.client.Operation",
[apstrata.util.logger.Logger],
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
			if (typeof connection != "object") new Error("apstrata.apsdb.client.Operation requires a connection object")
			this.connection = connection
			
			this.request= {};
			this.request.apsdb = {};
			this.request.apsim = {};
			this._timeoutHandler = 0;
			
			this.apsdbOperation= "";
			
			// Response values
			this.status= "";
			this.message= "";
			this.errorcode= "";
			this.response= {};
			this.responseTime= -1;
			this.operationAborted= false;
			this.operationTimeout= false;
			
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

		    for (prop in this.request) {
				if (prop != "apsdb" && prop != "apsim") {
					request[prop] = this.request[prop]
				}				
		    }
			
			return request
		},
		
		buildActionUrl: function() {
			params = ""
		    return this.connection.signUrl(this.apsdbOperation, params, "xml").url;
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

		    for (prop in this.request) {
				if (i>0) params += "&";
				i++;
				
				if (prop != "apsdb" && prop != "apsim") {
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
				this.log(self._LOGGER.DEBUG, 'timeout handler, set', self._timeoutHandler+" " + self.connection.getTimeout()+"")
			}
		},

    // Removes the timeout of the operation
		_clearTimeout: function() {
			if (this._timeoutHandler) {
				this.log(this._LOGGER.DEBUG, 'timeout handler, cleared', this._timeoutHandler+"")
				clearTimeout (this._timeoutHandler);
				this._timeoutHandler = 0;
			}			
		},

    /**
     * @function timeout Force the operation to timeout
     */
		timeout: function() {
			this.log("Timeout or communication error")
			
			this.operationTimeout = true;

			this.errorCode = "timeout_communication_error";
			this.errorMessage = "Timeout or communication error";
			this.response = null;
			// responseTime = timeout 
			this.responseTime = this.connection.getTimeout()
	
			this.connection.activity.timeout(this);

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
				this.log('abort: timeout handler, unset', this._timeoutHandler)
			}
			
			this.operationAborted = true;
		},
		//
		//

    /**
     * @function requestSent Initiate making the request
     */
		requestSent: function() {this.connection.activity.start(this)},

    /**
     * @function handleResult Stop receiving the response and handle what was collected
     */
		handleResult: function() {
			this.connection.activity.stop(this);
		},

    /**
     * @function handleError Stop receiving the response and log the error that occurred
     */
		handleError: function() {
			this.connection.activity.stop(this);
        	this.log("errorCode", this.errorCode);
        	this.log("errorMessage", this.errorMessage);
		}
	});


