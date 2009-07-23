dojo.provide("apstrata.apsdb.client.widgets.LoginArea");

dojo.require("apstrata.apsdb.client.Connection")
dojo.require("apstrata.apsdb.client.widgets.Login")

dojo.declare("apstrata.apsdb.client.widgets.LoginArea", 
	[dijit._Widget, dijit._Templated], 
	{
		widgetsInTemplate: true,
		templateString: "<span><span dojoAttachPoint='spnMessage'></span> <a href='#' dojoAttachPoint='linkLogout'><span dojoAttachPoint='spnLabel'></span></a></span>",
		connection: null,
		
		constructor: function(attrs) {
			if (attrs.connection) this.connection = attrs.connection
		},
		
		processLoginInfo: function() {
			var status = this.connection.hasCredentials()
			var message
			var label
			
			if (status) {
				label = "logout"
				
				if (this.connection.credentials.un!="") {
					message = "User: " + this.connection.credentials.un
				} else {
					message = "Account: " + this.connection.credentials.key
				}
			} else {
				label = "login"
				message = ""
			}
	
			this.spnMessage.innerHTML = message
			this.spnLabel.innerHTML = label
			
			this.onChange(status)
		},
		
		postCreate: function() {
			var self = this
	
			this.processLoginInfo()
			
			dojo.connect(self.linkLogout, "onclick", function() {
				if (self.connection.hasCredentials()) {
					self.connection.logout()
	
					self.processLoginInfo()
					//self.domNode.innerHTML = dojo.string.substitute(self.templateString, self)
				} else {
	                var login = new apstrata.apsdb.client.widgets.Login(self.connection)		
	
	                dojo.connect(login, "loginSuccess", function() {
						self.processLoginInfo()
						//self.domNode.innerHTML = dojo.string.substitute(self.templateString, self)
	                });
	                dojo.connect(login, "close", function() {
	                    alert('Adieu mon ami, a bientot!')
	                });
	
				}
			})
		},
		
		onChange: function(status) {}
	})

