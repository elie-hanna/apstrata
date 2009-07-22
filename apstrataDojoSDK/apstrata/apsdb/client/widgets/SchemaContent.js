dojo.provide("apstrata.apsdb.client.widgets.SchemaContent");

dojo.require("dijit.form.TextBox")
dojo.require("dijit.Dialog")

dojo.declare("apstrata.apsdb.client.widgets.SchemaContent",
	[dijit._Widget, dijit._Templated, apstrata.util.logger.Logger],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.apsdb.client.widgets", "templates/SchemaContent.html"),
		result: "",
		
		constructor: function(/* apstrata.dojo.client.apsdb.Connection */ connection , result) {
			this.result = result
		},
		
		postCreate: function() {
			var self = this;
			
			this.dlgSchemaContent.show();
			self.fldSchemaContent.value = self.result;
			
		},
				
		loginSuccess: function() {
			this.dlgLogin.hide();
		},
		
		loginFailure: function() {
		},
		
		close: function() {}
	});