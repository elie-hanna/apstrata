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
dojo.provide('apstrata.StickyConnection');

dojo.require('apstrata.Client');
dojo.require('dojo.cookie');

dojo.declare("apstrata.StickyConnection",
	[apstrata.Connection],
	{
		_COOKIE_NAME: "apstrata.client",
		_COOKIE_EXPIRY: 15,
		
		constructor: function(attrs) {
			// If credentials are not passed in constructor OR into apConfig, load from cookie
			if (!((attrs && attrs.credentials) || apstrata.apConfig)) this.load()
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

				this.credentials = o.credentials;

				// Set credentials in this connection object as well as the global apConfig attribute.
				if (o.serviceUrl) {
					this.serviceUrl = o.serviceUrl;
					apstrata.apConfig.config.serviceUrl = o.serviceUrl;
				}
				if (o.defaultStore) {
					this.defaultStore = o.defaultStore;
					apstrata.apConfig.config.defaultStore = o.defaultStore;
				}
				if (!apstrata.apConfig) {
					// Create empty apConfig and config objects if they are empty.
					apstrata.apConfig = {};
					apstrata.apConfig.config = {};
				}
				if (o.timeout)
					apstrata.apConfig.config.timeout = o.timeout;

				// Set the loaded configuration settings on the global apConfig attribute.
				apstrata.apConfig.config.key = o.credentials.key;
				apstrata.apConfig.config.secret = o.credentials.secret;
				apstrata.apConfig.config.username = o.credentials.username;
				apstrata.apConfig.config.password = o.credentials.password;

				apstrata.logger.log("debug", "apstrata.StickyConnection" ,"Credentials set to:", this.credentials)

				apstrata.logger.info("Credentials set to:", this.credentials)
				apstrata.logger.info("ServiceUrl:", this.serviceUrl)
				apstrata.logger.info("defaultStore:", this.defaultStore)
			}
		},
		
		save: function() {
			var o = {}
			o.credentials = this.credentials
			
			apstrata.logger.debug("Saving credentials to cookie.")
			
			dojo.cookie(this._COOKIE_NAME /* TODO: add a URL prefix */, dojo.toJson(o), {expires: this._COOKIE_EXPIRY, path: "/"})			
		},
		
		eraseCookie: function() {}
	});
	
