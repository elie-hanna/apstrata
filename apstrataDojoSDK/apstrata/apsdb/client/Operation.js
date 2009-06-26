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

	dojo.declare("apstrata.apsdb.client.Operation",
	[apstrata.util.logger.Logger],
	{
		//
		// Constants
		//
		_FAILURE: "failure",
		_SUCCESS: "success",

		constructor: function(connection) {
			if (typeof connection != "object") new Error("apstrata.apsdb.client.Operation requires a connection object")
			this.connection = connection
			
			this.request= {};
			this.request.apsdb = {};
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
		
		// Allows you to build the standard URL, could be overriden when necessary
		buildUrl: function() {
		    var params = ""; var i=0;

		    if (this.request.apsdb != null) {
				for (prop in this.request.apsdb) {
				    if (i>0) params += "&";
				    i++;
				    params += "apsdb." + prop + "=" + encodeURIComponent(this.request.apsdb[prop]); 
				}
		    }

		    for (prop in this.request) {
				if (i>0) params += "&";
				i++;
				if (prop != "apsdb") params +=  prop + "=" + encodeURIComponent(this.request[prop]) + "&"; 
		    }

		    var urlValue = this.connection.signUrl(this.apsdbOperation, params);

		    return urlValue;
		},

		execute: function () {},
		
		_setTimeout: function() {
			var self = this;
			if (self.connection.getTimeout()>0) {
				self._timeoutHandler = setTimeout (dojo.hitch(self, "timeout"), self.connection.getTimeout());
				this.log(self._LOGGER.DEBUG, 'timeout handler, set', self._timeoutHandler+" " + self.connection.getTimeout()+"")
			}
		},
		
		_clearTimeout: function() {
			if (this._timeoutHandler) {
				this.log(this._LOGGER.DEBUG, 'timeout handler, cleared', this._timeoutHandler+"")
				clearTimeout (this._timeoutHandler);
				this._timeoutHandler = 0;
			}			
		},
		
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

		requestSent: function() {this.connection.activity.start(this)},

		handleResult: function() {
			this.connection.activity.stop(this);
		},
		
		handleError: function() {
			this.connection.activity.stop(this);
        	this.log("errorCode", this.errorCode);
        	this.log("errorMessage", this.errorMessage);
		}
	});


