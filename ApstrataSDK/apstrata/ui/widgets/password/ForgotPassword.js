dojo.provide('apstrata.ui.widgets.password.ForgotPassword');

dojo.require("dijit._Widget");
dojo.require("dojox.dtl._Templated");
dojo.require("apstrata.sdk.Connection");
dojo.require("dijit.Dialog");
dojo.require("apstrata.sdk.Connection");
dojo.require("apstrata.ui.forms.FormGenerator");
dojo.require("dojox.validate.regexp");
dojo.require('apstrata.ui.Utility');

dojo.declare("apstrata.ui.widgets.password.ForgotPassword",
[dijit._Widget, dojox.dtl._Templated],
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.ui.widgets.password", "templates/ForgotPassword.html"),
	
	
	/**
     * Class name of failure messages
     * @field {string}
     * @memberof amc.application.ViewApplication
     */
	failureClass: "error",
	
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
	
	
	_forgotPasswordScript: "User.ForgotPassword",
	
	
	definition: {
		label: "",
		cssClass: "forgotPassword",
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
					}
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
		//this.connect(this.form.getField('email'), 'onChange', dojo.hitch(this, 'clearErr'));
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
				"apsdb.scriptName": this._forgotPasswordScript
			};
		
		client.call("RunScript", request, this.form.frmMain.domNode, {method: "post"}).then(
				function(response) {
					dom.globals.hideLoading(self.loading, self.loadingClass);
					console.debug(response);
					if(response.result.status == 'failure') {
						console.debug("Fail run script: "+self._forgotPasswordScript);
						dojo.style(self.form.domNode, "display", "none");
						var errorDetail = response.result.errorDetail;
						//Show the same as the success message, in order not to hint a hacker on what went wrong
						dom.globals.handleResponseDisplay("An email was sent to your mailbox, please follow the instructions to set your new password.", self.successClass, 'inline', self.messages);
					} else {
						console.debug("Success change password: NEED TO DO STUFF");
						dojo.style(self.form.domNode, "display", "none");
						dom.globals.handleResponseDisplay("An email was sent to your mailbox, please follow the instructions to set your new password.", self.successClass, 'inline', self.messages);
					}
				}, 
				function(response) {
					dom.globals.hideLoading(self.loading, self.loadingClass);
					console.debug("Fail run script: "+self._forgotPasswordScript);
					console.debug(response);
					var errorDetail = response.metadata.errorDetail;
					dom.globals.handleResponseDisplay(errorDetail, self.failureClass, 'inline', self.messages);
				})
//		
	}

});