dojo.provide('apstrata.wiki.widgets.BlogEntry');

dojo.declare('apstrata.wiki.widgets.BlogEntry',
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl('apstrata.wiki.widgets', 'templates/BlogEntry.html'),

		constructor: function(params) {
			this.title = params.store.getValue(params.item, "title")
			this.contents = params.store.getValue(params.item, "contents")
//			this.tags = params.store.getValue(params.item, "tags")
			this.tags = "xxx"
		},
		
		postCreate: function() {
		}
	});
