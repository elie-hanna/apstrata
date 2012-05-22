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
dojo.provide("apstrata.sdk.CompactClient")

dojo.require("dojo.io.script")
dojo.require('dojox.encoding.digests.MD5')

dojo.declare("apstrata.sdk.CompactClient", null, {
	
	//
	// Constants
	//
	_FAILURE: "failure",
	_SUCCESS: "success",
	_DEFAULT_URL: "https://sandbox.apstrata.com/apsdb/rest",
	_DEFAULT_TIMEOUTE: 10000,
	_LOGIN_TYPE_USER: "user",
	_LOGIN_TYPE_MASTER: "master",
	
	/**
	 * 
	 */
	constructor: function(options) {
		this.timeout = this._DEFAULT_TIMEOUT
		this.serviceUrl= this._DEFAULT_URL
		this.force200Status = true
		this.defaultStore = ""
		this.credentials = { key: "", secret: "", username: "", password: "" }
		this.loginType = this._LOGIN_TYPE_USER

		// see if any specific config params are available in options and use them
		//  config params in options here take precedence
		if (options) {
			for (key in options) {
				this[key] = options[key]
			}
		} 
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
	get: function(operation, requestParams) {
		var self = this;

		this.operation = operation
		this.deferred = new dojo.Deferred()
		
		self.timestamp = new Date().getTime()
		var sign = self.sign(operation, dojo.objectToQuery(requestParams))
		self.url = sign.url
		self.signature = sign.signature
		
		self._setTimeout()
		
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

		console.groupCollapsed("apstrata."+this.operation+" [success] signature: "+ this.signature)
		console.info("response:\n" + dojo.toJson(json.response, true))
		console.dir(json)
		console.groupEnd()

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
                this.deferred.resolve(this)
            } else {
                this.deferred.reject(this)
            }
        } else {
			dojo.setObject("this.response.metadata", {})
            this.response.metadata.status = self._FAILURE
            this.response.metadata.errorCode = "CLIENT_BAD_RESPONSE"
            this.response.metadata.errorMessage = "apstrata SDK client: bad response from apstrata or communication error"

            this.deferred.reject(this)
        }
	},
	
	_setTimeout: function() {
		if (this.timeout>0) {
			this._timeoutHandler = setTimeout (dojo.hitch(this, "_timeout"), this.timeout);
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
		
		console.warn("apstrata."+this.operation+" [timeout or communication error]\nsignature: "+ this.signature)

		this.operationTimeout = true;
		
		dojo.setObject("this.response.metadata", {})
		this.response = {}
		this.response.metadata = {}
		this.response.metadata.errorCode = "timeout_communication_error";
		this.response.metadata.errorDetail = "Timeout or communication error";
		this.responseTime = this.timeout
		
		self.deferred.reject(self)
	},

	/**
	 * 
	 * @param {string} 	operation		name of apstrata action i.e.: SaveDocument, VerifyCredentials 
	 * @param {string} 	requestParams	request params of the call to be signed
	 * @param {string} 	responseType	either "jsoncdp" or "json"
	 * 
	 * @returns {string} signed URL to be used for apstrata call
	 * 
	 * @function
	 */	
	sign: function (operation, requestParams, responseType) {
		var timestamp = new Date().getTime() + '';

		var responseType = responseType || "json"
		
		var signature = '';
		var user = '';
		var valueToHash = '';
		
		if (this.loginType == this._LOGIN_TYPE_USER) {
			valueToHash = timestamp + this.credentials.user + operation + dojox.encoding.digests.MD5(this.credentials.password, dojox.encoding.digests.outputTypes.Hex).toUpperCase()
			signature = dojox.encoding.digests.MD5(valueToHash, dojox.encoding.digests.outputTypes.Hex)
			user = this.credentials.user
		} else {
			valueToHash = timestamp + this.credentials.key + operation + this.credentials.secret
			signature = dojox.encoding.digests.MD5(valueToHash, dojox.encoding.digests.outputTypes.Hex)
		}

		var url = this.serviceUrl
				+ "/" + this.credentials.key
				+ "/" + operation
				+ "?apsws.time=" + timestamp
				+ ((signature!="")?"&apsws.authSig=":"") + signature
				+ ((user!="")?"&apsws.user=":"") + user
				+ "&apsws.responseType=" + responseType
				+ "&apsws.authMode=simple"
				+ ((requestParams!="")?"&":"") + requestParams
				
		return {url: url, signature: signature}
	}
})
