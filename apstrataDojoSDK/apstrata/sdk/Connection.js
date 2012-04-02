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
dojo.provide("apstrata.sdk.Connection")

dojo.require('dojox.encoding.digests.MD5')

dojo.declare("apstrata.sdk.Connection", null, {
	
	//
	// Constants
	//
	_DEFAULT_URL: "https://sandbox.apstrata.com/apsdb/rest",
	_DEFAULT_TIMEOUTE: 10000,
	_LOGIN_TYPE_USER: "user",
	_LOGIN_TYPE_MASTER: "master",
	
	
	
	/**
	 * Creates a new connection object needed to use apstrata.Client
	 * 
	 * @param {Object} 	options.credentials 
	 * @param {string} 	options.url
	 * @param {integer} options.timeout
	 * 
	 * @constructs
	 */
	constructor: function(options) {
		this.timeout = this._DEFAULT_TIMEOUT
		this.serviceUrl= this._DEFAULT_URL
		this.force200Status = true
		this.defaultStore = ""
		this.credentials = { key: "", secret: "", username: "", password: "" }
		this.loginType = this._LOGIN_TYPE_USER

		// see if any specific config params are available in global config object and use them
		if (apstrata.apConfig) {
			for (key in apstrata.apConfig) {
				this[key] = apstrata.apConfig[key]
			}
		}

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
	 * Authenticates user
	 * 
	 * @return {dojo.Deferred} 
	 * 
	 * @function
	 */
	login: function() {
		var self = this
		
		var client = new apstrata.sdk.Client(self)
		
		return client.get("VerifyCredentials", {})
		
		return deferred
	},
	
	/**
	 * Destroys session if present
	 * 
	 */
	logout: function() {
		
		return deferred
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
	},
	
	//
	// Getters
	//

	/**
	 *  returns account ID
	 *  
	 *  @return {object} account ID and login if present
	 */
	getAccountId: function() {
		var self = this
		return {account: self.credentials.key, login: self.credentials.user}
	},

	isAuthenticated: function() {
	}

	//
	// Private functions
	//
})

