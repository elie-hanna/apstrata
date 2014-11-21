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
dojo.provide("apstrata.cms.LoginWidget")

dojo.require("apstrata.ui.widgets.LoginWidget")

dojo.declare("apstrata.cms.LoginWidget", 
[apstrata.ui.widgets.LoginWidget], 
{

	login: function(values) {
		
		var self = this;
		this.form.disable()
		this._animation.show()

		var connection
		var credentials
		var serviceURL
		var timeout
		
		if (apstrata.registry.get("apstrata.sdk", "Connection")) {
			credentials = apstrata.registry.get("apstrata.sdk", "Connection").credentials
			serviceURL = apstrata.registry.get("apstrata.sdk", "Connection").serviceURL
			timeout = apstrata.registry.get("apstrata.sdk", "Connection").timeout
		}
		
		dojo.mixin(credentials, values)
		
		connection = new apstrata.sdk.Connection({credentials: credentials, serviceURL: serviceURL, timeout: timeout, loginType: "user"})

		var client = new apstrata.sdk.Client(connection);
		var params = {		
				
				"login": connection.credentials.user
		};	
		
		client.call("GetUser", params, null, {method:"Get"}).then(
		
			function(response){
				if(response.metadata.status == "success"){
					var groups = response.result.user.groups;
					
					if (groups == null) {
						groups = [];
					}
						
					if (typeof groups == 'string') {
					    groups = [ groups ];
					}
					
					var isPublisher = (groups.indexOf("publishers") > -1 );

					if(isPublisher) {
						self.form.enable()
						self._animation.hide()
						if (self._success) self._success(credentials)
					} else {
						self.onFailure();
					}
				}else {
					self.onFailure();
				}
			},
			
			function(response) {
				self.onFailure();
			}
		)	
	},
	
	onFailure: function() {
		var self = this;
		
		self.form.enable()
		self._animation.hide()
		self.form.vibrate(self.domNode)
		self.message(self.nls.BAD_CREDENTIALS)

		if (self._failure) self._failure()
	}

})