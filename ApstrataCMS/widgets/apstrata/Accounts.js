dojo.provide("apstrata.extend.Accounts")

dojo.require("apstrata.home.dashboard.Accounts");

dojo.declare("apstrata.extend.Accounts", 
[apstrata.home.dashboard.Accounts], 
{

	templatePath: dojo.moduleUrl("apstrata.extend", "templates/Accounts.html")
		
})
