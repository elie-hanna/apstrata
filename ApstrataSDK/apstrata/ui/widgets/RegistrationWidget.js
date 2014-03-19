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

dojo.requireLocalization("apstrata.ui.widgets", "registration-widget")

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
	
	apsdbScriptUserExists: "widgets.Registration.userExists",
	apsdbScriptRegisterUser: "widgets.Registration.registerUser",
	
	showTermsAndCond: "false",
	termsAndCondUrl: "",

	definition: {
		label: "User Registration",
		cssClass: "newClass",
		fieldset: [
			{name: "required", label: "", type: "subform", style: "form", cssClass:"column",
				fieldset: [
					{name: "name", label: "Name", type: "string", required: true},
					{name: "email", label: "Email", type: "string", required: true},
					{name: "password", label: "Password", type: "password", required: true},
					{name: "confirmPassword", label: "Confirm Password", type: "password", required: true, attrs: {invalidMessage: "Passwords don't match"}}
				]
			},
			{name: "optional", label: "", type: "subform", style: "form", cssClass:"column", 
				fieldset: [
					{name: "jobTitle", label: "Job title", type: "string"},
					{name: "webSite", label: "Website", type: "string"},
					{name: "company", label: "Company", type: "string"},
					{name: "phone", label: "Phone", type: "string"}
				]
			},
			{name: "promotion", label: "", type: "subform", style: "form", cssClass:"row", 
				fieldset: [
					{name: "promotionCode", label: "Promotion Code (if you have one)", type: "string"}
				]
			}
		],
		actions: ['Join']
	},
	
	/**
	 * Instantiates a User registration widgets. 
	 * Prerequisites: This widget requires the presence of the apstrata scripts: widgets.Registration.userExists and widgets.Registration.registerUser
	 * "userExists" is used to verify that the email that is entered does not already exist.  If it is the case,
	 * the widget displays a link to the login page. In order to specify the address of the login page, two options
	 * are available:
	 * (1) If the RegistrationWidget is created programmatically, you need to pass the "loginurl" parameter to the constructor
	 * (2) If the RegistrationWidget is created declaratively as an embed, insert the "loginurl" attribute into the tag used to declare the widget 
	 * @param {Object} options.value
	 * 
	 */
	constructor: function(options) {
		this.options = options
		this.client = new apstrata.sdk.Client(new apstrata.sdk.Connection({
			loginType: apstrata.sdk.Connection.prototype._LOGIN_TYPE_MASTER
		}))
		this.nls = dojo.i18n.getLocalization("apstrata.ui.widgets", "registration-widget");
		
		if (this.options && !this.options.loginurl) {			
			if (this.options.embedNode) {
				var embedNodeAttrs = this.options.embedNode.attributes;				
				for (attr in embedNodeAttrs) {
					if (embedNodeAttrs[attr].name == "loginurl") {
						loginUrl = embedNodeAttrs[attr].value;
						this.loginurl = loginUrl;
						//break;
					}
					if (embedNodeAttrs[attr].name == "showTermsAndCond".toLowerCase()) {
						this.showTermsAndCond = embedNodeAttrs[attr].value;
						//break;
					}
					if (embedNodeAttrs[attr].name == "termsAndCondUrl".toLowerCase()) {
						this.termsAndCondUrl = embedNodeAttrs[attr].value;
						//break;
					}
				}
			}
		}
		
	},
	
	postCreate: function() {
		var self = this

		if (this.options && this.options.value) this.form = new apstrata.ui.forms.FormGenerator({definition: self.definition, value: self.options.value, save: dojo.hitch(self, "save")});
		else this.form = new apstrata.ui.forms.FormGenerator({definition: self.definition, save: dojo.hitch(self, "save")}) 
		
		dojo.place(this.form.domNode, this.domNode)
		
		var emailField = this.form.getField("email");
		emailField.onChange = function(v) {
			// 1st check if email is valid
			var emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			if (!emailFilter.test(v)) {
				emailField.invalidMessage = self.nls.ENTER_VALID_EMAIL
				emailField.validator = function(value, constraints) {
					return false // true if email not found, false otherwise
				}
				emailField.validate();
				
			// 2nd Async Check if email is unique, disable form while you do
			} else if (v.trim()!="") {
				self.form.showAsBusy(true, null, "Verifying e-mail uniqueness")
				self._userExists(emailField.get("value")).then(function(userExists) {
					if (userExists) {
						var loginUrl = self.loginurl;					
						emailField.invalidMessage = self.nls.EMAIL_ALREADY_REGISTERED +" <a href='" + loginUrl + "'>" + self.nls.LOGIN + "</a>"
						emailField.validator = function(value, constraints) {
							return false
						}
						self.form.showAsBusy(false)
					} else {
						emailField.validator = function(value, constraints) {
							return true 
						}
						self.form.showAsBusy(false)
					}
					emailField.validate();
				});
			}
		}

		self.form.getField("confirmPassword").validator = function(value, constraints) {
			return self.form.getField("password").get("value") == self.form.getField("confirmPassword").get("value")
		}
		
		if(this.showTermsAndCond=="true" && this.termsAndCondUrl!=""){
			dojo.place("<span class=''>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text </span>", self.form.domNode,"before");
			dojo.place("<span class=''>By clicking Join, you agree to Touch Cloud's <a href='" + this.termsAndCondUrl + "'>terms and conditions</a></span>", this.form._fields.promotionCode.domNode,"after");
		}

	},
	
	_userExists: function(login) {
		var self = this
		var deferred = new dojo.Deferred()
		
		var request = {
			"apsdb.scriptName": this.apsdbScriptUserExists,
			"login": login
		}
		
		this.client.call("RunScript", request, null, {method: "get"}).then(
			function(response) {
				deferred.resolve(response.result);
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
			"apsdb.scriptName": this.apsdbScriptRegisterUser,
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
				
				window.location = response.result.url;
			}, 
			function(response) {
				console.dir(response)
			})
		
		if (values.password != values.confirmPassword) { } else { }
	}
})