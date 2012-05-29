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
dojo.provide('apstrata.Connection');

dojo.require('apstrata.URLSignerMD5');
dojo.require('apstrata.Client');

dojo.declare('apstrata.Connection',
	null,
	{
		_DEFAULT_SERVICE_URL: "https://sandbox.apstrata.com/apsdb/rest",
		_DEFAULT_TIMEOUT: 10000,
		_IS_FORCE_200_RESPONSE_STATUS_ON_POST_REQUESTS_IN_IE: true,
		LOGIN_USER: "user",
		LOGIN_MASTER: "master",

		constructor: function(attrs) {
			this.timeout = this._DEFAULT_TIMEOUT;
			this.serviceUrl= this._DEFAULT_SERVICE_URL;
			this.isForce200ResponseStatusOnPOSTRequestsInIE = this._IS_FORCE_200_RESPONSE_STATUS_ON_POST_REQUESTS_IN_IE;
			this.defaultStore = "";
			this.credentials= { key: "", secret: "", username: "", password: "" };
			this._urlSigner = new apstrata.URLSignerMD5();

			if (attrs) {
				if (attrs.timeout) this.timeout =  attrs.timeout;
				if (attrs.serviceUrl) this.serviceUrl = attrs.serviceUrl;
				if (attrs.defaultStore) this.defaultStore = attrs.defaultStore;
			}

			// Set this connection's "isForce200ResponseStatusOnPOSTRequestsInIE" variable if it was set in the passed attributes or apConfig or apConfig.config.
			if (attrs && attrs.isForce200ResponseStatusOnPOSTRequestsInIE) {
				this.isForce200ResponseStatusOnPOSTRequestsInIE = attrs.isForce200ResponseStatusOnPOSTRequestsInIE;
			} else if (apstrata.apConfig) {
				var config = null;
				try {
					config = apstrata.apConfig.get();
				} catch (e) {
					// Do nothing.
				}

				// 1. Old way of setting the apConfig object.
				if (typeof apstrata.apConfig.isForce200ResponseStatusOnPOSTRequestsInIE != "undefined") {
					this.isForce200ResponseStatusOnPOSTRequestsInIE = apstrata.apConfig.isForce200ResponseStatusOnPOSTRequestsInIE;
				}
				// 2. New way of setting the apConfig object.
				else if (typeof config.isForce200ResponseStatusOnPOSTRequestsInIE != "undefined") {
					this.isForce200ResponseStatusOnPOSTRequestsInIE = config.isForce200ResponseStatusOnPOSTRequestsInIE;
				}
			}

			if (attrs && attrs.credentials) {
				this.credentials.key = attrs.credentials.key;
				this.credentials.secret = attrs.credentials.secret;
				this.credentials.username = attrs.credentials.username;
				this.credentials.password = attrs.credentials.password;
			} else if (apstrata.apConfig) {
				// 1. Old way of setting the apConfig object.
				if (apstrata.apConfig.key) this.credentials.key = apstrata.apConfig.key;
				if (apstrata.apConfig.secret) this.credentials.secret = apstrata.apConfig.secret;
				if (apstrata.apConfig.username) this.credentials.username = apstrata.apConfig.username;
				if (apstrata.apConfig.password) this.credentials.password = apstrata.apConfig.password;

				// 2. New way of setting the apConfig object.
				if (!this.credentials.key || !this.credentials.secret || !this.credentials.username || !this.credentials.password) {
					var config = apstrata.apConfig.get();
					if (!this.credentials.key && config.key) this.credentials.key = config.key;
					if (!this.credentials.secret && config.secret) this.credentials.secret = config.secret;
					if (!this.credentials.username && config.username) this.credentials.username = config.username;
					if (!this.credentials.password && config.password) this.credentials.password = config.password;
				}
			}

			if (attrs && !attrs.timeout && apstrata.apConfig) {
				this.timeout = apstrata.apConfig.timeout;
				if (!this.timeout) {
					var config = apstrata.apConfig.get();
					if (config.timeout) this.timeout = config.timeout;
				}
			}
		},
		
		signUrl: function(operation, params, responseType, isForce200ResponseStatus) {
			return this._urlSigner.sign(this, operation, params, responseType, isForce200ResponseStatus);
		},

		/**
		 * Please use the isLoggedIn method since credentials are not the only things that authenticate requests.
		 *
		 * @deprecated
		 */
		hasCredentials: function() {
			return this.isLoggedIn(); 
		},

		/**
		 * Returns true if this connection can make authenticated requests to apstratabase either with an account
		 * secret or with a user password.
		 */
		isLoggedIn: function () {
			// Assume that we have a session if either the secret or password are present.
			return ((this.credentials.secret != undefined) && (this.credentials.secret != null) && (this.credentials.secret != "")) 
				|| ((this.credentials.password != undefined) && (this.credentials.password != null) && (this.credentials.password != ""));
		},

		/**
		 * Used to check the validity of the connection. But in this, the base class, it will always return a status of "success".
		 */
		checkConnection: function () {
			return { "status": "success" };
		},
		
		setTimeout: function(timeout) {
			this.timeout = timeout
		},

		save: function() {},

		loginMaster: function(handlers) {
			this.login(handlers)
		},
		
		loginUser: function(handlers) {
			this.credentials.secret=""
			this.login(handlers)
		},

		login: function(handlers) {
			var self = this
			
			self._ongoingLogin = true
			apstrata.logger.debug("logging in: Calling VerifyCredentials to validate credentials")
			
			var client = new apstrata.Client({connection: self})
			
			client.call({
				action: "VerifyCredentials",
				load: function(operation) {
					self._ongoingLogin = false
					apstrata.logger.debug("logging in")
					self.save()
	
					dojo.publish("/apstrata/connection/login/success", [{
						key: self.credentials.key
					}])

					if (handlers && handlers.success) handlers.success()
				},
				error: function(operation) {
					// Clear the secret and password so hasCredentials() functions
					self.credentials.secret=""
					self.credentials.password=""

					dojo.publish("/apstrata/connection/login/failure", [{
						key: self.credentials.key
					}])

					if (handlers && handlers.failure) handlers.failure(operation.response.metadata.errorCode, operation.response.metadata.errorMessage)
				}
			})
		},

		logout: function() {
			var self = this
			apstrata.logger.debug("logging out")

			// Erase secret and password
			this.credentials.secret = ""
			this.credentials.password = ""
//			this.credentials.key=""
			this.credentials.username=""
			
			// Make sure key/username are not null/undefined
//			if (!this.credentials.key) this.credentials.key=""
//			if (!this.credentials.username) this.credentials.username=""

			this.save()

			dojo.publish("/apstrata/connection/logout", [{
				key: self.credentials.key
			}])
		},

		getLoginType: function() {
			if (this.credentials.password && this.credentials.password!="") return this.LOGIN_USER
			if (this.credentials.secret && this.credentials.secret!="") return this.LOGIN_MASTER
			return null			
		},

	    /**
	     * @function getAccountId returns the account identifier (key) for master login or (username) for user logins
	     */
		getAccountId: function() {
			if (this.getLoginType()==this.LOGIN_USER) return this.credentials.username;
			else if (this.getLoginType()==this.LOGIN_MASTER) return this.credentials.key;
			else return null
		}
	});
	
