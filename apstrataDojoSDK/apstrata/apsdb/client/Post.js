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

 dojo.provide("apstrata.apsdb.client.Post");

dojo.require ("dojo.io.iframe");
dojo.require ("dojox.encoding.digests.MD5");
dojo.require ("apstrata.apsdb.client.Operation");

/**
 * Base class used as an abstract class for all other APIs
 * @class apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.apsdb.client.Post",
[apstrata.apsdb.client.Operation],
	{
		execute: function(attrs) {
			var self = this;
			
			// Send debug information to connection object, could be used later to identify problems
			self.log("Operation", self.apsdbOperation);
		
			this.request.apsws.callback = "apstrataSaveDocumentCallback" + Math.floor(Math.random()*10000)

			// ADD a dynamic callback that will be invoked by the code in PostIframeHandler.html
			window[this.request.apsws.callback] = function(jsonTxt) {
console.debug(">>>>"+jsonTxt)				
				if (self.operationAborted || self.operationTimeout) return;

//				var jsonTxt = dojo.byId("dojoIoIframe").contentWindow.name

				self.log("raw response", jsonTxt);
				var json = dojo.fromJson(jsonTxt)

				self.log("response object", json);

                if (json.response) {
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
                    self.error("errorMessage", self.errorMessage);
                    self.handleError();                                        
                }
				
				self.handleResult()
			} 

			var timestamp = new Date().getTime();
    
			// Since the hack for JSONP doesn't really allow for communication errors to be caught,
			//  we're using a timeout event to provide an error message if an operation takes too long to execute
			self._setTimeout()

			self.url = self.buildActionUrl("jsoncdp")
			
			this.debug("action url", self.url)
			this.debug("request object", self.buildRequestObject())

			// pass in all of the parameters manually:
			dojo.io.iframe.send({
				// The target URL on your webserver:
				url: self.url,
				
				// The HTTP method to use:
				method: "POST",
				
				form: dojo.byId(attrs.formId),
				
				// the content to submit:
				content: self.buildRequestObject(),
				
				// The used data format:
				handleAs: "html",
				
				// Callback on successful call:
				load: function(response, ioArgs) {
					self.responseTime = (new Date().getTime()) - timestamp;
					self.connection.registerConnectionTime(self.responseTime)
					self.log("response time (ms)", self.responseTime);
					
					// Clear the timeout since we received a response from apstrata
					self._clearTimeout();
					
					// we can't do a real abort or timeout operation
					//  we're just using a flag to artificially ignore the result if the user requests an abort
					//  or if after a timeout, a response was received anyway
					self.info("Aborted", self.operationAborted);
					self.warn("Timed out", self.operationTimeout);
					
					// Here we know that apstrata has responded
					// The callback will handle parsing the response and calling proper handlers 

				},
				
				// Callback on errors:
				error: function(response, ioArgs){
console.debug(response);
					this.handleError()
					
					// return the response for succeeding callbacks
					return response;
				}
			})
		}
})