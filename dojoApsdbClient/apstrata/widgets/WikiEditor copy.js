dojo.provide("apstrata.widgets.WikiEditor");



dojo.declare("apstrata.widgets.WikiEditor",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templateString: null,
		templatePath: dojo.moduleUrl("apstrata.widgets", "templates/WikiEditor.html"),

		constructor: function(_breadCrumbs) {
			this.title = "wiki page title";
			this.tags = "tag1, tag2, tag3";
			this.breadCrumbs = "<a href=\"#\">Section</a> / <a href=\"#\">Page 1</a> / <a href=\"#\">Page 2</a> / <a href=\"#\">Page 3</a>";
			this.contents = "<p>this is a wiki page.</p>";
	
			if (_breadCrumbs != undefined) this.breadCrumbs = _breadCrumbs;

//			constructor: function(_title, _tags, _breadCrumbs, _content) {
//			if (_title != undefined) if (_title != null) this.title = _title;
//			if (_tags != undefined) this.tags = _tags;
//			if (_content != undefined) this.contents = _content;
		},

		postCreate: function(){
			this.inherited(arguments);

		},
		
		startup: function(){
			this.inherited(arguments);
		}		
	});
