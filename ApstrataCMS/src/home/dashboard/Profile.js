/*******************************************************************************
 *  Copyright 2009-2012 Apstrata
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
dojo.provide("apstrata.home.dashboard.Profile")

dojo.require("dijit.form.ValidationTextBox");

dojo.require("apstrata.ui.forms.FormGenerator")


/**
 * Instantiates a User Profile widget 
 * 
 * @param {Object} attrs
 */
dojo.declare("apstrata.home.dashboard.Profile", 
[apstrata.horizon.Panel], 
{
	
	definition : {
				label: "Profile",
				fieldset: [
							{name: "attributes", label: "Personal information", type: "subform", style: "form", cssClass:"section",
								fieldset: [
									{name: "login", label: "Login", type: "string", readOnly: true},
									{name: "password", label: "Update Password", type:"password", readOnly: false},
									{name: "confirmPassword", label: "Confirm Password", type:"password", readOnly: false, attrs: {invalidMessage: "Passwords don't match"}},
									{name: "name", label: "Name", type: "string", readOnly: false},
									{name: "jobTitle", label: "Job Title", type: "string", readOnly: false},
									{name: "email", label: "e-Mail", type: "string", readOnly: false}																							
								]					
							},
							{name: "attributes", label: "Company information", type: "subform", style: "form", cssClass:"section",
								fieldset: [
									{name: "company", label: "Company Name", type: "string", readOnly: false},
									{name: "phone", label: "Phone Number", type: "string", readOnly: false},
									{name: "webSite", label: "Company Web Site", type: "string", readOnly: false}					
								]					
							}							
						],	
						
				actions: ['save']
			},
	
	constructor: function(options) {
		this.options = options;			
	},

	postCreate: function(){
		var self = this;
		var zDefinition = self.definition;

		dojo.addClass(this.domNode, "profile")

		var formGenOptions = {
			cssClass : "newClass",
			width : "500px",
			definition : zDefinition,
			autoWidth : true,
			save: dojo.hitch(self, "save"),
		}
		
		this.formGenerator = new apstrata.ui.forms.FormGenerator(formGenOptions);	
		dojo.place(this.formGenerator.domNode, this.dvContent);	
		this.inherited(arguments);
			
		// Register the _loadProfileData to the formGenerator.isReady event occurrence		
		this.formGenerator.ready(dojo.hitch(this, "_loadProfileData"));			
	},

	startup: function() {
					
		this.inherited(arguments);
	},
	
	reload: function() {
		this.inherited(arguments);
	},
	
	uninitialize: function(){
		var widgets = dijit.findWidgets(this.domNode);
		dojo.forEach(widgets, function(widget) {
		    widget.destroyRecursive(true);
		});
		
		this.inherited(arguments);
	},
	
	/*
	 * Update the user's profile by collecting the values of the editable fields
	 * and sending them through a call to "dashboard.updateProfile"
	 */
	save: function(values, formGenerator){
		var self = this;
		if (true) { 

			if (this.formGenerator.validate()){				
				new apstrata.horizon.PanelAlert({
					panel: self,
					width: 320,
					height: 140,
					iconClass: "editIcon",
					message: "Are you sure you want to save the profile changes?",
					actions: ['OK', 'Cancel'],
					actionHandler: function(action){
						if (action == "OK") {
							self._saveChanges()
						}
					}
				})



			}
		}
	},
	
	_saveChanges: function() {
		var self = this
		
		var params = {
			"apsdb.scriptName" : "dashboard.updateProfile",
			"login" : this.formGenerator._fields.login.value,

			// if this is not sent it won't be changed
			"password" : this.formGenerator._fields.password.value,
			"name" : this.formGenerator._fields.name.value,
			"email" : this.formGenerator._fields.email.value,
			"jobTitle" : this.formGenerator._fields.jobTitle.value,
			"company" : this.formGenerator._fields.company.value,
			"webSite" :  this.formGenerator._fields.webSite.value,
			"phone" : this.formGenerator._fields.phone.value
		}
		
		this.container.client.call("RunScript", params).then(
		
			function(response) {
				if (response.result.status == "failure") {
					self._alert(response.result.errorDetail, "errorIcon");
				}else {
					
					// reset the formGenerator's content with the data that has just been updated
					self._loadProfileData();
					
					//if the password has been changed we need to modify the credentials if the user has logged in 
					//using his login and password
					self._updateCredentials(self.formGenerator._fields.password.value);
												
					self.isEditing = false;
					self.backup = {};
					self._alert("Your profile has been updated", "icon");	
				}						
			},
			
			function(response) {
				self._alert(response.metadata.errorDetail, "errorIcon");
			}
		)
	},

	destroy: function() {
		this.inherited(arguments);
	},
	
	/*
	 * Populate the content of the form generated by the form generated using the result of a call
	 * to dashboard.accountUtils("login:xxx", "function:'getProfile')
	 */
	_loadProfileData: function() {
		
		var self = this;
		var credentials = this.container.client.connection.credentials;
		var userLogin = "";
		if (credentials.password){
			userLogin = credentials.user;
		}else {
			userLogin = credentials.authKey;
		}
		
		var params = {
			"apsdb.scriptName" : "dashboard.accountUtils",
			"login" : userLogin,
			"function" : "getProfile"
		}
		
		this.container.client.call("RunScript", params, null).then(
			
			function(getAccountProfileResponse) {	
				if (getAccountProfileResponse.result.metadata.status == "success") {
					var profileData = getAccountProfileResponse.result.result.user;
					
					var accountsAsStr = "";				
									
					self.value = {
						login : profileData.login,
						name : profileData.name,						
						email : profileData.email,
						jobTitle : profileData.jobTitle,
						accounts : profileData.availableAccounts,
						company : profileData.company,
						phone : profileData.phone,
						webSite : profileData.webSite,
						accounts : accountsAsStr
					}			
					
					self.formGenerator.set("value", self.value);				
					self.reload();
					
				}else {			
					var errorMsg = getAccountProfileResponse.result.metadata.errorDetail;
					self._alert(errorMsg ? errorMsg : "An error has occured", "errorIcon");					
				}
			},
			
			function(getAccountProfileResponse){
				var errorDetail = getAccountProfileResponse.metadata.errorDetail;
				var errorCode = getAccountProfileResponse.metadata.errorCode;
				this._alert(errorDetail ? errorDetail : errorCode, "errorIcon");
			} 	
		);		
	},	
	
	/*
	 * If the password has been changed by the logged in user, we need to update his
	 * current credential object
	 */
	_updateCredentials: function(newPassword) {
		
		var credentials = this.container.client.connection.credentials;
		if (credentials.password && newPassword && newPassword != "" && credentials.password != newPassword){
			this.container.client.connection.credentials.password = newPassword;
		}
	},
	
	_onButtonClick: function(event){
		alert("clicked");
	},
	
	_alert: function(message, iconClass) {
		var self = this;
		new apstrata.horizon.PanelAlert({
					panel: self, 
					width: 320,
					height: 140,
					iconClass: iconClass,
					message: message,
					actions: ['OK'],
					actionHandler: function(action) {
						self.closePanel();
					}
				}
			);		
	}
	
})