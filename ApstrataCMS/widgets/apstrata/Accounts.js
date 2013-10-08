dojo.provide("apstrata.extend.Accounts")

dojo.require("apstrata.home.dashboard.Accounts");

dojo.declare("apstrata.extend.Accounts", 
[apstrata.home.dashboard.Accounts], 
{

	templatePath: dojo.moduleUrl("apstrata.extend", "templates/Accounts.html"),
	
	constructor: function(args) {
		this.loadingImagePath = apstrata.apConfig["apstrata.cms"]["baseUrl"] + "/themes/apstrata/images/loading.gif";
	}		
})
