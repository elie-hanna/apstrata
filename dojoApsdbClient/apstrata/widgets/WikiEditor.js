dojo.provide("apstrata.widgets.WikiEditor");

dojo.declare("apstrata.widgets.WikiEditor",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.widgets", "templates/WikiEditor.html"),
		breadCrumbs: "",
		title: "empty page",
		contents: "",
		tags: "",
		
		// implicit constructor 
		
	});
