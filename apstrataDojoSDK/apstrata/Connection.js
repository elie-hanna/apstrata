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
dojo.provide("apstrata.Connection")

dojo.require("apstrata.URLSignerMD5")

dojo.declare("apstrata.Connection",
	null,
	{
		constructor: function(attrs) {
			this._DEFAULT_SERVICE_URL= "http://apsdb.apstrata.com/sandbox-apsdb/rest"
			this.timeout = 10000
			this.serviceUrl= this._DEFAULT_SERVICE_URL
			this.defaultStore = ""
			this.credentials= {key: "", secret: "", username: "", password: ""}
			this._urlSigner = new apstrata.URLSignerMD5()				

			if (attrs) {
				if (attrs.timeout) this.timeout =  attrs.timeout
				if (attrs.serviceUrl) this.serviceUrl = attrs.serviceUrl
				if (attrs.defaultStore) this.defaultStore = attrs.defaultStore
			} 

			if (attrs && attrs.credentials) {
				this.credentials.key = attrs.credentials.key
				this.credentials.secret = attrs.credentials.secret
				this.credentials.username = attrs.credentials.username
				this.credentials.password = attrs.credentials.password
			} else if (apstrata.apConfig) {
				this.credentials.key = apstrata.apConfig.key
				this.credentials.secret = apstrata.apConfig.secret
				this.credentials.username = apstrata.apConfig.username
				this.credentials.password = apstrata.apConfig.password
			}
		},
		
		signUrl: function(operation, params, responseType) {
			return this._urlSigner.sign(this, operation, params, responseType)
		},

		hasCredentials: function() {
			// Assume that we have a session if either the secret or password are present
			return ((this.credentials.secret != undefined) && (this.credentials.secret != null) && (this.credentials.secret != "")) 
					|| ((this.credentials.password != undefined) && (this.credentials.password != null) && (this.credentials.password != "")) 
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
					self.credentials.pw=""

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
			this.credentials.key=""
			this.credentials.username=""
			
			// Make sure key/username are not null/undefined
//			if (!this.credentials.key) this.credentials.key=""
//			if (!this.credentials.username) this.credentials.username=""

			this.save()

			dojo.publish("/apstrata/connection/logout", [{
				key: self.credentials.key
			}])
		}
		
	});
	
