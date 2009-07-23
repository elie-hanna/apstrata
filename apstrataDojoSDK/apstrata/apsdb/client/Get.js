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

dojo.provide("apstrata.apsdb.client.Get");

dojo.require ("dojo.io.script");
dojo.require ("dojox.encoding.digests.MD5");
dojo.require ("apstrata.apsdb.client.Operation");

	dojo.declare("apstrata.apsdb.client.Get",
	[apstrata.apsdb.client.Operation],
	{
		//
		// Constants
		//
		_TYPE_STRING: "string",
                
        constructor: function() {
                this._LOGGER.setClassLabel("apstrata.apsdb.client.Get")      
        },
		
		execute: function () {
			var self = this;

			// Send debug information to connection object, could be used later to identify problems
			self.log("Operation", self.apsdbOperation);
		
			var timestamp = new Date().getTime();
    
			// Since the hack for JSONP doesn't really allow for communication errors to be caught,
			//  we're using a timeout event to provide an error message if an operation takes too long to execute
			self._setTimeout()

			var buildUrl = self.buildUrl();
			self.url = buildUrl.url
			self.signature = buildUrl.signature

			self.log("GET", self.url);

			// send out event that we are sending a request to apstrata
			self.requestSent()

			dojo.io.script.get({ 
				url: self.url,
				callbackParamName : "apsws.jc",
				load: function(json) {
					self.log("response object", json);

					self.responseTime = (new Date().getTime()) - timestamp;
					self.connection.registerConnectionTime(self.responseTime)
					self.log("response time (ms)", self.responseTime);
					// Clear the timeout since we received a response from apstrata
					self._clearTimeout();
					
					// we can't do a real abort or timeout operation
					//  we're just using a flag to artificially ignore the result if the user requests an abort
					//  or if after a timeout, a response was received anyway
					self.log(self._LOGGER.DEBUG, "Aborted", self.operationAborted);
					self.log(self._LOGGER.DEBUG, "Timed out", self.operationTimeout);
					if (self.operationAborted || self.operationTimeout) return jsonTxt;
                    var json

                    if (self.response != undefined) {
						// Copy metadata fields to the Operation object
						for (prop in json.response.metadata) {
							self[prop] = json.response.metadata[prop]
						}
						
						// Copy the result to the Operation object result field
						for (prop in json.response) {
							self[prop] = json.response[prop];
						}
						
						self.log("requestId", self.requestId)
                        self.log("status", self.status);

                        if (self.status==self._SUCCESS) {
                            self.handleResult();
                        } else {
                            self.handleError();
							if ((self.error == "INVALID_AUTHENTICATION_KEY") || (self.error == "INVALID_SIGNATURE")) {
								self.connection._credentialsError()
							}
                        }
                    } else {
						// TODO: test case for bad response
                        self.status = "failure";
                        self.errorCode = "CLIENT_BAD_RESPONSE"
                        self.errorMessage = "apsdb client: bad response from apsdb or communication error"
                        self.log(this._LOGGER.ERROR ,"errorMessage", self.errorMessage);
                        self.handleError();                                        
                    }

					return json; 
				}, 
					
				error: function(err) {
					// left this here as a placeholder 
					// the hack for invoking JSONP doesn't return any errors
					// that's why i'm using a timeout
				} 
			}); 			    
		}
	});


