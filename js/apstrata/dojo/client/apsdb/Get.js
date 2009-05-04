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

dojo.provide("apstrata.dojo.client.apsdb.Get");

dojo.require ("dojo.io.script");

	dojo.declare("apstrata.dojo.client.apsdb.Get",
	[],
	{
		//
		// Constants
		//
		_FAILURE: "failure",
		_SUCCESS: "success",
		_APSTRATA_BASEURL: "http://localhost:8080/autoforms/view/proxyView", //"http://www.apstrata.com/apstrata/view/proxyView",
		
		auth: {},
		apsdbOperation: "",
		request: {},
		
		// Response values
		status: "",
		message: "",
		errorcode: "",
		response: {},
		operationAborted: false,
	
		constructor: function(auth) {
			this.auth = auth;
			this.request.apsdb = {};
		},
		
		// Sign URL based on apstrata authentication requirements
		signUrl: function (params) {
			var timestamp = new Date().getTime() + '';
			
			var valueToHash = timestamp + this.auth.key + this.apsdbOperation + this.auth.secret;
			var signature = hex_md5(valueToHash);

			var apswsReqUrl = this._APSTRATA_BASEURL
					+ "?apsdb.action=" + this.apsdbOperation
					+ "&apsws.time=" + timestamp
					+ "&apsws.authKey=" + this.auth.key
					+ "&apsws.authSig=" + signature
					+ ((params!="")?"&":"") + params

			return apswsReqUrl;
		},
		
		// Allows you to build the standard URL, could be overriden when necessary
		url: function() {
		    var params = ""; var i=0;

		    if (this.request.apsdb != null) {
			for (prop in this.request.apsdb) {
			    if (i>0) params += "&";
			    i++;
			    params += "apsdb." + prop + "=" + escape(eval("this.request.apsdb."+prop)); 
			}				
		    }

		    for (prop in this.request) {
			if (i>0) params += "&";
			i++;
			if (prop != "apsdb") params += "&" + prop + "=" + escape(eval("this.request."+prop)); 
		    }

		    var urlValue = this.signUrl(params);
//console.debug(urlValue);
		    return urlValue;
		},

		execute: function () {
		    var apsdb = this;
console.debug("executing:" + this.apsdbOperation);

		    dojo.io.script.get({ 
			    url: apsdb.url(),
			    xx: console.debug("doing IO: "+this.url()),
			    callbackParamName : "jc",

			    load: function(json) {
console.debug("load, aborted=" + apsdb.operationAborted);
console.debug(json);
				if (apsdb.operationAborted) return json;

				var res = dojo.fromJson(json);
				
				apsdb.status = res.status;
				apsdb.message = res.message;
				apsdb.response = res;

				if (apsdb.status==apsdb._SUCCESS) {
				    apsdb.handleResult();
				} else {
				    apsdb.errorcode = res.response.errorcode;
				    apsdb.handleError();
				}

				return json; 
			    }, 
			    
			    error: function(err) { 
console.debug("transport error");
console.debug(err);
				if (apsdb.operationAborted) return err;
				
				apsdb.errorcode = "communication_error";
				apsdb.message = err;
				apsdb.response = null;

				apsdb.handleError();
				return xml; 
			    } 
		    }); 			    
		},
		
		abort: function() {
console.debug("abort received");
			this.operationAborted = true;
		},
		//
		//
		handleResult: function() {},
		handleError: function() {
console.debug("application error");
console.dir(this.response);			    
		}
	});


