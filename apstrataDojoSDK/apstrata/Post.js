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

 dojo.provide("apstrata.Post");

dojo.require ("dojo.io.iframe");
dojo.require ("dojox.encoding.digests.MD5");
dojo.require ("apstrata.Operation");

/**
 * Base class used as an abstract class for all other APIs
 * @class apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.Post",
[apstrata.Operation],
	{
		execute: function(attrs) {
			var self = this;
			
			// Send debug information to connection object, could be used later to identify problems
			self.log.info("Operation", self.apsdbOperation);
		
			this.request.apsws.callback = "apstrataSaveDocumentCallback" + Math.floor(Math.random()*10000)

			// ADD a dynamic callback that will be invoked by the code in PostIframeHandler.html
			window[this.request.apsws.callback] = function(jsonTxt) {
//console.debug(">>>>"+jsonTxt)				
				if (self.operationAborted || self.operationTimeout) return;

//				var jsonTxt = dojo.byId("dojoIoIframe").contentWindow.name

				self.log.info("raw response", jsonTxt);
				var json = dojo.fromJson(jsonTxt)

				self.log.info("response object", json);

                if (json.response) {
					self.response = json.response
					
					self.log.info("requestId", self.response.metadata.requestId)
                    self.log.info("status", self.response.metadata.status);

                    if (self.response.metadata.status==self._SUCCESS) {
                        self.handleResult();
                    } else {
                        self.handleError();
                    }
                } else {
					// TODO: test case for bad response
                    self.response.metadata.status = "failure";
                    self.response.metadata.errorCode = "CLIENT_BAD_RESPONSE"
                    self.response.metadata.errorMessage = "apsdb client: bad response from apsdb or communication error"
                    self.log.error("errorMessage", self.errorMessage);
                    self.handleError();                                        
                }
				
				//self.handleResult()
			} 

			var timestamp = new Date().getTime();
    
			// Since the hack for JSONP doesn't really allow for communication errors to be caught,
			//  we're using a timeout event to provide an error message if an operation takes too long to execute
			self._setTimeout()

			self.url = self.buildActionUrl("jsoncdp")
			
			self.log.debug("action url", self.url)
			self.log.debug("request object", self.buildRequestObject())

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
					self.log.info("response time (ms)", self.responseTime);
					
					// Clear the timeout since we received a response from apstrata
					self._clearTimeout();
					
					// we can't do a real abort or timeout operation
					//  we're just using a flag to artificially ignore the result if the user requests an abort
					//  or if after a timeout, a response was received anyway
					if (self.operationAborted) self.log.info("Aborted", self.operationAborted);
					if (self.operationTimeout) self.log.warn("Timed out", self.operationTimeout);
					
					// Here we know that apstrata has responded
					// The callback will handle parsing the response and calling proper handlers 

				},
				
				// Callback on errors:
				error: function(response, ioArgs){
					this.handleError()
					
					// return the response for succeeding callbacks
					return response;
				}
			})
		}
})