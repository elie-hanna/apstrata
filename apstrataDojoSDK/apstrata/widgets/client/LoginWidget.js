dojo.provide('apstrata.widgets.client.LoginWidget');

dojo.require('apstrata.widgets.SlidingPanel');

dojo.require('dijit.form.Button');
dojo.require('dijit.form.Form');
dojo.require('dijit.form.ValidationTextBox');

dojo.require('apstrata.Connection');

dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojox.layout.RadioGroup');

dojo.require('dojox.dtl._Templated');

dojo.declare("apstrata.widgets.client.LoginWidget", 
	[dijit._Widget, dojox.dtl._Templated, apstrata.util.logger.Loggable], 
{
	widgetsInTemplate: true,
    templatePath: dojo.moduleUrl("apstrata.widgets.client","templates/LoginWidget.html"),
	offsetFromCenter: 0,
	connection: null,
	
	constructor: function(attrs) {
		var self = this

		if (attrs.connection) this.connection = attrs.connection;
		else this.connection = new apstrata.Connection()

		if (attrs.client) this.client = attrs.client

		// Init all variables used in template	
		this.errorMessage = ""
		this.assumeLoggedIn = false
		this.accountTypeLabel = ""
		this.accountMessage = ""
	},
	
	postCreate: function() {
		this._render()
		this.inherited(arguments)
	},
	
	_render: function() {
		// controls what to show in the widget
		this.assumeLoggedIn = this.connection.hasCredentials()
		if (this.assumeLoggedIn) {
			if (this.connection.getLoginType()==this.connection.LOGIN_MASTER) {
				this.accountTypeLabel = "Logged in as Master Account: "
			} else if (this.connection.getLoginType()==this.connection.LOGIN_USER) {
				this.accountTypeLabel = "Logged in as User: " 
			}
			
			this.accountMessage = this.connection.getAccountId()
		} else {
			this.accountTypeLabel = ""
			this.accountMessage = "Login"
		}

		this.render()			// Causes dojo.dtl._Templated to be regenerated
		this.slider.resize()	// Causes the SlidingPanel to reposition in case the contents have changed
	},
	
	login: function() {
		var self = this
		if (this.selectedPage == "User") {
			self.connection.credentials = this.frmLoginUser.getValues()
			self.connection.defaultStore = this.frmSettings.getValues().defaultStore
			self.connection.serviceUrl  = this.frmSettings.getValues().serviceUrl
		} else {
			self.connection.credentials = this.frmLoginAdmin.getValues()
			self.connection.defaultStore = this.frmSettings.getValues().defaultStore
			self.connection.serviceUrl  = this.frmSettings.getValues().serviceUrl
		}
		
		self.connection.login({
			success: function() {
				self.errorMessage = ""
				self._render()

				self.loginSuccess()
			},
			
			failure: function(error, message) {
//				self.error(error)
//				self.error(message)
				
				self.errorMessage = message
				self._render()

				self.loginFailure()
				self.keepOpen(true)
			}
		})
	},
	
	keepOpen: function(keepOpen) {
		this.slider.keepOpen(keepOpen)
	},
	
	editProfile: function() {
	},

	logout: function() {
		this.connection.logout()
		this.assumeLoggedIn = this.connection.hasCredentials()
		this._render()		
	},
	
	loginSuccess: function() {},
	loginFailure: function() {}
})

