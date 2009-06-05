dojo.provide('apstrata.wiki.widgets.Blog');

dojo.require('apstrata.wiki.widgets.BlogEntry')
dojo.require('apstrata.apsdb.client.ApsdbRWStore')

dojo.declare('apstrata.wiki.widgets.Blog',
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
//		templatePath: dojo.moduleUrl('apstrata.wiki.widgets', 'templates/BlogEntry.html'),
		templateString: "<div><div dojoAttachPoint='entries'></div></div>",

		constructor: function(connection, node) {
			this.node = node
			var queryParams = {storeName: "wiki", columns: "title,atRoot,contents,tags"}
			this.store = new apstrata.apsdb.client.ApsdbRWStore(connection, queryParams)
		
		},
		
		postCreate: function() {
			var self = this
			
			var request = {
				query: "atRootX!=\"Xtrue\"",
				onComplete: function(items, request) {
					for (var i=0; i < items.length; i++) {
						var entry = new apstrata.wiki.widgets.BlogEntry({store: self.store, item: items[i]})
						dojo.place(entry.domNode, self.entries, "first")
					}
				}
			}

			self.store.fetch(request)
		}
	})
