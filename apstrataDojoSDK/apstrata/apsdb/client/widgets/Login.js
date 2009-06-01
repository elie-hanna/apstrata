dojo.provide("apstrata.apsdb.client.widgets.Login");

dojo.declare("apstrata.apsdb.client.widgets.Login",
	[dijit._Widget, dijit._Templated, apstrata.util.logger.Logger],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.apsdb.client.widgets", "templates/Login.html"),
		key: "",
		secret: "",
		serviceUrl: "",
		store: "",
		
		constructor: function(/* apstrata.dojo.client.apsdb.Connection */ connection) {
			this.connection = connection;

			connection.loadFromCookie()

			this.serviceUrl = connection.serviceUrl
			this.store = connection.defaultStore
			
			this.key = connection.credentials.key
			this.secret = connection.credentials.secret
			this.un = connection.credentials.un
			this.pw = connection.credentials.pw
		},
		
		postCreate: function() {
			var self = this;
			
			this.dlgLogin.show();
			
			dojo.connect(self.btnLogin, "onclick", function() {
				self.connection.serviceUrl = self.fldServiceUrl.value;
				self.connection.defaultStore = self.fldStore.value;

				self.credentials = {}
				self.connection.credentials.key = self.fldKey.value;
				self.connection.credentials.secret = self.fldSecret.value;
				self.connection.credentials.un = self.fldUser.value;
				self.connection.credentials.pw = self.fldPassword.value;

				self.dlgLogin.hide();
				
				self.connection.login({
					success: function() {
						//self.dlgLogin.hide();
						self.loginSuccess()
					},
					
					failure: function() {
						self.loginFailure()
					}
				})				
			})
			
			dojo.connect(self.btnCancel, "onclick", function() {
				self.dlgLogin.hide();
				self.close();
			})
		},
				
		loginSuccess: function() {
			this.dlgLogin.hide();
		},
		
		loginFailure: function() {
			this.dlgLogin.show();
			this.spnMessage.innerHTML = "Invalid credendtials, please retry."
		},
		
		close: function() {}
	});
