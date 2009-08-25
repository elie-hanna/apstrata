/*******************************************************************************
 *  Copyright 2009 apstrata
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *
 *  You may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0.html
 *  This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 *  CONDITIONS OF ANY KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations under the License.
 * *****************************************************************************
 */

dojo.provide("apstrata.apsdb.client.Connection")
//dojo.provide("apstrata.apsdb.client.URLSignerMD5")

dojo.require("dojox.encoding.digests.MD5");
dojo.require("dojo.cookie");

dojo.require("apstrata.apsdb.client.ListStores");
dojo.require("apstrata.util.logger.Loggable")

// An activity object is used by operations to register the sending of requests and
//  receipt of responses.
//  Activity will keep track of the first request and the last response to generate proper events
//  that can be trapped by the UI to indicate communication activity (start, stop) or errors (timeout)
dojo.declare("apstrata.apsdb.client.Activity",
	[apstrata.util.logger.Loggable],
	{
		constructor: function() {
			this.counter = 0;
			this.activity = {}
		},
		
		start: function(operation) {
			this.activity[operation.url] = operation
			this.counter++
			this.busy();
//			this.debug("active operations:", this.counter)
		},
		
		stop: function(operation) {
			if (this.activity[operation.url]!=undefined) {
				delete this.activity[operation.signature]
				this.counter--
			}
			
			if (this.counter==0) this.free() //setTimeout (dojo.hitch(this, "free"), 3000)  
//			this.debug("active operations:", this.counter)
		},
		
		timeout: function(operation) {
//			this.stop(operation)
		},
		
		busy: function() {},
		free: function() {}
	})


dojo.declare("apstrata.apsdb.client.URLSignerMD5", [], {	
	sign: function (connection, operation, params, responseType) {
					var timestamp = new Date().getTime() + '';
					
					responseType = responseType || "json"

					var valueToHash = timestamp + connection.credentials.key + operation + connection.credentials.secret
					var signature = dojox.encoding.digests.MD5(valueToHash, dojox.encoding.digests.outputTypes.Hex)
		
					var apswsReqUrl = connection.serviceUrl
							+ "?apsdb.action=" + operation
							+ "&apsws.time=" + timestamp
							+ "&apsws.authKey=" + connection.credentials.key
							+ "&apsws.authSig=" + signature
							+ "&apsws.responseType=" + responseType
							+ "&apsws.authMode=simple"
							+ ((params!="")?"&":"") + params
		
					return {url: apswsReqUrl, signature: signature};
			}
})


dojo.declare("apstrata.apsdb.client.Connection",
	[apstrata.util.logger.Loggable],
	{
		_KEY_APSDB_ID: "@key",
		_COOKIE_NAME: "apstrata.apsdb.client",
		_COOKIE_EXPIRY: 15,
		totalConnectionTime: 0,
		numberOfConnections: 0,
		statusWidget: null,
		
		constructor: function(attr) {
			var self = this
			
			this._DEFAULT_SERVICE_URL= "http://apsdb.apstrata.com/sandbox-apsdb/rest"
			this.timeout = 10000
			this.serviceUrl= this._DEFAULT_SERVICE_URL;
			this.credentials= {key: "", secret: "", un: "", pw: ""}
			this.defaultStore = ''
			this._ongoingLogin = false
			this._urlSigner = new apstrata.apsdb.client.URLSignerMD5()				

			this.activity= new apstrata.apsdb.client.Activity()

			if (attr) {
			/*
				if (attr.URLSigner) {
					this._urlSigner = attr.URLSigner
				}
			*/

				if (attr.statusWidget) {
					// TODO: this should be replaced by dynamic instantiation
					if (attr.statusWidget == "apstrata.apsdb.client.widgets.ConnectionStatus") {
						dojo.require("apstrata.apsdb.client.widgets.ConnectionStatus")
						var sw = new apstrata.apsdb.client.widgets.ConnectionStatus(self)
					}
				}
			} 
			
			this.loadFromCookie()

			if (apstrata.apConfig) {
				if (apstrata.apConfig.key != undefined) this.credentials.key = apstrata.apConfig.key
				if (apstrata.apConfig.secret != undefined) this.credentials.secret = apstrata.apConfig.secret
				if (apstrata.apConfig.defaultStore != undefined) this.defaultStore = apstrata.apConfig.defaultStore
				if (apstrata.apConfig.timeout != undefined) this.timeout =  apstrata.apConfig.timeout
				if (apstrata.apConfig.serviceURL != undefined) this.serviceUrl = apstrata.apConfig.serviceURL
			}


			// TODO: Investigate why this is not working: dojo.parser.instantiate
			/*
			if (attr!=undefined) {
				if (attr.statusWidget!=undefined) {
					dojo.require(attr.statusWidget)
					var sw = dojo.parser.instantiate(this, {dojoType: attr.statusWidget});
				}
			}
			*/

		},
		
		hasCredentials: function() {
			// Assume that we have a session if either the secret or password are present
			return (this.credentials.secret != "") || (this.credentials.pw != "")
		},

		registerConnectionTime: function(t) {
			this.numberOfConnections++
			this.totalConnectionTime += t
			this.averageConnectionTime = this.totalConnectionTime/this.numberOfConnections 

			this.debug("average connection time", this.averageConnectionTime)
		},

		signUrl: function(operation, params, responseType) {
			return this._urlSigner.sign(this, operation, params, responseType)
		},
		
		// Set here the default timeout value for all apstrata operations
		// a value of 0 disables timeout
		getTimeout: function() {
			return this.timeout
		},
		
		saveToCookie: function(saveObject) {
			var self = this
			
			if (typeof saveObject == undefined) {
				saveObject: {}
			}

			var o = {
				credentials: self.credentials,
				serviceUrl: self.serviceUrl,
				defaultStore: self.defaultStore,
				saveObject: saveObject
			}
			
			this.debug("saving connection to cookie:", dojo.toJson(o))
			
			dojo.cookie(self._COOKIE_NAME, dojo.toJson(o), {expires: self._COOKIE_EXPIRY})			
		},
		
		loadFromCookie: function() {
			var json = dojo.cookie(this._COOKIE_NAME)

			this.debug("Loading connection from cookie:", json)
			
			if ((json == undefined) || (json == "")) {
				this.serviceUrl = this._DEFAULT_SERVICE_URL
				
				var o = {
					key: "",
					secret: "",
					un: "",
					pw: ""
				}
				
				this.credentials = o
				this.defaultStore = ""
				return {}
			} else {
				var o = dojo.fromJson(json)
	
				this.debug("Loading connection from cookie", o)
					
				this.credentials = o.credentials
				this.serviceUrl = o.serviceUrl
				this.defaultStore = o.defaultStore

				if (o.saveObject != undefined) return o.saveObject
			}
		},

		fakelogin: function(handlers) {
			var self = this
			
					self._ongoingLogin = false
					this.debug("logging in: saving credentials to cookie")
					self.saveToCookie()
					handlers.success()
		},
		
		login: function(handlers) {
			var self = this
			
			self._ongoingLogin = true
			this.debug("logging in: attemting an operation to apstrata to validate credentials")
			
			var listStores = new apstrata.apsdb.client.ListStores(self)
			dojo.connect(listStores, "handleResult", function() {
					self._ongoingLogin = false
					self.debug("logging in: saving credentials to cookie")
					self.saveToCookie()
					handlers.success()
			})
			dojo.connect(listStores, "handleError", function() {
					handlers.failure(listStores.errorCode, listStores.errorMessage)
			})
			
			listStores.execute();
		},

		logout: function() {
			this.debug("logging out: erasing credentials from cookie")
			this.credentials.secret = ""
			this.credentials.pw = ""
			this.saveToCookie()
		},

		_credentialsError: function() {
//			if (!this._ongoingLogin) this.clearCookies()
// clear credentials from cookies
		},

		credentialsError: function() {}
	});
	
/*


		execute: function(operation, params) {
			function instantiateDynamic(className, attributes) {
			    var tmp = "dojo.declare('wrapper', [], {\n"
				tmp+= "     constructor: function(obj){"
				tmp+= "         var o = new " + className + "(obj);"
				tmp+= "         o._dynamicInstantiation = true;"
				tmp+= "         this.wrapped = o;"
				tmp+= "     }"
				tmp+= "})"            
		
			    eval(tmp)
		
			    var o = new wrapper(attributes)
			    return o.wrapped
			};
			
			var operationClass = "apstrata.apsdb.client." + operation
			var operation = instantiateDynamic(operationClass, this);
			
			var executionObject = {
				execute: function() {
					// substitute the operation timeout handler
					//  install our own, so we can retry operations
					//  without the application getting a signal
					this.operation.execute(params)
				}
			}

//			executionObject.operation = operation;
//			executionObject.timeoutHandler = this.operation.timeout;
//			operation.timeout = function() {console.dir("trapped timeout")};

//			this.registerRetryOperation(executionObject);
			
			executionObject.execute();

			return operation
		},

		registerRetryOperation: function(executionObject) {},	// Trapped by ConnectionError to allow for retrying latest operation
		

 */