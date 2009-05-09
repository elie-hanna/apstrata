dojo.provide("apstrata.wiki.widgets.WikiEditor");

dojo.declare("apstrata.wiki.widgets.WikiEditor",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.wiki.widgets", "templates/WikiEditor.html"),
		dockey: "",
		title: "empty page",
		breadCrumbs: "",
		contents: "",
		tags: "",
		
		// implicit constructor
		constructor: function(selectedObject) {
		},
		
		postCreate: function() {
		}		
	});
