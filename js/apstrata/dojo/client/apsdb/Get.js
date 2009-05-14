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

dojo.provide("apstrata.dojo.client.apsdb.Get");

dojo.require ("dojo.io.script");
dojo.require("dojox.encoding.digests.MD5")


	dojo.declare("apstrata.dojo.client.apsdb.Get",
	[],
	{
		//
		// Constants
		//
		_FAILURE: "failure",
		_SUCCESS: "success",
		_APSTRATA_BASEURL: "http://localhost:8080/autoforms/view/proxyView", //"http://www.apstrata.com/apstrata/view/proxyView",
		//_APSTRATA_BASEURL: "http://localhost/apstratabase/view/proxyView",
		
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
			var signature = dojox.encoding.digests.MD5(valueToHash, dojox.encoding.digests.outputTypes.Hex);

			var apswsReqUrl = this._APSTRATA_BASEURL
					+ "?apsdb.action=" + this.apsdbOperation
					+ "&apsws.time=" + timestamp
					+ "&apsws.authKey=" + this.auth.key
					+ "&apsws.authSig=" + signature
					+ "&apsws.authMode=simple"
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


