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

dojo.require("dojox.encoding.digests.MD5");

dojo.declare("apstrata.URLSignerMD5", [], {	
	sign: function (connection, operation, params, responseType) {
					var timestamp = new Date().getTime() + '';
					
					responseType = responseType || "json"
					
					var signature = ''
					var userName =''
					var valueToHash = ''
					
					if (connection.credentials.username && connection.credentials.password && connection.credentials.username != '' && connection.credentials.password != '') {
						valueToHash = timestamp + connection.credentials.username + operation + dojox.encoding.digests.MD5(connection.credentials.password, dojox.encoding.digests.outputTypes.Hex).toUpperCase()
						signature = dojox.encoding.digests.MD5(valueToHash, dojox.encoding.digests.outputTypes.Hex)
						userName = connection.credentials.username;
					} else if(connection.credentials.secret && connection.credentials.secret != ''){
						valueToHash = timestamp + connection.credentials.key + operation + connection.credentials.secret
						signature = dojox.encoding.digests.MD5(valueToHash, dojox.encoding.digests.outputTypes.Hex)
					}
		
					var apswsReqUrl = connection.serviceUrl
							+ "?apsdb.action=" + operation
							+ "&apsws.time=" + timestamp
							+ "&apsws.authKey=" + connection.credentials.key
							+ ((signature!="")?"&apsws.authSig=":"") + signature
							+ ((userName!="")?"&apsws.user=":"") + userName
							+ "&apsws.responseType=" + responseType
							+ "&apsws.authMode=simple"
							+ ((params!="")?"&":"") + params
		
					return {url: apswsReqUrl, signature: signature};
			}
})


dojo.declare("apstrata.Connection",
	[apstrata.util.logger.Loggable],
	{
		_KEY_APSDB_ID: "@key",
		
		constructor: function(attrs) {
			this._DEFAULT_SERVICE_URL= "http://apsdb.apstrata.com/sandbox-apsdb/rest"
			this.timeout = 10000
			this.serviceUrl= this._DEFAULT_SERVICE_URL
			this.defaultStore = ""
			this.credentials= {key: "", secret: "", username: "", password: ""}
			this._urlSigner = new apstrata.URLSignerMD5()				

			if (attrs) {
				if (attrs.credentials) this.credentials = attrs.credentials
				
				if (attrs.timeout) this.timeout =  attrs.timeout
				if (attrs.serviceUrl) this.serviceUrl = attrs.serviceUrl
			} 
		},
		
		signUrl: function(operation, params, responseType) {
			return this._urlSigner.sign(this, operation, params, responseType)
		},

		getTimeout: function() {
			return this.timeout
		}

	});
	
