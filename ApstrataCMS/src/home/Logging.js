dojo.provide("apstrata.home.Logging");

dojo.require("dojox.dtl._Templated");
dojo.require("dijit._Widget");

dojo.require("apstrata.sdk.TokenConnection")

dojo.declare("apstrata.home.Logging",
[dijit._Widget, dojox.dtl._Templated], 
{
	signupUrl: '',
	signupLabel: 'Signup',
	
	loginLabel: 'Login',
	loginUrl:'',
	
	logoutLabel: 'Log out',
	logoutUrl: '',
	
	isLoggedIn: false,
	credentials: {},
	
	dashboardUrl: '',
	dashboardLabel: "Dashboard",
	
	widgetsInTemplate: false,
	templatePath: dojo.moduleUrl("apstrata.home", "templates/Logging.html"),
	
	
	constructor: function(attrs){
		dojo.mixin(this, attrs);
		
		var theConnection = new apstrata.sdk.TokenConnection();
		this.isLoggedIn = theConnection.isLoggedIn();
	},
	
	logout: function() {
		var self = this;
		var connection = new apstrata.sdk.TokenConnection({credentials: this.credentials, isUseParameterToken: true});	
		if (connection) {
			connection.logout({
				success: function() {
					window.location = self.logoutUrl;	
				},
				failure: function() {
					
				}
			})		
		}
	}	
	
	
})
