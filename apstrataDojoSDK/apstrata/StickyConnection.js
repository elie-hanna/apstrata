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

dojo.declare("apstrata.StickyConnection",
	[apstrata.Connection],
	{
		constructor: function(attrs) {
		},

		hasCredentials: function() {
			// Assume that we have a session if either the secret or password are present
			return (this.credentials.secret != "") || (this.credentials.pw != "")
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

		login: function(handlers) {
			var self = this
			
			self._ongoingLogin = true
			this.debug("logging in: attemting ListStores to apstrata to validate credentials")
			
			var client = new apstrata.Client({connection: self})
			
			client.call({
				action: "ListStores",
				load: function(operation) {
					self._ongoingLogin = false
					self.debug("logging in: saving credentials to cookie")
//					self.saveToCookie()
	
					handlers.success()
				},
				error: function(operation) {
					// Clear the secret and password so hasCredentials() functions
					self.credentials.secret=""
					self.credentials.pw=""
					handlers.failure(operation.response.metadata.errorCode, operation.response.metadata.errorMessage)
				}
			})
		},

		logout: function() {
			this.debug("logging out: erasing credentials from cookie")

			// Erase secret and password
			this.credentials.secret = ""
			this.credentials.pw = ""
			
			// Make sure key/username are not null/undefined
			if (!this.credentials.key) this.credentials.key=""
			if (!this.credentials.username) this.credentials.username=""

//			this.saveToCookie()
		},

	});
	
