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

dojo.provide("apstrata.dojo.client.apsdb.Connection");

dojo.require ("dojox.encoding.digests.MD5");
dojo.require("apstrata.dojo.client.apsdb.Core");

dojo.require("apstrata.dojo.client.apsdb.ListStores");
dojo.require("apstrata.dojo.client.util.Logger")

// An activity object is used by operations to register the sending of requests and
//  receipt of responses.
//  Activity will keep track of the first request and the last response to generate proper events
//  that can be trapped by the UI to indicate communication activity (start, stop) or errors (timeout)
dojo.declare("apstrata.dojo.client.apsdb.oldActivity",
	[apstrata.dojo.client.util.Logger],
	{
		constructor: function() {
			this.counter = 0;	
		},
		
		start: function() {
			this.counter++;
			this.busy();
			this.log("active operations", this.counter==0?'none':this.counter)
		},
		
		stop: function() {
			if (this.counter>0) this.counter--;
			if (this.counter==0) this.free() //setTimeout (dojo.hitch(this, "free"), 3000)  
			this.log("active operations", this.counter==0?'none':this.counter)
		},
		
		timeout: function(url) {},
		
		busy: function() {},
		free: function() {}
	})

dojo.declare("apstrata.dojo.client.apsdb.Activity",
	[apstrata.dojo.client.util.Logger],
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
		
		timeout: function(url) {},
		
		busy: function() {},
		free: function() {}
	})


dojo.declare("apstrata.dojo.client.apsdb.Connection",
	[apstrata.dojo.client.util.Logger],
	{
		_KEY_APSDB_ID: "@key",
		
		constructor: function() {
			this._DEFAULT_SERVICE_URL= "http://apsdb.apstrata.com/sandbox-apsdb/rest"
			this._TIMEOUT= 10000
			this.serviceUrl= this._DEFAULT_SERVICE_URL;
			this.credentials= {key: "", secret: "", un: "", pw: ""}
			this.defaultStore = ''
			this._newKeySeed= Math.floor(Math.random()*99999999)
			
			this.activity= new apstrata.dojo.client.apsdb.Activity()		
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
			return this._TIMEOUT
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
			
			var operationClass = "apstrata.dojo.client.apsdb." + operation
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
		
		registerRetryOperation: function(executionObject) {},	// Trapped by ConnectionError to allow for retrying latest operation
		
		login: function(dialog, masterAccount) {
			if (masterAccount == undefined) masterAccount = true;

			var self = this;
			
			if (masterAccount) {
				var listStores = new apstrata.dojo.client.apsdb.ListStores(dojo.clone(self))
				dojo.connect(listStores, "handleResult", function() {
//					if (listStores.status == listStores._SUCCESS) {
						dialog.loginSuccess()
//					}
				})
				dojo.connect(listStores, "handleError", function() {
					dialog.loginFailure()
				})
				
				listStores.execute();
			}
		}
		
	});