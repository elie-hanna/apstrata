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

dojo.provide('apstrata.horizon.Login');

dojo.require('apstrata.horizon.Panel');

dojo.declare("apstrata.horizon.Login", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon.Panel], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/Login.html"),

	maximizePanel: true,
	
	constructor: function(attrs) {
		var self = this
		if (attrs) {
			if (attrs.success) self._success = attrs.success
			if (attrs.failure) self._failure = attrs.failure
		}
	},
	
	_onMouseoverMaster: function() {
		dojo.style(this.dvMaster, {background: "#AAAADD"})
	},
	
	_onMouseoutMaster: function() {
		dojo.style(this.dvMaster, {background: "#DDDDee"})
	},
	
	_onMouseoverUser: function() {
		dojo.style(this.dvUser, {background: "#AAAADD"})
	},
	
	_onMouseoutUser: function() {
		dojo.style(this.dvUser, {background: "#DDDDee"})
	},

	loginMaster: function() {
		var self = this
		if (this.masterForm.validate()) {
			connection.credentials.key = this.mKey.value
			connection.credentials.secret = this.mSecret.value
			
			if (!apstrata.apConfig) 
				apstrata.apConfig = {};
			
			this.getContainer().connection.loginMaster({
				success: function(){
					apstrata.apConfig.key = connection.credentials.key
					apstrata.apConfig.secret = connection.credentials.secret
					
					if (self._success) 
						self._success()
				},
				
				failure: function(error, message){
					if (self._failure) 
						self._failure()
					var msg = ""
					if(error == "INVALID_SIGNATURE")
						msg = "Invalid credentials."
					else
						msg = "Invalid username or password."
					apstrata.alert(msg, self)
				}
			})
		}
	},

	/**
	 * Calls the existing connection's loginUser function and passes the extra parameters to it.
	 */
	loginUser: function() {
		var self = this;
		if (self.userForm.validate()) {
			connection.credentials.key = self.key.value;
			connection.credentials.secret = "";
			connection.credentials.username = self.un.value;
			connection.credentials.password = self.pw.value;

			if (!apstrata.apConfig) 
				apstrata.apConfig = {};

			self.getContainer().connection.loginUser({
				success: function () {
					apstrata.apConfig.key = connection.credentials.key;
					apstrata.apConfig.username = connection.credentials.username;
					apstrata.apConfig.password = connection.credentials.password;

					if (self._success) 
						self._success();
				},

				failure: function (error, message) {
					if (self._failure)
						self._failure();
					var msg = "";
					if(error == "INVALID_SIGNATURE")
						msg = "Invalid credentials.";
					else
						msg = error + ((message) ? " - " + message : "");
					apstrata.alert(msg, self);
				},

				extraParameters: arguments[0]
			});
		}
	}
})
