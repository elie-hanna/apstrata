dojo.provide("apstrata.extend.Profile")

dojo.require("apstrata.home.dashboard.Profile");

dojo.declare("apstrata.extend.Profile", 
[apstrata.home.dashboard.Profile], 
{
	templatePath: dojo.moduleUrl("apstrata.extend", "templates/Profile.html"),
	loadingImagePath: apstrata.apConfig["apstrata.cms"]["baseUrl"] + "/themes/apstrata/images/loading.gif"
	
})