dojo.provide("apstrata.home.dashboard.Accounts")

dojo.require("dijit.form.TextBox");
dojo.require("dojox.encoding.crypto.SimpleAES");

/**
 * This widget is used to display the accounts owned by the current user.
 * It also provides means to regenerate the secret of each account. 
 * 
 * @param {Object} attrs
 */
dojo.declare("apstrata.home.dashboard.Accounts", 
[apstrata.horizon.Panel], 
{
		
	constructor: function(attrs) {
		
		dojo.hitch(this, "_regenerateSecret");		
		this._getAccounts();			
	},

	postCreate: function(){		
		
		this.inherited(arguments);
	},
	
	/*
	 * Render the information on a account as soon as the result of the script is returned
	 * The script is called in _getAccounts()
	 */
	startup: function() {	
		
		this.inherited(arguments);
		
		var self = this;
		
		dojo.when(self.loadingDeferred, 
			
			function(response){
				
				if (response.metadata.status == "success") {
					
					self.accounts = response.result.accounts;
										
					// an associative array that will associate the secret textbox widget to an authKey
					self.secrets = {};
					
					dojo.style(self.dvContent, "width", "500px");					
					for (var i = 0; i < self.accounts.length; i++) {						
												
						// beginning of an account "section"
						
							// 1. we start with the "header" AccountId : [the accountId]												
						var divSectionHeader = dojo.create("div", {style: {width:"200px", height:"30px" }});
						dojo.place(divSectionHeader, self.dvContent);
						
						dojo.place("<span style='font-weight:bold'><label >Account Id : </label></span>", divSectionHeader);
						dojo.place("<span style='font-weight:bold'>" + self.accounts[i].accountId + "</span>", divSectionHeader); 
						
						// the div that contain the account info. elements are displayed in float						
						var divSection = dojo.create("div");	
						dojo.place(divSection, self.dvContent);
						
							//  2. Authentication Key [textbox displaying the authKey]
						dojo.place("<div style='float:left;width:150px;height:30px'><label >Authentication Key</label></div>", divSection);						
											
						var divAuthKeyCell = dojo.create("div", {style: { "float":"left", width:"300px", height:"30px" } });
						dojo.place(divAuthKeyCell, divSection);
						
						var authKeyTextBox = new dijit.form.TextBox( 
							{ 
								value : self.accounts[i].aps_authKey,	
								readOnly : true						
							});		
						dojo.style(authKeyTextBox.domNode, "width", "300px");					
						dojo.place(authKeyTextBox.domNode, divAuthKeyCell);
						
							//  3. (show/hide secret button) [textbox that will contain the secret]
						var divButton = dojo.create("div",  { style: { "float":"left", width:"150px", height:"30px" } });
						dojo.place(divButton, divSection);
						
						var secretButton = new dijit.form.Button(
							{
								id : self.accounts[i].aps_authKey,
								label : "Show /hide secret",								
								onClick : dojo.hitch(self, "_showHideSecret") 
							}
						);
						dojo.place(secretButton.domNode, divButton);		
												
						var divSecretCell = dojo.create("div", {style: { "float":"left", width:"300px", height:"30px" } });
						dojo.place(divSecretCell, divSection);
						
						var secretTextBox = new dijit.form.TextBox( { readOnly : true} );		
						dojo.style(secretTextBox.domNode, "width", "300px");	
						dojo.style(secretTextBox.domNode, "visibility", "hidden");	
						dojo.place(secretTextBox.domNode, divSecretCell);
						secretButton.set("secretTextBox", secretTextBox);
						
						// associate the textbox to the corresponding authkey 
						// so they can be leveraged in _showHideSecret()						
						self.secrets[self.accounts[i].aps_authKey] = secretTextBox;
												
											
							// 4. (Regenerate secret button) (Developer Workbench button)
						var regenerateSecretButton = new dijit.form.Button(
							{
								id : "Regen_" + self.accounts[i].aps_authKey,
								label : "Regenerate secret",								
								onClick : dojo.hitch(self, "_regenerateSecret") 
							}
						);
						dojo.place(regenerateSecretButton.domNode, self.dvContent);
						
						var openWorkbenchButton = new dijit.form.Button(
							{
								id : "WorkBench" + self.accounts[i].aps_authKey,
								label : "Developer Worbench",								
								onClick : dojo.hitch(self, "_openWorkbench")
							}
						);
						dojo.place(openWorkbenchButton.domNode, self.dvContent);
						
						// end of section
						dojo.place("<div style='clear:left'>", self.dvContent);
					}					
					
						
				}else {			
					var errorMsg = response.result.errorDetail;
					self._alert(errorMsg ? errorMsg : "An error has occured", "errorIcon");					
				}
			},
			
			function(response){
				var errorDetail = response.metadata.errorDetail;
				var errorCode = response.metadata.errorCode;
				this._alert(errorDetail ? errorDetail : errorCode, "errorIcon");
			}
		); 					
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
	 * Show or hide the secret key when the show/hide secret button is clicked.
	 * If the secret was hidden, the function triggers a call to RunScript:accountUtils(authKey, getAccounts)
	 */
	_showHideSecret: function(event) {
		
		var buttonId = event.target.id;
		
		// the authKey of the selected account, i.e. that of which "show/hide" button was clicked
		var selectedAuthKey = buttonId.substring(0, buttonId.lastIndexOf("_"));
				
		// if it is the first time we click on the show/hide button for this account
		// (and if not secret was re-generated) we need to identify the selected account first
		if (selectedAuthKey != this.currentAuthKey) {
			
			this.currentAuthKey = selectedAuthKey;
						
			// the textbox information that is related to the selected authkey
			this.currentSecret = this.secrets[this.currentAuthKey];
			
			// retrieve the account info and update the textbox value and status
			this._callScript("getAccount");
			
		}
		else {
			
			// if we already have selected this account, we just need to toggle the visibility
			var textBox = this.currentSecret;
			if (dojo.style(textBox.domNode, "visibility") == "hidden"){				
				dojo.style(textBox.domNode, "visibility", "visible");					
			}else {
				dojo.style(textBox.domNode, "visibility", "hidden");					
			}			
		}
	},
	
	/*
	 * Regenerate the secret for the currently selected account.
	 * A confirmation dialog is opened in order to get confirmation before proceeding.
	 */
	_regenerateSecret: function(event) {
		
		var self = this;	
		
		//if (!this.currentAuthKey) {	
		
			// if the user never clicked on "show/hide secret", we need to extract the
			// authkey from the id of the "regenerateSecret" button		
			var buttonId = event.target.id;
				
			// the authKey of the selected account, i.e. that of which "regenerateSecret" button was clicked
			self.currentAuthKey = buttonId.substring(buttonId.indexOf("_") + 1, buttonId.lastIndexOf("_"));
				
			// the textbox information that is related to the selected authkey
			self.currentSecret = this.secrets[this.currentAuthKey];	
		//}
		
		new apstrata.horizon.PanelAlert({
					panel: self, 
					width: 320,
					height: 140,
					iconClass: "editIcon",
					message: "Are you sure you want to regenerate the secret ?",
					actions: ['OK', 'Cancel'],
					actionHandler: function(action) {
						if (action == "OK"){
							
							// Call the regenerate secret logic
							self._callScript("regenerateSecret");	
							
							// Send a notification e-mail to the owner
							var params = {
										"apsdb.scriptName" : "dashboard.accountUtils",
										"authKey" : self.currentAuthKey,
										"subject" : "Account update notification",
										"message" : "Your secret has been regenerated",
										"function" : "sendAdminMail",
										"logLevel" : "4"
									};
										
							self.container.client.call("RunScript", params, null).then(
								function(response) {
									console.log(response);
								},
								
								function(response) {
									console.log(response);
								}
							);						
						}
						
						self.closePanel();						
					}
				}
			);			
	},
	
	/*
	 * this function factors out part of the logic that is shared by _showHideSecret() and
	 * _regenerateSecret(). The factored logic consist in calling the accountUtilScript
	 * then updating the secret textbox if the call was succesful.
	 * The sole difference between the two cases is the name of the function to use in the
	 * script, "getAccount" or "regenerateSecret" respectively.  
	 */
	_callScript: function(functionName) {
		
		var self = this;
		var params = {
					"apsdb.scriptName" : "dashboard.accountUtils",
					"authKey" : self.currentAuthKey,
					"function" : functionName
				};
					
		this.container.client.call("RunScript", params, null).then(
			
			function(response){
					
				if (response.metadata.status == "success") {	
					if (response.result.errorDetail) {
						var errorMsg = response.result.errorDetail.errorDetail;
						self._alert(errorMsg ? errorMsg : "An error has occured", "errorIcon");						
					}else {						
						var textBox = self.currentSecret;
						textBox.set("value", response.result.account.aps_authSecret);
						dojo.style(textBox.domNode, "visibility", "visible");
					}						
				}else {			
					var errorMsg = response.metadata.errorDetail;
					self._alert(errorMsg ? errorMsg : "An error has occured", "errorIcon");					
				}						
			},
			
			function(response){
				var errorDetail = response.metadata.errorDetail;
				var errorCode = response.metadata.errorCode;
				this._alert(errorDetail ? errorDetail : errorCode, "errorIcon");
			}
		);
	},
	
	/*
	 * This function is used to build the list of accounts owned by the current user.
	 * it mainly calls the "accountsUtil([the login], "listAccounts") scipt
	 * and it returns the Deferred that is resulting from this call.
	 * The Deferred is used in the startup() function to render the panel.
	 */
	_getAccounts: function() {
		
		var self = this;
		var credentials = this.container.client.connection.credentials;
		var userLogin = "";
		var loginType = "login";
		if (credentials.password){
			userLogin = credentials.user;
		}else {
			userLogin = credentials.authKey;
			loginType = "authKey";
		}
		
		var params = {};
		
		if (loginType == "login") {
			params = {
				"apsdb.scriptName" : "dashboard.accountUtils",
				"login" : userLogin,
				"function" : "listAccounts"
			}
		}else {
			params = {
				"apsdb.scriptName" : "dashboard.accountUtils",
				"authKey" : userLogin,
				"function" : "listAccounts"
			}
		}
		
		this.loadingDeferred = this.container.client.call("RunScript", params, null);
	},
	
	_openWorkbench: function(event) {
				
		var buttonId = event.target.id;
		
		// the authKey of the selected account, i.e. that of which "Worbench" button was clicked
		this.currentAuthKey = buttonId.substring("Workbench".length, buttonId.lastIndexOf("_"));
		var targetUrl = apstrata.registry.get("apstrata.services", "targetClusterUrl");
		var url = this._getWorkbenchUrl(this.currentAuthKey, targetUrl);										
		window.open(url);	
	},
	
	_getWorkbenchUrl: function(key, targetUrl) {
				
		var workbenchUrl = apstrata.registry.get("apstrata.services", "worbenchUrl");		
		return (workbenchUrl + "?key=" + key + "&serviceUrl=" + encodeURIComponent(targetUrl));
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
	},
	
})