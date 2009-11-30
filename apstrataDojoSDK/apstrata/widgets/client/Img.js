dojo.provide("apstrata.widgets.client.Img");

dojo.require("dojox.dtl._Templated")

dojo.declare("apstrata.widgets.client.Img",
	[dijit._Widget, dojox.dtl._Templated],
	{
		widgetsInTemplate: true,
		templateString: '<span><img src="{{ url }}"></span>',
		connection: null,
		src: "",
		url: "",
		connection: null,
		
		constructor: function(attrs) {
			var self = this
				
			if (attrs) {
				this.connection = attrs.connection
				var attrs = this.src.split('/')
	
				attrs = {
						store: attrs[0],
						documentKey: attrs[1],
						fieldName: attrs[2],
						fileName: attrs[3],
						setContentDisposition: "false"
					}
				
				var get = new apstrata.GetFile(this.connection)
	
				this.url = get.getUrl(attrs)
			}
		},
		
		postCreate: function() {
		},
	});