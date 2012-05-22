/*******************************************************************************
 *  Copyright 2009-2012 Apstrata
 *  
 *  This file is part of Apstrata SDK
 *  
 *  Apstrata SDK is free software: you can redistribute it
 *  and/or modify it under the terms of the GNU Lesser General Public License as
 *  published by the Free Software Foundation, either version 3 of the License,
 *  or (at your option) any later version.
 *  
 *  Apstrata SDK is distributed in the hope that it will be
 *  useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *  
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with Apstrata SDK.  If not, see <http://www.gnu.org/licenses/>.
 * *****************************************************************************
 */
dojo.provide("apstrata.sdk.Client")

dojo.require("apstrata.sdk.Connection")
dojo.require("dojo.io.script")
dojo.require("dojo.io.iframe")

dojo.declare("apstrata.sdk.Client", null, {
	
	//
	// Constants
	//
	_FAILURE: "failure",
	_SUCCESS: "success",
	
	/**
	 * 
	 * @param {apstrata.Connection} connection 	Connection object used for the call 
	 */
	constructor: function(connection) {
		this.connection = connection	
	},
	
	//
	// Actions
	//
 
 	/**
	 * 
	 * @param {string} operation 	name of the apstrata action
	 * @param {object} callParams 	call params sent to apstrata 
	 *
	 * @constructs
	 */
	get: function(operation, requestParams, options) {
		var self = this;

		this.operation = operation
		this.deferred = new dojo.Deferred()
		
		self.timestamp = new Date().getTime()
		var sign = self.connection.sign(operation, dojo.objectToQuery(requestParams))
		self.url = sign.url
		self.signature = sign.signature
		
		// Since the hack for JSONP doesn't really allow for communication errors to be caught,
		//  we're using a timeout event to provide an error message if an operation takes too long to execute
		if (options && options.timeout) self._setTimeout(options.timeout); else self._setTimeout()
		
		this._publish({
			method: "GET",
			timestamp: self.timestamp,
			url: self.url,
			type: "request"
		})
		
		console.groupCollapsed("apstrata."+operation+" [GET] signature: "+ this.signature)
		console.info("url: " + self.url)
		console.groupEnd()
		
		dojo.io.script.get({
			url: self.url,
			callbackParamName: "apsws.jc",
			load: function(json) {
				self._load(json)
			}
		})
		
		return this.deferred
	},
	
	/**
	 * 
	 * @param {string} operation			apstrata action name
	 * @param {Object} requestParams		js object with request params including those with "apsdb" prefix
	 * @param {Object} formNode				optional HTML form 
	 * @param {number} options.timeout		optional specific timeout for this call
	 * @param {number} options.redirectHref optional different PostIframeHandler URL 
	 */
	post: function(operation, requestParams, formNode, options) {
		var self = this
		
		this.operation = operation
		this.deferred = new dojo.Deferred()
			
		self.timestamp = new Date().getTime()

			// This is a temporary fix for the P3P compact policy IE (should be removed asap) 
//			if (operation == "RunScript" && requestParams["apsdb.scriptName"] == "VerifyCredentials" && (requestParams["apsdb.action"] == "renew" || requestParams["apsdb.action"] == "generate")) {
//				requestParams["renewCallback"] = requestParams.apsws.callback;
//				requestParams["renewRedirectHref"] = requestParams.apsws.redirectHref;
//			}



		// Since the hack for JSONP doesn't really allow for communication errors to be caught,
		//  we're using a timeout event to provide an error message if an operation takes too long to execute
		if (options && options.timeout) self._setTimeout(options.timeout); else self._setTimeout()

		var sign = self.connection.sign(operation, dojo.objectToQuery(requestParams), "jsoncdp")
		self.url = sign.url
		self.signature = sign.signature

		// Create formNode dynamically if not provided, because dojo.io.iframe.send will fail otherwise
		if (!formNode) {
			if (dojo.byId("apstrataSDKEmptyForm")) {
				dojo.byId("apstrataSDKEmptyForm").parentNode.removeChild(dojo.byId("apstrataSDKEmptyForm"))
			}

//			if (!dojo.byId("apstrataSDKEmptyForm")) {
				formNode = dojo.create('form', {id: "apstrataSDKEmptyForm", method: "post", enctype: "multipart/form-data"})
				dojo.place(formNode, dojo.body())
//			}
		}

		if (options && options.redirectHref) requestParams["apsws.redirectHref"] = options.redirectHref;
		else requestParams["apsws.redirectHref"] = apstrata.baseUrl + "/PostIframeHandler.html"
		requestParams["apsws.callback"] = "apstrataSaveDocumentCallback" + self.timestamp

		var callAttrs = {
			url: self.url,
			method: "post",
			form: formNode,
			content: requestParams,
			handleAs: "html"
		}

		// ADD a dynamic callback that will be invoked by the code in PostIframeHandler.html
		//	when a response is received
		window[requestParams["apsws.callback"]] = function(jsonStr) {
			var jsonObj = dojo.fromJson(jsonStr);
			self._load(jsonObj)
		} 

		console.groupCollapsed("apstrata."+operation+" [POST] signature: " + this.signature)
		console.info("url:\n" + self.url)
		console.info("request params:\n" + dojo.toJson(requestParams, true))
		console.groupEnd()

		this._publish({
			method: "POST",
			timestamp: self.timestamp,
			url: self.url,
			type: "request"
		})

		// pass in all of the parameters manually:
		dojo.io.iframe.send(callAttrs)

		return this.deferred
	},
	
	call: function(operation, requestParams, formNode, options) {
		var client = new apstrata.sdk.Client(this.connection)

		if (options && options.method && options.method.toLowerCase() == "get") {
			return client.get(operation, requestParams, options)
		} else {
			return client.post(operation, requestParams, formNode, options)
		}
	},

   /**
     * @function abort Abort the operation
     */
	abort: function() {
		// Clear the timeout if the operation is aborted
		if (this._timeoutHandler) {
			this._clearTimeout (this._timeoutHandler);
			console.warn("abort apstrata operation, url:" + self.url)
		}
		
		this._operationAborted = true;
	},
	
	//
	// Private methods
	//
	
	/**
	 * Gets called on succesful apstrata call
	 * 
	 * @param {Object} json java script object returned from the apstrata call
	 */
	_load: function(json) {
		var self = this
		
		// Clear the timeout handler since we go the response
		this._clearTimeout()

		this._publish({
			url: self.url,
			timestamp: self.timestamp,
			type: "response",
			success: json.response.metadata.status
		})
		
		// we can't do a real abort or timeout operation
		//  we're just using a flag to artificially ignore the result if the user requests an abort
		//  or if after a timeout, a response was received anyway
		if (self._operationAborted || self.operationTimeout) return

		// extra debug related data
		self.rawResponse = dojo.toJson(json, true)
		self.responseTime = (new Date().getTime()) - self.timestamp;

        if (json.response) {
			self.response = json.response

            if (json.response.metadata.status==self._SUCCESS) { 
				console.groupCollapsed("apstrata."+this.operation+" [success] signature: "+ this.signature)
				console.info("response time: " + (new Date().getTime() - self.timestamp) + "ms")
				console.info("response:\n" + dojo.toJson(json.response, true))
				console.dir(json)
				console.groupEnd()

				try {
	                this.deferred.resolve(self.response, this)
				} catch (e) {
					console.exception(e)
				}
            } else {
				console.groupCollapsed("apstrata."+this.operation+" [failure] signature: "+ this.signature)
				console.warn("response time: " + (new Date().getTime() - self.timestamp) + "ms")
				console.warn("response:\n" + dojo.toJson(json.response, true))
				console.dir(json)
				console.groupEnd()

				try {
	                this.deferred.reject(self.response, this)
				} catch (e) {
					console.exception(e)
				}
            }
        } else {
			dojo.setObject("this.response.metadata", {})
            this.response.metadata.status = self._FAILURE
            this.response.metadata.errorCode = "CLIENT_BAD_RESPONSE"
            this.response.metadata.errorMessage = "apstrata SDK client: bad response from apstrata or communication error"

            this.deferred.reject(null, this)
        }
	},
	
	_setTimeout: function(timeout) {
		if (timeout) {
			this._timeoutHandler = setTimeout(dojo.hitch(this, "_timeout"), timeout)
		} else if (this.connection.timeout > 0) {
			this._timeoutHandler = setTimeout(dojo.hitch(this, "_timeout"), this.connection.timeout);
		}
	},
	
	_clearTimeout: function() {
		if (this._timeoutHandler) {
			clearTimeout (this._timeoutHandler);
			this._timeoutHandler = 0;
		}
	},

	_timeout: function(){
		var self = this

		this._publish({
			url: self.url,
			timestamp: self.timestamp,
			type: "timeout"			
		})
		
		console.warn("apstrata."+this.operation+" [timeout or communication error]\nsignature: "+ this.signature)

		this.operationTimeout = true;
		
		dojo.setObject("this.response.metadata", {})
		this.response = {}
		this.response.metadata = {}
		this.response.metadata.errorCode = "timeout_communication_error";
		this.response.metadata.errorDetail = "Timeout or communication error";
		this.responseTime = this.connection.timeout
		
		self.deferred.reject(self)
	},
	
	_publish: function(message) {
		try {
			dojo.publish("/apstrata/client", [message])			
		} catch (err) {
			console.exception(err)
		}
	}	
})
