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
dojo.provide('apstrata.TokenConnection');

dojo.require('apstrata.Client');
dojo.require('apstrata.Connection');
dojo.require('dojo.cookie');

// TODO Review whether or not we should add a parameter to make the token be stored without the apstratabase cookie and instead, be stored in the client domain's cookie
dojo.declare("apstrata.TokenConnection",
	[apstrata.Connection],
	{
		_COOKIE_NAME: "apstrata.token.connection",
		_APPLICATION_DEFINED_AUTHENTICATION_SUCCESS_HANDLER: null,
		_APPLICATION_DEFINED_AUTHENTICATION_FAILURE_HANDLER: null,
		NOT_LOGGED_IN: "NOT_LOGGED_IN",
		PARAMETER_ACTION: "apsdb.action",
		PARAMETER_ACTION_VALUE_GENERATE: "generate",
		PARAMETER_ACTION_VALUE_RENEW: "renew",
		PARAMETER_USER: "apsws.user",
		PARAMETER_TIME: "apsws.time",
		PARAMETER_RESPONSE_TYPE: "apsws.responseType",
		PARAMETER_TOKEN_EXPIRES: "apsdb.tokenExpires",
		PARAMETER_TOKEN_LIFETIME: "apsdb.tokenLifetime",
		PARAMETER_TOKEN_IN_COOKIE: "apsdb.tokenInCookie",

		/**
		 * Creates a TokenConnection that allows the creation and automatic renewal of an Apstrata token
		 * as well as the mechanisms to use token-based authentication to authenticate Apstrata requests.
		 *
		 * @param attrs
		 * 			An object that can contain the credentials and token of the connection, the successful
		 * 			authentication handler, the failure authentication handler, the service URL, and the
		 * 			default store. eg.:<br>
		 * 			{
		 * 				"credentials": {
		 * 					"key": "value",
		 * 					"secret": "value",
		 * 					"username": "value",
		 * 					"password": "value"
		 * 				},
		 * 				"token": {
		 * 					"expires": "value",
		 * 					"lifetime": "value",
		 * 					"creationTime": "value"
		 * 				},
		 * 				"timeout": "value",,
		 * 				"serviceUrl": "value",
		 * 				"defaultStore": "value",
		 * 				"success": function () {},
		 * 				"failure": function () {}
		 * 			}<br>
		 * 			It is worth mentioning that the "secret" and "password" will not be used in this
		 * 			connection except in the "loginUser" method that uses the password that was passed
		 * 			to it instead of the one passed to the constructor.
		 */
		constructor: function (attrs) {
			var self = this;

			// 1. If credentials are passed to the constructor.
			var isTokenMetadataLoaded = false;
			if (attrs) {
				// 1a. Handle loading credentials.
				if (!attrs.credentials) {
					// 1a. Load connection credentials from the cookie if they exist there.
					self._loadCredentialsFromCookie();
				}
				// NOTE: Expecting that if the credentials are set in the attrs object, then the parent class
				// "Connection" has already set them in this object as part of its constructor.

				// 1b. Handle loading token.
				if (!attrs.token) {
					isTokenMetadataLoaded = self._loadTokenMetadataFromCookie();
				} else {
					self.token = {};
					self.token.expires = (!attrs.token.expires) ? "" : attrs.token.expires;
					self.token.lifetime = (!attrs.token.lifetime) ? "" : attrs.token.lifetime;
					self.token.creationTime = (!attrs.token.creationTime) ? "" : attrs.token.creationTime;
					isTokenMetadataLoaded = (self.token.expires != "" && self.token.lifetime != "" && self.token.creationTime != "") ? true : false;
				}

				// 1c. Handle setting the successful authentication handler if one is defined.
				if (attrs.success) {
					self._APPLICATION_DEFINED_AUTHENTICATION_SUCCESS_HANDLER = attrs.success;
				}

				// 1d. Handle setting the failure authentication handler if one is defined.
				if (attrs.failure) {
					self._APPLICATION_DEFINED_AUTHENTICATION_FAILURE_HANDLER = attrs.failure;
				}
			}
			// 2. If credentials are not passed to the constructor, then load from cookie.
			else {
				// 2a. Load connection credentials from the cookie if they exist there.
				self._loadCredentialsFromCookie();

				// 2b. Set a timer to attempt to renew the token after some time if the token settings were loaded from the cookie.
				isTokenMetadataLoaded = self._loadTokenMetadataFromCookie();
			}

			// 3. Set a timer to attempt to renew the token after some time if the token metadata was loaded.
			if (isTokenMetadataLoaded) {
				var renewTokenDelay = self._getRenewTokenDelay(self.token.expires, self.token.creationTime);
				setTimeout(function () { self.renewToken(); }, renewTokenDelay);
			
				// Broadcast that a successful authentication has happened after 1 second because the
				// connection object is usually loaded before other objects that might want to subscribe
				// to this channel.
				setTimeout(function () { self._publishSuccessfulAuthentication(); }, 1000);
			}

			// 4. Make sure that the global "apstrata" object's "apConfig" attribute is set and get the
			// service URL and the default store from it in case they were not set already.
			if (apstrata.apConfig) {
				// 4a. If we still don't have a service URL OR the service URL is the same as the default,
				// then try to set the one from the current "apConfig" in the global "apstrata" object.
				var config = apstrata.apConfig.get();
				if (self.serviceUrl == '' || (self.serviceUrl == self._DEFAULT_SERVICE_URL)) {
					// The service URL in the config has two different names "serviceUrl" and "serviceURL".
					if (config.serviceUrl)
						self.serviceUrl = config.serviceUrl;
					else if (config.serviceURL)
						self.serviceUrl = config.serviceURL;
				}

				// 4b. If we still don't have a default store, then try to set the one from the current apConfig.
				if (self.defaultStore == '') {
					self.defaultStore = config.defaultStore;
				}
			}
		},

		/**
		 * Returns true if this connection can make authenticated requests to apstratabase with a non-expired token.
		 */
		isLoggedIn: function () {
			var self = this;

			// 1. Refresh the token metatdata from the cookie and if the cookie doesn't exist, then the user is logged out.
			if (!self._loadTokenMetadataFromCookie()) {
				return false;
			}
			// 2. Calculate the token expiration time and compare it with the current time to see if it's expired.
			else {
				var time = new Date().getTime();
				var tokenExpiryTime = time + (self.token.expires * 1000);
				return (tokenExpiryTime > time);
			}
		},

		/**
		 * Instead of signing the request, expect that the token will be sent as a secure cookie in the request to the apstrata
		 * domain. The token will allows the request to be authenticated.
		 *
		 * @param operation The Apstrata API to be called, eg. "SaveDocument", "RunScript".
		 * @param params A URL query string containing URL parameters to be included in the returned URL. Must not start with "?".
		 * @param responseType A string that is expected to be either "xml" or "json".
		 * @param isForce200ResponseStatus Adds the "apsdb.force200ResponseStatus" parameter to the request with a value of "true".
		 *
		 * @return An object that has a "url" attribute, that is the URL to the Apstrata REST API, and an empty "signature" attribute.
		 */
		signUrl: function (operation, params, responseType, isForce200ResponseStatus) {
			var self = this;

			var timestamp = new Date().getTime() + "";
			responseType = responseType || "json";

			var username = "";
			if (self.credentials && self.credentials.username) {
				username = self.credentials.username;
			}

			var apswsReqUrl = self.serviceUrl
					+ "/" + self.credentials.key
					+ "/" + operation
					+ "?" + self.PARAMETER_TIME + "=" + timestamp
					+ "&" + self.PARAMETER_RESPONSE_TYPE + "=" + responseType
					+ ((username != "") ? "&" + self.PARAMETER_USER + "=" + username : "")
					+ ((isForce200ResponseStatus) ? "&apsdb.force200ResponseStatus=true" : "")
					+ ((params != "") ? "&" : "") + params;

			return { url: apswsReqUrl, signature: "" };
		},

		/**
		 * Login with user-based authentication.
		 *
		 * @param args
		 * 			An object that contains extra parameters to be sent to VerifyCredentials. Expected
		 * 			to be "apsdb.tokenExpires" and "apsdb.tokenLifetime" if the user-application wants
		 * 			to explicitly set those token values. It may also contain "success" and "failure"
		 * 			attributes that are functions to be called upon login success and failure respectively.
		 */
		loginUser: function (args) {
			this.credentials.secret = ""; // Unset the credentials secret, if it was set, to make the connection signing mechanism generate a user-based signature.
			this.login(args);
		},

		/**
		 * Calls VerifyCredentials to generate a token that will be used to verify all consecutive
		 * requests until it expires.
		 *
		 * @param args
		 * 			An object that contains extra parameters to be sent to VerifyCredentials. Expected
		 * 			to be "apsdb.tokenExpires" and "apsdb.tokenLifetime" if the user-application wants
		 * 			to explicitly set those token values. It may also contain "success" and "failure"
		 * 			attributes that are functions to be called upon login success and failure respectively.
		 */
		login: function (args) {
			var self = this;

			// 1. Make sure that this connection is not live and that the user is logged out before attempting to login.
			if (self.isLoggedIn()) {
				apstrata.logger.debug("User is already logged in");
				// Broadcast that a successful login has happened.
				self._publishSuccessfulAuthentication();

				// Call the user-application's login success handler function if one is defined.
				if (args && args.success)
					args.success();

				return;
			}

			apstrata.logger.debug("Logging in: Calling VerifyCredentials to validate credentials and generate a token.");

			// 2. Add the token-specific parameters to the VerifyCredentials call, then add any other parameters sent as
			// arguments to this method from the user's application.
			data = {};
			data[self.PARAMETER_ACTION] = self.PARAMETER_ACTION_VALUE_GENERATE;
			data[self.PARAMETER_TOKEN_IN_COOKIE] = "true";
			if (args && args.extraParameters)
				dojo.mixin(data, args.extraParameters);

			// 3. Create the Apstrata client and use a regular connection that will generate a signature
			// and verify the user's credentials instead of this one that will try to use a token.
			var connectionAttributes = { "credentials": self.credentials, "serviceUrl": self.serviceUrl };
			var authenticatingConnection = new apstrata.Connection(connectionAttributes);
			var client = new apstrata.Client({ "connection": authenticatingConnection });
			client.call({
				action: "VerifyCredentials",
				useHttpMethod: "POST",
				request: data,
				load: function (operation) {
					apstrata.logger.debug("Credentials verified");

					// 3a. Set the token data from the response.
					self.token = {};
					// Change the token expires and lifetime from seconds to future Date strings.
					var tokenExpires = operation.response.result[self.PARAMETER_TOKEN_EXPIRES];
					var tokenLifetime = operation.response.result[self.PARAMETER_TOKEN_LIFETIME];
					self.token.expires = tokenExpires;
					self.token.lifetime = tokenLifetime;
					self.token.creationTime = new Date().getTime();

					// 3b. Save the cookie without the password.
					self.credentials.password = "";
					self._saveCookie();

					// 3c. Set a timer to attempt to renew the token after half the expiration time passes.
					var renewTokenDelay = ((tokenExpires / 2) * 1000);
					setTimeout(function () { self.renewToken(); }, renewTokenDelay);

					// 3d. Broadcast that a successful login has happened.
					self._publishSuccessfulAuthentication();

					// 3e. Trigger the user-application's success function if one is defined and set
					// the success and failure handlers.
					if (args) {
						if (args.success)
							self._APPLICATION_DEFINED_AUTHENTICATION_SUCCESS_HANDLER = args.success;
						if (args.failure)
							self._APPLICATION_DEFINED_AUTHENTICATION_FAILURE_HANDLER = args.failure;
					}
					if (self._APPLICATION_DEFINED_AUTHENTICATION_SUCCESS_HANDLER) {
						self._APPLICATION_DEFINED_AUTHENTICATION_SUCCESS_HANDLER();
					}
				},
				error: function (operation) {
					// 3a. Clear the secret and password so hasCredentials() functions
					self.credentials.secret = "";
					self.credentials.password = "";

					// 3b. Broadcast that a failed login attempt has happened.
					self._publishFailureAuthentication();

					// 3c. Call the user-application's login failure handler function if one is defined.
					if (args && args.failure){
						args.failure(operation.response.metadata.errorCode, operation.response.metadata.errorMessage);
					} else if (self._APPLICATION_DEFINED_AUTHENTICATION_FAILURE_HANDLER) {
						self._APPLICATION_DEFINED_AUTHENTICATION_FAILURE_HANDLER(operation.response.metadata.errorCode, operation.response.metadata.errorMessage);
					}
				}
			});
		},

		/**
		 * Attempt to renew the current token if it is older than half the token expiration time,
		 * otherwise, set a timer to renew after some time.
		 */
		renewToken: function () {
			var self = this;

			// 1. Make sure that this connection is live and that the user is logged in before attempting to renew.
			if (!self.isLoggedIn()) {
				apstrata.logger.debug("User is not logged in");
				// Call the user-application's login failure handler function if one is defined.
				if (self._APPLICATION_DEFINED_AUTHENTICATION_FAILURE_HANDLER)
					self._APPLICATION_DEFINED_AUTHENTICATION_FAILURE_HANDLER(self.NOT_LOGGED_IN);

				return;
			}

			// 2. Calculate token age.
			var currentTime = new Date().getTime();
			var tokenAge = Math.round((currentTime - self.token.creationTime) / 1000);

			// 3a. Renew the token if it is older or as old as half the token expires time.
			if (tokenAge >= (self.token.expires / 2)) {
				apstrata.logger.debug("Logging in: Calling VerifyCredentials to renew a token.");

				// Add the token-specific parameters to the VerifyCredentials call.
				data = {};
				data[self.PARAMETER_ACTION] = self.PARAMETER_ACTION_VALUE_RENEW;

				// Create the Apstrata client that will verify the user's credentials.
				var client = new apstrata.Client({connection: self});
				client.call({
					action: "VerifyCredentials",
					useHttpMethod: "POST",
					request: data,
					load: function (operation) {
						apstrata.logger.debug("Token renewed");

						// 1. Set the token data from the response.
						self.token = {};
						// Change the token expires and lifetime from seconds to a future Date strings.
						var tokenExpires = operation.response.result[self.PARAMETER_TOKEN_EXPIRES];
						var tokenLifetime = operation.response.result[self.PARAMETER_TOKEN_LIFETIME];
						self.token.expires = tokenExpires;
						self.token.lifetime = tokenLifetime;
						self.token.creationTime = new Date().getTime();

						// 2. Save the cookie.
						self._saveCookie();

						// 3. Set a timer to attempt to renew the token after half the expiration time passes.
						var renewTokenDelay = ((tokenExpires / 2) * 1000);
						setTimeout(function () { self.renewToken(); }, renewTokenDelay);

						// 4. Broadcast that a successful login has happened.
						self._publishSuccessfulAuthentication();

						// 5. Trigger the user-application's success function if one is defined.
						if (self._APPLICATION_DEFINED_AUTHENTICATION_SUCCESS_HANDLER)
							self._APPLICATION_DEFINED_AUTHENTICATION_SUCCESS_HANDLER();
					},
					error: function (operation) {
						// 1. Delete the token.
						delete self.token;

						// 2. Broadcast that a failed login attempt has happened.
						self._publishFailureAuthentication();

						// 3. Call the user-application's login failure handler function if one is defined.
						if (self._APPLICATION_DEFINED_AUTHENTICATION_FAILURE_HANDLER) {
							self._APPLICATION_DEFINED_AUTHENTICATION_FAILURE_HANDLER(operation.response.metadata.errorCode, operation.response.metadata.errorMessage);
						}
					}
				});
			}
			// 3b. If the token is younger than half the token expires time, then set a timer to attempt to renew it
			// after the minimum between (half the token expires) and (90% of the token expires minus the token age),
			// i.e. min((tokenExpires/2), ((9/10) * tokenExpires) - tokenAge). The reason for this mechanism is to
			// check whether or not the token has already been renewed by another page.
			else {
				var renewTokenDelay = self._getRenewTokenDelay(self.token.expires, self.token.creationTime);
				setTimeout(function () { self.renewToken(); }, renewTokenDelay);
			}
		},

		/**
		 * Attempt to call the DeleteToken API to remove the current token and delete the token
		 * metadata cookie. It is expected that the apstrata secure-cookie that contains the token
		 * will be deleted automatically by a response header.
		 *
		 * @param args
		 * 			An object that contains "success" and "failure" attributes that are functions
		 * 			to be called upon login success and failure respectively.
		 */
		logout: function (args) {
			var self = this;

			// 1. Make sure that this connection is live and that the user is logged in before attempting to logout.
			if (!self.isLoggedIn()) {
				apstrata.logger.debug("User is already logged out");
				// Call the user-application's logout success handler function if one is defined.
				if (args && args.success)
					args.success();

				return;
			}

			// 2. Create the Apstrata client that will delete the user's token.
			apstrata.logger.debug("Logging out");
			var client = new apstrata.Client({connection: self});
			client.call({
				action: "DeleteToken",
				useHttpMethod: "POST",
				request: {},
				load: function (operation) {
					apstrata.logger.debug("Token deleted");

					// Cleanup the connection and its cookie.
					if (args && args.success) {
						self.close(args.success);
					} else {
						self.close();
					}
				},
				error: function (operation) {
					// 1a. Broadcast that a failed login attempt has happened.
					dojo.publish("/apstrata/connection/logout/failure", [{
						key: ((self.credentials && self.credentials.key) ? self.credentials.key : "")
					}]);

					// 1b. Call the user-application's login failure handler function if one is defined.
					if (args && args.failure)
						args.failure(operation.response.metadata.errorCode, operation.response.metadata.errorMessage);
				}
			});
		},

		/**
		 * Closes the connection by deleting the token metadata from it, as well as the cookie,
		 * then calls the successful-logout function if it is passed.
		 *
		 * @param successHandler A function to be called after the connection is closed.
		 */
		close: function (successHandler) {
			var self = this;

			// 1a. Delete the cookie.
			self.deleteCookie();

			// 1b. Delete this connection's token and empty the username.
			delete self.token;
			self.credentials.username = "";

			// 1c. Broadcast that a successful logout has happened.
			dojo.publish("/apstrata/connection/logout/success", [{
			}]);
//TODO The success and failure handlers r not set upon renew when the token is retrieved from the cookie. Make sure to check that a handler is set when
//the page is loaded and a token is retrieved from the cookie
			// 1d. Remove the defined authentication failure handler so that any future timers that
			// attempt to renew this token do not trigger this handler and silently fail to renew.
			self._APPLICATION_DEFINED_AUTHENTICATION_FAILURE_HANDLER = null;

			// 1e. Remove the defined authentication success handler so that future valid connections don't find it.
			self._APPLICATION_DEFINED_AUTHENTICATION_SUCCESS_HANDLER = null;

			// 1f. Trigger the user-application's success function if one is defined.
			if (successHandler)
				successHandler();
		},

		/**
		 * Set the function that will be called when this connection is unable to renew or generate the token.
		 * It is expected to only be called when the token is already in the cookie upon page load since the
		 * token will still need to be renewed and could fail to do so, meaning the failure handler still
		 * needs to get called.
		 *
		 * @param authenticationFailureHandlerFunction
		 * 			A function to be called upon failure to renew or generate token.
		 */
		setAuthenticationFailureHandler: function (authenticationFailureHandlerFunction) {
			this._APPLICATION_DEFINED_AUTHENTICATION_FAILURE_HANDLER = authenticationFailureHandlerFunction;
		},

		/**
		 * Only users can use token-based authentication.
		 */
		getLoginType: function () {
			return this.LOGIN_USER;
		},

		/**
		 * Get the Apstrata credentials from the Apstrata cookie if it exists.
		 */
		_loadCredentialsFromCookie: function () {
			var jsonStr = dojo.cookie(this._COOKIE_NAME);

			if (jsonStr) {
				// 1. Create the object from the cookie.
				var cookieObject = dojo.fromJson(jsonStr);
				apstrata.logger.info("Loaded connection from cookie", cookieObject);

				// 2. Make sure that the cookie is not corrupted and correct its values if it is.
				if (cookieObject.credentials) {
					if (!cookieObject.credentials.key) cookieObject.credentials.key = "";
					if (!cookieObject.credentials.username) cookieObject.credentials.username = "";
				}

				// 3. Set the connection credentials and metadata from the loaded cookie.
				this.credentials = cookieObject.credentials;
				if (cookieObject.serviceUrl) this.serviceUrl = cookieObject.serviceUrl;
				if (cookieObject.defaultStore) this.defaultStore = cookieObject.defaultStore;

				apstrata.apConfig.config.key = cookieObject.credentials.key;
				apstrata.apConfig.config.username = cookieObject.credentials.username;

				apstrata.logger.log("debug", "apstrata.TokenConnection", "Credentials set to:", this.credentials);

				apstrata.logger.info("Credentials set to:", this.credentials);
				apstrata.logger.info("ServiceUrl:", this.serviceUrl);
				apstrata.logger.info("defaultStore:", this.defaultStore);

				return true;
			} else {
				return false;
			}
		},

		/**
		 * Get the Apstrata token from the Apstrata cookie if it exists.
		 */
		_loadTokenMetadataFromCookie: function () {
			var jsonStr = dojo.cookie(this._COOKIE_NAME);

			if (jsonStr) {
				// 1. Create the object from the cookie.
				var cookieObject = dojo.fromJson(jsonStr);
				apstrata.logger.info("Loaded token from cookie", cookieObject);

				// 2. Make sure that the cookie is not corrupted and correct its values if it is.
				if (cookieObject.token) {
					if (!cookieObject.token.expires) cookieObject.token.expires = "";
					if (!cookieObject.token.lifetime) cookieObject.token.lifetime = "";
					if (!cookieObject.token.creationTime) cookieObject.token.creationTime = "";
				}

				// 3. Set the connection token metadata from the loaded cookie.
				this.token = cookieObject.token;

				apstrata.logger.log("debug", "apstrata.TokenConnection", "Token set to:", this.token);

				apstrata.logger.info("Token set to:", this.token);

				return true;
			} else {
				return false;
			}
		},

		/**
		 * Save the token and the credentials in a cookie. Expected to be called after credentials have
		 * been verified and a token is retrieved.
		 */
		_saveCookie: function () {
			var self = this;

			var cookieObject = {};
			cookieObject.credentials = self.credentials;
			cookieObject.serviceUrl = self.serviceUrl;
			cookieObject.defaultStore = self.defaultStore;
			cookieObject.token = self.token;

			apstrata.logger.debug("Saving credentials and token in a cookie.");

			dojo.cookie(self._COOKIE_NAME, dojo.toJson(cookieObject), { expires: self._fromSecondToDateString(self.token.expires), path: "/" });
		},

		/**
		 * Change the passed amount of seconds to a future Date string.
		 *
		 * @param seconds A number of seconds.
		 *
		 * @return A Date string representing the (current time + seconds).
		 */
		_fromSecondToDateString: function (seconds) {
			var time = new Date().getTime();
			return new Date(time + (seconds * 1000)).toString();
		},

		/**
		 * Delete the token and credentials cookie. Expected to be called on logout.
		 */
		deleteCookie: function () {
			dojo.cookie(this._COOKIE_NAME, null, { expires: -1, path: "/"});
		},

		/**
		 * Calculate the amount of time until the next renew request as follows:
		 * the minimum between (half the token expires) and (90% of the token expires minus the token age),
		 * i.e. min((tokenExpires/2), ((9/10) * tokenExpires) - tokenAge). The reason for this mechanism is to
		 * check whether or not the token has already been renewed by another page.
		 *
		 * @param expires The amount of time wherein the token is valid, in seconds.
		 * @param creationTime EPOC time since the token was created, in milliseconds.
		 *
		 * @return Time delay in milliseconds.
		 */
		_getRenewTokenDelay: function (expires, creationTime) {
			// Calculate token age.
			var currentTime = new Date().getTime();
			var tokenAge = Math.round((currentTime - creationTime) / 1000);

			// Calculate the renew-token delay.
			return (Math.min((expires / 2), (((9/10) * expires) - tokenAge)) * 1000);
		},

		/**
		 * Use dojo.publish to publish that a valid token is present, which means that this connection
		 * can make valid Apstrata calls.
		 */
		_publishSuccessfulAuthentication: function () {
			var self = this;
			dojo.publish("/apstrata/connection/login/success", [{
				key: self.credentials.key
			}]);
		},

		/**
		 * Use dojo.publish to publish that a token is either not present or could not be renewed,
		 * which means that this connection may or may not be able to make valid Apstrata calls.
		 * However, the token needs to be renewed.
		 */
		_publishFailureAuthentication: function () {
			var self = this;
			dojo.publish("/apstrata/connection/logout/success", [{
			}]);
		}
	});
