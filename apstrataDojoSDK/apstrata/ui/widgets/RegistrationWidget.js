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
dojo.provide("apstrata.ui.widgets.RegistrationWidget")

dojo.require("dojox.dtl._Templated")
dojo.require("apstrata.ui.forms.FormGenerator")
dojo.require("apstrata.ui.FlashAlert")

dojo.require("apstrata.sdk.Client")
dojo.require("apstrata.sdk.Connection")

dojo.requireLocalization("apstrata.ui.widgets", "LoginWidgetDef")

/**
 * Instantiates a User registration widgets. 
 * 
 * @param {Object} attrs
 */
dojo.declare("apstrata.ui.widgets.RegistrationWidget", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templateString: "<div class='RegistrationWidget'></div>",
	
	widgetsInTemplate: true,
	
	definition: {
		label: "User",
		cssClass: "newClass",
		fieldset: [
			{name: "required", label: "", type: "subform", style: "form", cssClass:"column",
				fieldset: [
					{name: "name", label: "Name", type: "string", required: true},
					{name: "email", label: "Email", type: "string", required: true},
					{name: "password", label: "Password", type: "password", required: true},
					{name: "confirmPassword", label: "Confirm Password", type: "password", required: true, attrs: {invalidMessage: "Passwords don't match"}},
				]
			},
			{name: "optional", label: "", type: "subform", style: "form", cssClass:"column", 
				fieldset: [
					{name: "jobTitle", label: "Job title", type: "string"},
					{name: "website", label: "Website", type: "string"},
					{name: "company", label: "Company", type: "string"},
					{name: "phone", label: "Phone", type: "string"},
				]
			},
		],
		actions: ['save', 'cancel']
	},
	
	/**
	 * Instantiates a User registration widgets. 
	 * Prerequisites: This widget requires the presence of the apstrata scripts: widgets.Registration.userExists and widgets.Registration.registerUser
	 * 
	 * @param {Object} options.value
	 * 
	 */
	constructor: function(options) {
		this.options = options
		this.client = new apstrata.sdk.Client(new apstrata.sdk.Connection({
			loginType: apstrata.sdk.Client.prototype._LOGIN_TYPE_MASTER
		}))
		this.nls = dojo.i18n.getLocalization("apstrata.ui.widgets", "LoginWidgetDef")
	},
	
	postCreate: function() {
		var self = this

		if (this.options && this.options.value) this.form = new apstrata.ui.forms.FormGenerator({definition: self.definition, value: self.options.value, save: dojo.hitch(self, "save")});
		else this.form = new apstrata.ui.forms.FormGenerator({definition: self.definition, save: dojo.hitch(self, "save")}) 
		
		dojo.place(this.form.domNode, this.domNode)		
		
		dojo.connect(this.form.getField("email"), "onChange", function(v) {
			// 1st check if email is valid
			var emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			if (!emailFilter.test(v)) {
				self.form.getField("email").invalidMessage = self.nls.ENTER_VALID_EMAIL
				self.form.getField("email").validator = function(value, constraints) {
					return false // true if email not found, false otherwise
				}
			} else if (v.trim()!="") {
				//
				// 2nd Async Check if email is unique, disable form while you do
				//
				self.form.showAsBusy(true)
				self._userExists(self.form.getField("email").get("value")).then(function() {
					self.form.getField("email").invalidMessage = self.nls.EMAIL_ALREADY_REGISTERED +" <a href=''>" + self.nls.LOGIN + "</a>"
					self.form.getField("email").validator = function(value, constraints) {
						return false
					}
					self.form.validate()
					self.form.showAsBusy(false)
				},
				function() {
					self.form.getField("email").validator = function(value, constraints) {
						return true 
					}
					self.form.validate()
					self.form.showAsBusy(false)
				})
			}
		})

		self.form.getField("confirmPassword").validator = function(value, constraints) {
			return self.form.getField("password").get("value") == self.form.getField("confirmPassword").get("value")
		}

	},
	
	_userExists: function(login) {
		var self = this
		var deferred = new dojo.Deferred()
		
		var request = {
			"apsdb.scriptName": "widgets.Registration.userExists",
			"login": login
		}
		
		this.client.call("RunScript", request, null, {method: "get"}).then(
			function(response) {
				if (response.result.status == "success") {
					deferred.resolve()
				} else {
					deferred.reject()
				}
			}, 
			function(response) {
				deferred.reject()
			})
		
		return deferred
	},
	
	message: function(message) {
		var self = this
		
		var alert = new apstrata.ui.FlashAlert({
			message: message,
			node: self.domNode
		})
		dojo.place(alert.domNode, this.domNode)
	},
	
	save: function(values) {
		var self = this
		
		var request = {
			"apsdb.scriptName": "widgets.Registration.registerUser",
			"user.login": values.email,
			"user.groups": "users"
		}
		
		delete values.confirmPassword

		for (k in values) {
			request["user."+k] = values[k]
		} 
		
		this.client.call("RunScript", request, null, {method: "get"}).then(
			function(response) {
				if (response.result.metadata.errorCode == "DUPLICATE_USER") {
					self.message(self.nls.EMAIL_ALREADY_REGISTERED)					
					self.form.getField("email").invalidMessage = self.nls.EMAIL_ALREADY_REGISTERED +" <a href=''>" + self.nls.LOGIN + "</a>"
					self.form.getField("email").validator = function(value, constraints) {
						return false // true if email not found, false otherwise
					}
					self.form.validate()
				}
			}, 
			function(response) {
				console.dir(response)
			})
		
		if (values.password != values.confirmPassword) { } else { }
	}
})