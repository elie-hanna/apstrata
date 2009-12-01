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
dojo.provide("apstrata.StickyConnection")

dojo.require("apstrata.Client")
dojo.require("dojo.cookie")

dojo.declare("apstrata.StickyConnection",
	[apstrata.Connection],
	{
		_COOKIE_NAME: "apstrata.client",
		_COOKIE_EXPIRY: 15,
		
		constructor: function(attrs) {
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
			} else this.load()
		},
		
		load: function() {
			var self = this
			var json = dojo.cookie(this._COOKIE_NAME /* TODO: add a URL prefix */)
			
			if (json) {
				var o = dojo.fromJson(json) 
				
				apstrata.logger.info("Loaded connection from cookie", o)

				if (o.credentials) {
					// In case the cookie is corrupted
					if (!o.credentials.key) o.credentials.key=""
					if (!o.credentials.secret) o.credentials.secret=""
					if (!o.credentials.username) o.credentials.username=""
					if (!o.credentials.password) o.credentials.password=""
				}

				this.credentials = o.credentials
				if (o.serviceUrl) this.serviceUrl = o.serviceUrl
				if (o.defaultStore) this.defaultStore = o.defaultStore
				

				if (o.credentials.key && o.credentials.secret) {
					dojo.publish("/apstrata/connection/login/success", [{
						key: self.credentials.key,
					}])					
				} else if (o.credentials.key && o.credentials.username && o.credentials.password) {
					dojo.publish("/apstrata/connection/login/success", [{
						key: self.credentials.key,
						username: self.credentials.username
					}])					
				}
				
				apstrata.logger.log("debug", "apstrata.StickyConnection" ,"Credentials set to:", this.credentials)

				apstrata.logger.info("Credentials set to:", this.credentials)
				apstrata.logger.info("ServiceUrl:", this.serviceUrl)
				apstrata.logger.info("defaultStore:", this.defaultStore)
			}
		},
		
		save: function() {
			var o = {}
			o.credentials = this.credentials
			
			dojo.cookie(this._COOKIE_NAME /* TODO: add a URL prefix */, dojo.toJson(o), {expires: this._COOKIE_EXPIRY})			
		},
		
		eraseCookie: function() {
			
		},

		hasCredentials: function() {
			// Assume that we have a session if either the secret or password are present
			return ((this.credentials.secret != undefined) && (this.credentials.secret != null) && (this.credentials.secret != "")) 
					|| ((this.credentials.password != undefined) && (this.credentials.password != null) && (this.credentials.password != "")) 
		},
		
	    /**
	     * @function getAccountId returns the account identifier (key) for master login or (username) for user logins
	     * 
	     */
		getAccountId: function() {
			if (this.credentials.password && this.credentials.password!="") return this.credentials.username
			if (this.credentials.secret && this.credentials.secret!="") return this.credentials.key
			return ""
		},
		
		getLoginType: function() {
			if (this.credentials.password && this.credentials.password!="") return this.LOGIN_USER
			if (this.credentials.secret && this.credentials.secret!="") return this.LOGIN_MASTER
			return undefined			
		},
		
		loginUser: function(handlers) {
			var self = this
			
			// todo: implement credentials checking, by calling ListStores
			//  possible return codes
			//  INVALID_AUTHENTICATION_KEY
			//  INVALID_USER
			//  PERMISSION_DENIED means credentials valid
			
			if (this.credentials.username 
			&& (this.credentials.username!="") 
			&& this.credentials.key 
			&& (this.credentials.key!="")) {
				dojo.publish("/apstrata/connection/login/success", [{
					key: self.credentials.key,
					username: self.credentials.username
				}])
	
				if (handlers.success) handlers.success()
			} else {
				dojo.publish("/apstrata/connection/login/failure", [{
					key: self.credentials.key
				}])

				if (handlers.failure) handlers.failure("key and username are missing", "key and username are missing")
			}

		},
		
		loginMaster: function(handlers) {
			var self = this
			
			self._ongoingLogin = true
			apstrata.logger.debug("logging in: attemting ListStores to apstrata to validate credentials")
			
			var client = new apstrata.Client({connection: self})
			
			client.call({
				action: "ListStores",
				load: function(operation) {
					self._ongoingLogin = false
					apstrata.logger.debug("logging in: saving credentials to cookie")
					self.save()
	
					dojo.publish("/apstrata/connection/login/success", [{
						key: self.credentials.key
					}])

					if (handlers.success) handlers.success()
				},
				error: function(operation) {
					// Clear the secret and password so hasCredentials() functions
					self.credentials.secret=""
					self.credentials.pw=""

					dojo.publish("/apstrata/connection/login/failure", [{
						key: self.credentials.key
					}])

					if (handlers.failure) handlers.failure(operation.response.metadata.errorCode, operation.response.metadata.errorMessage)
				}
			})
		},

		logout: function() {
			var self = this
			apstrata.logger.debug("logging out: erasing credentials from cookie")

			// Erase secret and password
			this.credentials.secret = ""
			this.credentials.password = ""
			
			// Make sure key/username are not null/undefined
			if (!this.credentials.key) this.credentials.key=""
			if (!this.credentials.username) this.credentials.username=""

			this.save()

			dojo.publish("/apstrata/connection/logout", [{
				key: self.credentials.key
			}])
		},

	});
	
