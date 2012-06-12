dojo.provide("apstrata.home.Slides")

dojo.require("dojox.dtl._Templated")
dojo.require("dojo.store.Memory")

dojo.declare("apstrata.home.Slides", 
[dijit._Widget, dojox.dtl._Templated], 
{

	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.home", "templates/Slides.html"),
	
	slides: [
		{title: "Content and Media", text: "Content and Media are at the heart of a mobile & web applications. Apstrata provides a full fledged Content and Rich Media management system available through its comprehensive APIs. The features include: typed fields, validation, field-level security, powerful SQL like query capability, full-text indexing and search, rich media handling and cache control."},
		{title: "simple API calls", text: "We provide a number of standard scripts that enable SSO and posting messages or content to social networks such as Facebook and Twitter. The scripts can be customized to accomodate other needed functionality."},
		{title: "Most mobile applications", text: "Most mobile applications require also the presence of a web application counterpart. The apstrata APIs are usable directly from within HTML 5 and javascript applications. We provide plenty of sample applications and code to get you started in the development of your mobile or web solution based on apstrata."}
	],
	
	actions: [
		{url: apstrata.registry.get("apstrata.cms", "urlPrefix") + "dashboard", label: "login"},
		{url: apstrata.registry.get("apstrata.cms", "urlPrefix") + "register", label: "register"}
	]
	
	
})
