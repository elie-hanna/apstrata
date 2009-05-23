dojo.provide("apstrata.dojo.widgets.Login");

dojo.declare("apstrata.dojo.widgets.Login",
	[dijit._Widget, dijit._Templated, apstrata.dojo.client.util.Logger],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.dojo.widgets", "templates/Login.html"),
		key: "",
		secret: "",
		serviceUrl: "",
		store: "",
		
		constructor: function(/* apstrata.dojo.client.apsdb.Connection */ connection) {
			this.connection = connection;
			var s;
			
			s = dojo.cookie("apstrataWiki.serviceUrl");
			if (s!=undefined) this.serviceUrl = s
			
			s = dojo.cookie("apstrataWiki.defaultStore")
			if (s!=undefined) this.store = s
			
			var credentials = dojo.fromJson(dojo.cookie("apstrataWiki.credentials"))
			if (credentials!=undefined) {
				this.key = credentials.key
				this.secret = credentials.secret
				this.un = credentials.un
				this.pw = credentials.pw
			}
		},
		
		postCreate: function() {
			var self = this;
			
			this.dlgLogin.show();
			
			dojo.connect(self.btnLogin, "onclick", function() {
				self.connection.serviceUrl = self.fldServiceUrl.value;
				self.connection.defaultStore = self.fldStore.value;

				self.connection.credentials.key = self.fldKey.value;
				self.connection.credentials.secret = self.fldSecret.value;
				self.connection.credentials.un = self.fldUser.value;
				self.connection.credentials.pw = self.fldPassword.value;
				
				dojo.cookie("apstrataWiki.serviceUrl", self.fldServiceUrl.value, {expires: 15})
				dojo.cookie("apstrataWiki.defaultStore", self.fldStore.value, {expires: 15}) //self.fldStore.value
				dojo.cookie("apstrataWiki.credentials", dojo.toJson(self.connection.credentials), {expires: 15})
				
				self.dlgLogin.hide();
				self.connection.login(self);
			})
			
			dojo.connect(self.btnCancel, "onclick", function() {
				self.dlgLogin.hide();
				self.close();
			})
		},
				
		loginFailure: function() {
			this.dlgLogin.show();
			this.spnMessage.innerHTML = "Invalid credendtials, please retry."
		},
		
		loginSuccess: function() {
			this.dlgLogin.hide();
		},
		
		close: function() {}
	});
