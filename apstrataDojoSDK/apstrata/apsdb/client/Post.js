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
		execute: function() {
			var self = this;
			
			// Send debug information to connection object, could be used later to identify problems
			self.log("Operation", self.apsdbOperation);
		
			var timestamp = new Date().getTime();
    
			// Since the hack for JSONP doesn't really allow for communication errors to be caught,
			//  we're using a timeout event to provide an error message if an operation takes too long to execute
			self._setTimeout()

			self.url = self.buildActionUrl()

			// pass in all of the parameters manually:
			dojo.io.iframe.send({
				// The target URL on your webserver:
				url: self.url,
				
				// The HTTP method to use:
				method: "POST",
				
				form: dojo.byId(self.request.apsdb.formId),
				
				// the content to submit:
				content: self.buildRequestObject(),
				
				// The used data format:
				handleAs: "xml",
				
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
					self.log(self._LOGGER.DEBUG, "Aborted", self.operationAborted);
					self.log(self._LOGGER.DEBUG, "Timed out", self.operationTimeout);

                    self.status = "success"
					
					self.handleResult()

					// return the response for succeeding callbacks
					return response;
				},
				
				// Callback on errors:
				error: function(response, ioArgs){
					console.debug(response);
					
					// return the response for succeeding callbacks
					return response;
				}
			})
		}
})