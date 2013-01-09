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

	templatePath: dojo.moduleUrl("apstrata.home.dashboard", dojo.getObject("accountsTemplate") ? accountsTemplate : "templates/Accounts.html"),
	connection: null,
	client: null,	
		
	/**
	 * params.connection: the connection to use
	 */
	constructor: function(params) {
		this._accounts = [];
		if (params) {
			
			this.connection = new apstrata.sdk.Connection(params.credentials);
			if (params.container) {
				this.container = params.container;
			}
			this.noRendering = params.noRendering ? params.noRendering : "false";
		}
	},
	
	postCreate: function(){	
		var self = this	
		
		this._getAccounts().then(function(response) {
			
			dojo.forEach(response.result.accounts, function(account) {
				self._accounts.push(account)
			})
			
				self.render();			
		}, function(response){
			var errorDetail = response.metadata.errorDetail;
			var errorCode = response.metadata.errorCode;
			self._alert(errorDetail ? errorDetail : errorCode, "errorIcon");
		})
		this.inherited(arguments)
	},

	/*
	 * This function is used to build the list of accounts owned by the current user.
	 * it mainly calls the "accountsUtil([the login], "listAccounts") script
	 * and it returns the Deferred that is resulting from this call.
	 * The Deferred is used in the startup() function to render the panel.
	 */
	_getAccounts: function() {
		
		var self = this;
		var credentials = this.container ? this.container.client.connection.credentials : this.connection.credentials;
		var userLogin = "";
		var loginType = "login";
		if (credentials.user){
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
		
		var connection = self.container ? self.container.connection : self.connection;
		var client = this.client ? this.client : (self.container ? self.container.client : new apstrata.sdk.Client(connection));
		return client.call("RunScript", params, null);
	},
	
	renderList: function(response) {
		console.dir(response)
	},
	
	_view: function(e) {
		var n = e.currentTarget
		var key = dojo.attr(n, "data-key")
		
		var self = this;
		var params = {
			"apsdb.scriptName" : "dashboard.accountUtils",
			"authKey" : key,
			"function" : "getAccount"
		}
		
		var client = self.container ? self.container.client : new apstrata.sdk.Client(self.connection);			
		client.call("RunScript", params, null).then(
			
			function(response){
					
				if (response.metadata.status == "success") {	
					if (response.result.errorDetail) {
						var errorMsg = response.result.errorDetail.errorDetail;
						self._alert(errorMsg ? errorMsg : "An error has occured", "errorIcon");						
					}else {						
					
						self._alert("The account secret for [" + key + "] is: " + response.result.account.aps_authSecret)
					}						
				}else {			
					var errorMsg = response.metadata.errorDetail;
					self._alert(errorMsg ? errorMsg : "An error has occured", "errorIcon");					
				}						
			},
			
			function(response){
				var errorDetail = response.metadata.errorDetail;
				var errorCode = response.metadata.errorCode;
				self._alert(errorDetail ? errorDetail : errorCode, "errorIcon");
			}
		);
		
	},
	
	_reset: function(e) {
		var n = e.currentTarget
		var key = dojo.attr(n, "data-key")

		var self = this;	

		new apstrata.horizon.PanelAlert({
					panel: self, 
					width: 320,
					height: 140,
					iconClass: "editIcon",
					message: "Are you sure you want to regenerate the secret ?",
					actions: ['OK', 'Cancel'],
					actionHandler: function(action) {
						if (action == "OK"){
							var params = {
										"apsdb.scriptName" : "dashboard.accountUtils",
										"authKey" : key,
										"function" : "regenerateSecret"
							}
							
							var client = self.container ? self.container.client : new apstrata.sdk.Client(self.connection);
							client.call("RunScript", params, null).then(
								function(response){
									if (response.metadata.status == "success") {	
										if (response.result.errorDetail) {
											var errorMsg = response.result.errorDetail.errorDetail;
											self._alert(errorMsg ? errorMsg : "An error has occured", "errorIcon");						
										}else {						
											self._alert("The account secret for [" + key + "] has been reset ")
										}						
									}else {			
										var errorMsg = response.metadata.errorDetail;
										self._alert(errorMsg ? errorMsg : "An error has occured", "errorIcon");					
									}						
								},
								
								function(response){
									var errorDetail = response.metadata.errorDetail;
									var errorCode = response.metadata.errorCode;
									self._alert(errorDetail ? errorDetail : errorCode, "errorIcon");
								}
							);
						}
						self.closePanel();						
					}
				}
			);			
	},
	
	_open: function(e) {
		var n = e.currentTarget
		var key = dojo.attr(n, "data-key")

		// the authKey of the selected account, i.e. that of which "Worbench" button was clicked
		var targetUrl = apstrata.registry.get("apstrata.services", "targetClusterUrl");
		var url = this._getWorkbenchUrl(key, targetUrl);										
		window.open(url);	
	},
	
	_getWorkbenchUrl: function(key, targetUrl) {
		var workbenchUrl = apstrata.registry.get("apstrata.services", "workbenchUrl");		
		return (workbenchUrl + "?key=" + key + "&serviceUrl=" + encodeURIComponent(targetUrl));
	},

	_alert: function(message, iconClass){
		var self = this;
		new apstrata.horizon.PanelAlert({
			panel: self,
			width: 320,
			height: 140,
			iconClass: iconClass,
			message: message,
			actions: ['OK'],
			actionHandler: function(action){
				self.closePanel();
			}
		});
	}
		
})
