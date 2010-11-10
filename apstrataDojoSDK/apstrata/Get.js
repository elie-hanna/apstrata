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

dojo.provide("apstrata.Get");

dojo.require ("dojo.io.script");
dojo.require ("apstrata.Operation");

/**
 * Base class used as an abstract class for all other APIs
 * @class apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.Get",
[apstrata.Operation],
	{
		//
		// Constants
		//
		_TYPE_STRING: "string",
        /**
         * @constructor Get Sets the logger
         */
        constructor: function() {
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

			self.log.info("Operation", self.apsdbOperation);
			self.log.debug("GET", self.url);

			// Since the hack for JSONP doesn't really allow for communication errors to be caught,
			//  we're using a timeout event to provide an error message if an operation takes too long to execute
			self._setTimeout()

			// in case the externally published function fails log the error and continue with the actual call
			try {
				dojo.publish("/apstrata/operation", [{
						id: self.operationId,
						method: 'GET',
						type: "message", 
						url: self.url,
						message: self.url
				}])
			} catch (err) {
				self.log.error("error in GET", err);				
			}

			dojo.io.script.get({ 
				url: self.url,
				callbackParamName : "apsws.jc",
				load: function(json) {

					self.responseTime = (new Date().getTime()) - timestamp;
	
						self.log.debug("response object", json);
						self.log.debug("response time (ms)", self.responseTime);
						if (self.operationAborted) self.log.debug("GET Aborted");
						if (self.operationTimeout) self.log.error("GET Timed out");
	
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
						self.response = json.response
						
						self.log.info("requestId:", json.response.metadata.requestId)
                        self.log.info("status:", json.response.metadata.status);

                        if (json.response.metadata.status==self._SUCCESS) {
                            self.handleResult();
                        } else {
                            self.handleError();
                        }
                    } else {
						self.response = {}
                        self.response.metadata.status = "failure";
                        self.response.metadata.errorCode = "CLIENT_BAD_RESPONSE"
                        self.response.metadata.errorMessage = "apsdb client: bad response from apsdb or communication error"
                        self.log.debug("errorDetail:", self.response.metadata.errorDetail);
                        self.handleError();                                        
                    }

					dojo.publish("/apstrata/operation", [{
							id: self.operationId,
							method: 'GET',
							type: "message",
							success: json.response.metadata.status,
							response: dojo.toJson(json),
							message: dojo.toJson(json)
					}])


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


