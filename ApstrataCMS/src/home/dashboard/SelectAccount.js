dojo.provide("apstrata.home.dashboard.SelectAccount");

dojo.require("apstrata.horizon.Panel");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.data.ObjectStore");
dojo.require("apstrata.home.dashboard.AvailableStores");

dojo.declare("apstrata.home.dashboard.SelectAccount", 
[apstrata.horizon.Panel], 
{
	constructor: function(attrs) {
		
		this._getAccounts();		
	},

	postCreate: function() {
		
		dojo.place("<label>Select an Apstrata account</label><br>", this.dvContent, "first");
		var newStore = new dojo.data.ItemFileReadStore({	
										data : {
												identifier : "id",
												items : [ {id : "", authKey : ""}]
										}
									});				
						
		this.accountSelection = new dijit.form.FilteringSelect({
                name: "accountSelect",
                placeHolder: "Select one of your accounts",
                searchAttr: "authKey",
                store: this.accountStore ? this.accountStore : newStore,
            }, "accountSelect");
         
        dojo.connect(this.accountSelection, "onChange", dojo.hitch(this, "_onItemSelected"));
        
        dojo.place(this.accountSelection.domNode, this.dvContent);
        this.inherited(arguments);
		
	},
	
	startup: function(){
		var self = this;
		dojo.when(self.loadingDeferred, 
			
			function(response){
				if (response.metadata.status == "success") {
					self.accounts = response.result.accounts;
					var data = [];
					for (var i = 0; i < self.accounts.length; i++) {
						data.push( { id : self.accounts[i].aps_authKey, authKey : self.accounts[i].aps_authKey} );
					}					
					var newStore = new dojo.data.ItemFileReadStore( 
						{
							data : {
									identifier : "id",
									items : data
								}
						});
					
					self.accountStore = newStore;	
					self.accountSelection.store = newStore;
					self.accountSelection.startup();						
						
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
		
		this.inherited(arguments);
	},
	
	uninitialize: function() {
		if (this.accountSelection) {
			this.accountSelection.uninitialize();
			this.accountSelection = null;
		}
		
		this.accountStore = null;
		this.inherited(arguments);
	},
	
	_onItemSelected: function(item) {
		
		var self = this;
		var params = {
				"apsdb.scriptName" : "dashboard.accountUtils",
				"authKey" : item,
				"function" : "getAccount"
			}
			
		this.container.client.call("RunScript", params, null).then(
			
			function(response) {
				
				if (response.metadata.status == "success") {
					var account = response.result.account;
					var credentials = {
						key : account.aps_authKey,
						authKey : account.aps_authKey,
						secret : account.aps_authSecret
					}		
						
					}else {			
						var errorMsg = response.result.errorDetail;
						self._alert(errorMsg ? errorMsg : "An error has occured", "errorIcon");					
					}
								
				var connection = new apstrata.sdk.Connection(
					{
						credentials: credentials, 
						loginType: "master",
						serviceURL: self.container.client.connection.serviceURL,
						defaultStore: self.container.client.connection.defaultStore,
						timeout: self.container.client.connection.timeout
					});		
				var client = new apstrata.sdk.Client(connection);				
				self.openPanel(apstrata.home.dashboard.AvailableStores, {accountClient : client});
			},
			
			function(response) {
				var errorDetail = response.metadata.errorDetail;
				var errorCode = response.metadata.errorCode;
				this._alert(errorDetail ? errorDetail : errorCode, "errorIcon");
			}
		);	
		
	},

	getId: function(item) {return item.name},
	getLabel: function(item) {return item.name},
	
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