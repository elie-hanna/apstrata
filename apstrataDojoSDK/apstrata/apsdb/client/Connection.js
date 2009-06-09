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

dojo.provide("apstrata.apsdb.client.Connection");

dojo.require("dojox.encoding.digests.MD5");
dojo.require("dojo.cookie");

dojo.require("apstrata.apsdb.client.ListStores");
dojo.require("apstrata.util.logger.Logger")

// An activity object is used by operations to register the sending of requests and
//  receipt of responses.
//  Activity will keep track of the first request and the last response to generate proper events
//  that can be trapped by the UI to indicate communication activity (start, stop) or errors (timeout)
dojo.declare("apstrata.apsdb.client.Activity",
	[apstrata.util.logger.Logger],
	{
		constructor: function() {
			this.counter = 0;
			this.activity = {}
		},
		
		start: function(operation) {
			this.activity[operation.url] = operation
			this.counter++
			this.busy();
			this.log("active operations", this.counter)
		},
		
		stop: function(operation) {
			if (this.activity[operation.url]!=undefined) {
				delete this.activity[operation.signature]
				this.counter--
			}
			
			if (this.counter==0) this.free() //setTimeout (dojo.hitch(this, "free"), 3000)  
			this.log("active operations", this.counter)
		},
		
		timeout: function(operation) {
//			this.stop(operation)
		},
		
		busy: function() {},
		free: function() {}
	})


dojo.declare("apstrata.apsdb.client.Connection",
	[apstrata.util.logger.Logger],
	{
		_KEY_APSDB_ID: "@key",
		_COOKIE_NAME: "apstrata.apsdb.client",
		_COOKIE_EXPIRY: 15,
		totalConnectionTime: 0,
		numberOfConnections: 0,
		
		constructor: function(attr) {
			this._DEFAULT_SERVICE_URL= "http://apsdb.apstrata.com/sandbox-apsdb/rest"
			this.timeout = 10000
			this.serviceUrl= this._DEFAULT_SERVICE_URL;
			this.credentials= {key: "", secret: "", un: "", pw: ""}
			this.defaultStore = ''

			if (typeof apstrata.apConfig != undefined) {
				if (apstrata.apConfig.key != undefined) this.credentials.key = apstrata.apConfig.key
				if (apstrata.apConfig.secret != undefined) this.credentials.secret = apstrata.apConfig.secret
				if (apstrata.apConfig.defaultStore != undefined) this.defaultStore = apstrata.apConfig.defaultStore
				if (apstrata.apConfig.timeout != undefined) this.timeout =  apstrata.apConfig.timeout
			}
			this._newKeySeed= Math.floor(Math.random()*99999999)

			this.activity= new apstrata.apsdb.client.Activity()

			this.loadFromCookie()

			// TODO: Investigate why this is not working: dojo.parser.instantiate
			/*
			if (attr!=undefined) {
				if (attr.statusWidget!=undefined) {
					dojo.require(attr.statusWidget)
					var sw = dojo.parser.instantiate(this, {dojoType: attr.statusWidget});
				}
			}
			*/

			// TODO: this should be replaced by dynamic instantiation
			if (attr!=undefined) {
				if (attr.statusWidget == "apstrata.apsdb.client.widgets.ConnectionStatus") {
					dojo.require("apstrata.apsdb.client.widgets.ConnectionStatus")
					var sw = new apstrata.apsdb.client.widgets.ConnectionStatus(this)
				}
			}

		},

		registerConnectionTime: function(t) {
			this.numberOfConnections++
			this.totalConnectionTime += t
			this.averageConnectionTime = this.totalConnectionTime/this.numberOfConnections 

			this.log("average connection time", this.averageConnectionTime)
		},

		// Generates a new apstrata document uniqu @key for use when creating new items
		getNewKey: function() {
		    return dojox.encoding.digests.MD5('' + new Date().getTime() + (this._newKeySeed++), dojox.encoding.digests.outputTypes.Hex).toUpperCase();  
		},
		
		// Sign URL based on apstrata authentication requirements
		signUrl: function (operation, params) {
			var timestamp = new Date().getTime() + '';
			
			var valueToHash = timestamp + this.credentials.key + operation + this.credentials.secret;
			var signature = dojox.encoding.digests.MD5(valueToHash, dojox.encoding.digests.outputTypes.Hex);

			var apswsReqUrl = this.serviceUrl
					+ "?apsdb.action=" + operation
					+ "&apsws.time=" + timestamp
					+ "&apsws.authKey=" + this.credentials.key
					+ "&apsws.authSig=" + signature
					+ "&apsws.responseType=json"
					+ "&apsws.authMode=simple"
					+ ((params!="")?"&":"") + params

			return {url: apswsReqUrl, signature: signature};
		},
		
		// Set here the default timeout value for all apstrata operations
		// a value of 0 disables timeout
		getTimeout: function() {
			return this.timeout
		},

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
/*
			executionObject.operation = operation;
			executionObject.timeoutHandler = this.operation.timeout;
			operation.timeout = function() {console.dir("trapped timeout")};

			this.registerRetryOperation(executionObject);
*/			
			executionObject.execute();

			return operation
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
			
			this.log("saving connection to cookie", dojo.toJson(o))
			
			dojo.cookie(self._COOKIE_NAME, dojo.toJson(o), {expires: self._COOKIE_EXPIRY})			
		},
		
		loadFromCookie: function() {
			var json = dojo.cookie(this._COOKIE_NAME)

			this.log("Loading connection from cookie", json)
			
			if ((json == undefined) || (json == "")) {
				this.serviceUrl = this._DEFAULT_SERVICE_URL
				this.credentials = ""
				this.defaultStore = ""
				
				return {}
			} else {
				var o = dojo.fromJson(json)
	
				this.log("Loading connection from cookie", o)
					
				this.credentials = o.credentials
				this.serviceUrl = o.serviceUrl
				this.defaultStore = o.defaultStore

				if (o.saveObject != undefined) return o.saveObject
			}
		},
		
		registerRetryOperation: function(executionObject) {},	// Trapped by ConnectionError to allow for retrying latest operation
		
		login: function(handlers) {
			var self = this
		
			var listStores = new apstrata.apsdb.client.ListStores(dojo.clone(self))
			dojo.connect(listStores, "handleResult", function() {
//					if (listStores.status == listStores._SUCCESS) {
//					}
					self.saveToCookie()
					handlers.success()
			})
			dojo.connect(listStores, "handleError", function() {
				
					handlers.failure()
			})
			
			listStores.execute();
		}		
	});