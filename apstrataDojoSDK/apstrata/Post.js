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

dojo.provide('apstrata.Post');

dojo.require('dojo.io.iframe');
dojo.require('dojox.encoding.digests.MD5');
dojo.require('apstrata.Operation');

/**
 * Base class used as an abstract class for all other APIs
 * @class apstrata.apsdb.client.Get
*/
dojo.declare("apstrata.Post",
[apstrata.Operation],
	{
		execute: function(attrs) {
			var self = this;
			
			this.request = attrs.request
			
			// Send debug information to connection object, could be used later to identify problems
			self.log.info("Operation", self.apsdbOperation);
		
			this.request.apsws = {}
			this.request.apsws.callback = "apstrataSaveDocumentCallback" + Math.floor(Math.random()*10000)

			if (attrs.redirectHref) this.request.apsws.redirectHref = attrs.redirectHref;
			else this.request.apsws.redirectHref = apstrata.baseUrl + "/resources/PostIframeHandler.html"
			// This is a temporary fix for the P3P compact policy IE (should be removed asap) 
			if (this.apsdbOperation == "RunScript" && this.request["apsdb.scriptName"] == "VerifyCredentials" && (this.request["apsdb.action"] == "renew" || this.request["apsdb.action"] == "generate")) {
				this.request["renewCallback"] = this.request.apsws.callback;
				this.request["renewRedirectHref"] = this.request.apsws.redirectHref;
			}


			// ADD a dynamic callback that will be invoked by the code in PostIframeHandler.html
			window[this.request.apsws.callback] = function(jsonObjj) {
				var jsonObj = dojo.fromJson(jsonObjj);
				self.responseTime = (new Date().getTime()) - self._timestamp
		
					self.log.info("response object", jsonObj);

					self.log.debug("response time (ms)", self.responseTime);
					if (self.operationAborted) self.log.debug("POST Aborted");
					if (self.operationTimeout) self.log.error("POST Timed out");
		
				// Clear the timeout since we received a response from apstrata
				self._clearTimeout();

                if (jsonObj.response) {
					self.response = jsonObj.response
					
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
                    self.response.metadata.errorDetail = "apsdb client: bad response from apsdb or communication error"
                    self.log.error("errorDetail", self.errorMessage);
                    self.handleError();                                        
                }
				
				dojo.publish("/apstrata/operation", [{
						id: self.operationId,
						method: 'POST',
						type: "message",
						success: self.response.metadata.status,
						response: dojo.toJson(self.response),
						message: dojo.toJson(self.response)
				}])
			} 

			self._timestamp = new Date().getTime();
    
			// Since the hack for JSONP doesn't really allow for communication errors to be caught,
			//  we're using a timeout event to provide an error message if an operation takes too long to execute
			self._setTimeout()

			// Force the response status to always be 200 even on error when we are on an IE browser, making a
			// POST request, and the connection configuration for this parameter is set to allow sending it.
			var isForce200ResponseStatus = false;
			if (dojo.isIE && self.connection.isForce200ResponseStatusOnPOSTRequestsInIE) {
				isForce200ResponseStatus = true;
			}
			self.url = self.buildActionUrl("jsoncdp", isForce200ResponseStatus)

			var message = self.url

			// 1. Attempt to use the form node from the attributes.
			var formNode = attrs.formNode;
			if (formNode) {
				if (dijit.byId(attrs.formNode.id)) {
					var fields = dijit.byId(attrs.formNode.id).getValues()
					message += "<br>" 
					for (k in fields) {
						message += "<br>" + k + ":" + fields[k] 
					}
				}
			}
			// 2. In case the attributes did not contain a form node, then use the generic form node because
			// dojo.io.iframe only makes a POST request when there is a form, otherwise, it makes a GET request.
			else {
				var formId = 'apstrataGenericForm';
				formNode = document.getElementById(formId);
				if (formNode == null) {
					formNode = document.createElement('FORM');
					formNode.method = "post";
					// TODO We might want the enctype to be configurable in the request, but multipart forms work with or without files.
					formNode.enctype = "multipart/form-data";
					formNode.id = formId;

					// We need to append the form to the document or it will not be valid.
					document.body.appendChild(formNode);
				}
			}
			
			// in case the externally published function fails log the error and continue with the actual call
			try {
				dojo.publish("/apstrata/operation", [{
						id: self.operationId,
						method: 'POST',
						type: "message", 
						url: self.url,
						message: message
				}])
			} catch (err) {
				self.log.error("error in POST", err);				
			}
			
			self.log.debug("action url", self.url)
			self.log.debug("request object", self.buildRequestObject())

			var callAttrs = {
				// The target URL on your webserver:
				url: self.url,
				
				// The HTTP method to use:
				method: "post",
				
				form: formNode,
				
//				content: attrs.fields,
				
				// the content to submit:
				content: self.buildRequestObject(),
				
				// The used data format:
				handleAs: "html",
				
				// Callback on successful call:
				load: function(response, ioArgs) {
					self.responseTime = (new Date().getTime()) - self._timestamp;
					//self.connection.registerConnectionTime(self.responseTime)
					self.log.info("response time (ms)", self.responseTime);

					// Clear the timeout since we received a response from apstrata.
					self._clearTimeout();

					// we can't do a real abort or timeout operation
					// we're just using a flag to artificially ignore the result if the user requests an abort
					// or if after a timeout, a response was received anyway
					if (self.operationAborted) self.log.info("Aborted", self.operationAborted);
					if (self.operationTimeout) self.log.warn("Timed out", self.operationTimeout);

					// Here we know that apstrata has responded
					// The callback will handle parsing the response and calling proper handlers
					if (self.response && self.response.metadata && self.response.metadata.status == 'success') {
						self.handleResult();
					} else {
						// Could only reach this point on IE and not on any other browser because we would have
						// forced the response status to be 200 even on a failed request.
						self.handleError();
					}
				},
				
				// Callback on errors. This function will NOT get called on IE since we force the response status to be 200 on IE.
				error: function(response, ioArgs){
					self.handleError();
					
					// return the response for succeeding callbacks
					return response;
				}
			}

			// pass in all of the parameters manually:
			dojo.io.iframe.send(callAttrs)
		}
})