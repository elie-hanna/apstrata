dojo.provide("apstrata.apsdb.client.widgets.Img");

dojo.require("dijit.form.TextBox")
dojo.require("dijit.Dialog")
dojo.require("dojox.dtl._Templated")

dojo.declare("apstrata.apsdb.client.widgets.Img",
	[dijit._Widget, dojox.dtl._Templated, apstrata.util.logger.Loggable],
	{
		widgetsInTemplate: true,
		templateString: '<span><img src="{{ url }}"></span>',
		connection: null,
		src: "",
		url: "",
		
		constructor: function() {
		},
		
		postCreate: function() {
			var self = this
			
			var attrs = this.src.split('/')

			attrs = {
					store: attrs[0],
					documentKey: attrs[1],
					fieldName: attrs[2],
					fileName: attrs[3],
					setContentDisposition: "false"
				}
			
			var get = new apstrata.apsdb.client.GetFile(this.connection)
			this.url = get.getUrl(attrs)
			this.render()
		},
	});