dojo.provide('apstrata.ui.widgets.password.ForgotPasswordReset');

dojo.require("dijit._Widget");
dojo.require("dojox.dtl._Templated");
dojo.require("apstrata.sdk.Connection");
dojo.require("dijit.Dialog");
dojo.require("apstrata.sdk.Connection");
dojo.require("apstrata.ui.forms.FormGenerator");
dojo.require("dojox.validate.regexp");
dojo.require('apstrata.ui.Utility');

dojo.declare("apstrata.ui.widgets.password.ForgotPasswordReset",
[dijit._Widget, dojox.dtl._Templated],
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.ui.widgets.password", "templates/ForgotPasswordReset.html"),
	redirectUrl: "",
	
	
	/**
     * Class name of failure messages
     * @field {string}
     * @memberof amc.application.ViewApplication
     */
	failureClass: "error",
	
	/**
	 * regular expression for password verification
	 * @field {string}
	 */
	passwordValidation: "",

	/**
	 * password verification Message
	 * @field {string}
	 */
	passwordValidationMessage: "",
	
	
	/**
     * Class name of success messages
     * @field {string}
     * @memberof amc.application.ViewApplication
     */
	loadingMessage: "Loading...",
	
	/**
     * Class name of loading
     * @field {string}
     * @memberof amc.application.ViewApplication
     */
	loadingClass: "loading",
	
	/**
     * Class name of success messages
     * @field {string}
     * @memberof amc.application.ViewApplication
     */
	successClass: "success",
	
	_ForgotPasswordResetScript: "User.ForgotPasswordReset",
	
	resetToken: "",
	
	definition : {
		label: "",
		cssClass: "newClass",
		submitAction: "Submit",
		fieldset: [
			{name: "required", label: "", type: "subform", style: "form", cssClass:"userProfile",
				fieldset: [
					{name: "email", label: "Email", type: "string", required: true, trim: true, 
						attrs: {
						regExpGen: dojox.validate.regexp.emailAddress, 
						placeHolder: "someone@example.com", 
						lowercase: true,
						invalidMessage: "Enter a valid email address in the format: someone@example.com",
						maxLength: 140
						}
					},
					{name: "newPassword", label: "New Password", type: "password", required: true, trim: true, attrs: { placeHolder: "Enter New Password", maxLength: 140}},
					{name: "confirmPassword", label: "Confirm new password", type: "password", required: true, trim: true, attrs: { placeHolder: "Confirm New Password", maxLength: 140}}
				]
			}
		],
		actions: ['Submit']
	},

	
	postCreate: function() {
		this.inherited(arguments);
		var self = this;
		this.form = new apstrata.ui.forms.FormGenerator({submitOnEnter: true, method: "POST", definition: self.definition, Submit: dojo.hitch(self, "resetPassword")});
		dojo.place(this.form.domNode, this.frmSection);
		
		var newPassword = self.form.getField("newPassword");
		var confirmPassword = self.form.getField("confirmPassword");
		
		
		if(self.passwordValidation!=""){
			newPassword.onChange = function(v) {
				
				var passwordFilter = new RegExp(self.passwordValidation);
				if (!passwordFilter.test(v)) {
						newPassword.invalidMessage = self.passwordValidationMessage
						newPassword.validator = function(value, constraints) {
							return false 
						}
						newPassword.validate();
				}else{
					newPassword.validator = function(value, constraints) {
						return true 
					}
					newPassword.validate();
				}
			}
		}
		
		
		confirmPassword.validator = function(value, constraints) {
			//console.debug('confirmPassword.validator running now against [' + value + ']');
			if (newPassword.value != value) {
				confirmPassword.invalidMessage = "New Password & Confirm New Password do not match";	
				return false;
			} else {
				var passwordValidator = /^.{6,}$/;
				confirmPassword.invalidMessage = "New password should be at least 6 characters";
				return passwordValidator.test(value);
			}
		};
		
		
	},
	
	clearErr: function() {
		dom.globals.handleResponseCleanup(this.messages, this.successClass, this.failureClass);
	},
	
	resetPassword: function() {
		this.clearErr();
		var connection = null;
		var self = this;
		connection = new apstrata.sdk.Connection({
			loginType: apstrata.sdk.Connection.prototype._LOGIN_TYPE_MASTER
		});

		var client = new apstrata.sdk.Client(connection);
		
		var request = {
				"apsdb.scriptName": this._ForgotPasswordResetScript, 
				"d" : this.resetToken
			};
		
		client.call("RunScript", request, this.form.frmMain.domNode, {method: "post"}).then(
				function(response) {
					dom.globals.hideLoading(self.loading, self.loadingClass);
					console.debug(response);
					if(response.result.status == 'failure') {
						console.debug("Fail run script: "+self._ForgotPasswordResetScript)
						var errorDetail = response.result.errorDetail;
						dom.globals.handleResponseDisplay(errorDetail, self.failureClass, 'inline', self.messages);
					} else {
						dojo.style(self.form.frmMain.domNode, "display", "none");
						dom.globals.handleResponseCleanup(self.messages, self.successClass, self.failureClass);
						dom.globals.handleResponseDisplay("Password Changed Successfully, you will be redirected to login", self.successClass, "inline", self.messages);
						setTimeout(dojo.hitch(self, self.redirectToLogin), 5000);
					}
				}, 
				function(response) {
					dom.globals.hideLoading(self.loading, self.loadingClass);
					console.debug("Fail run script: "+self._ForgotPasswordResetScript);
					console.debug(response);
					var errorDetail = response.metadata.errorDetail;
					dom.globals.handleResponseDisplay(errorDetail, self.failureClass, 'inline', self.messages);
				})
	},
	
	redirectToLogin: function() {
		
		window.location = this.redirectUrl;
	}

});