dojo.provide("apstrata.dojo.widgets.ConnectionStatus");

dojo.declare("apstrata.dojo.widgets.ConnectionStatus",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.dojo.widgets", "templates/ConnectionStatus.html"),
		
		constructor: function(/* apstrata.dojo.client.apsdb.Connection */ connection) {
			var self = this;
			self.connection = connection

			dojo.connect(connection.activity, "busy", function() { self.dlgWait.show() })
			dojo.connect(connection.activity, "free", function() {
				self.dlgWait.hide();
			})			
		}
		
	});
