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

dojo.provide("apstrata.apsdb.client.Get");

dojo.require ("dojo.io.script");
dojo.require ("dojox.encoding.digests.MD5");
dojo.require ("apstrata.apsdb.client.Operation");

/**
 * Base class used as an abstract class for all other APIs
 * @class apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.Get",
[apstrata.apsdb.client.Operation],
	{
		//
		// Constants
		//
		_TYPE_STRING: "string",
        /**
         * @constructor Get Sets the logger
         */
        constructor: function() {
//                this._LOGGER.setClassLabel("apstrata.apsdb.client.Get")      
        },
		
		getUrl: function() {
			return this.buildUrl().url
		},
		
		/**
     * @function execute Creates an apsdb operation and sends an AJAX request to apstrata database
     */
		execute: function () {
			var self = this;
			
			var timestamp = new Date().getTime();
    
			var buildUrl = self.buildUrl();
			self.url = buildUrl.url
			self.signature = buildUrl.signature



			self.groupMessages("GET request sent")
				self.log("Operation", self.apsdbOperation);
				self.log("GET", self.url);

			// Since the hack for JSONP doesn't really allow for communication errors to be caught,
			//  we're using a timeout event to provide an error message if an operation takes too long to execute
			self._setTimeout()

			self.endGroupMessages()

			// send out event that we are sending a request to apstrata
			self.requestSent()

			dojo.io.script.get({ 
				url: self.url,
				callbackParamName : "apsws.jc",
				load: function(json) {

					self.groupMessages("GET response received")

					self.responseTime = (new Date().getTime()) - timestamp;
					self.connection.registerConnectionTime(self.responseTime)
	
						self.info("response object", json);
						self.info("response time (ms)", self.responseTime);
						self.debug("Aborted", self.operationAborted);
						if (self.operationTimeout) self.warn("Timed out", self.operationTimeout);
	
					// Clear the timeout since we received a response from apstrata
					self._clearTimeout();
					
					// we can't do a real abort or timeout operation
					//  we're just using a flag to artificially ignore the result if the user requests an abort
					//  or if after a timeout, a response was received anyway
					if (self.operationAborted || self.operationTimeout) {
						// End the debug messages group since we're not loggin any more stuff
						self.endGroupMessages()
						return
					}

                    var json

					// No need to issue self.endGroupMessages() beyond this point because it's called by
					//  self.handleResult() or self.handleError()

                    if (json.response) {
						// Copy metadata fields to the Operation object
						for (prop in json.response.metadata) {
							self[prop] = json.response.metadata[prop]
						}
						
						// Copy the result to the Operation object result field
						for (prop in json.response) {
							self[prop] = json.response[prop];
						}
						
						self.info("requestId:", self.requestId)
                        self.info("status:", self.status);

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
                        self.errorDetail = "apsdb client: bad response from apsdb or communication error"
                        self.debug("errorDetail", self.errorDetail);
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


