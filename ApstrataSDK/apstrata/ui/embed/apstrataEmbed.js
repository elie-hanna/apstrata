dojo.require("dojo.fx")

dojo.ready(function() {
	$ = dojo.byId
	d = dojo
	q = dojo.query

	// Look for divs that have the data-embedWidgetClass attribute 
	q("[data-apstrata-embedType]").forEach(function(embedNode) {
		// instantiate the designated widgets
		doEmbed(embedNode)
	})

	function doEmbed(embedNode) {
		var klassName = d.attr(embedNode, "data-apstrata-embedType")
		
		// Make sure the class is loaded
		dojo['require'](klassName)
		dojo.ready(function() {
			var klass = dojo.getObject(klassName)
			
			// Create a placeholder div where the widget will be instantiated
			var widgetNode = d.create("div", {style: "display: none;"})
			d.place(widgetNode, embedNode)

			// Extend the embeddable widget so we can capture when it is properly instantiated to remove
			//	spinner and display widget
			if (!dojo.getObject(klassName+"-widget")) {
				dojo.declare(klassName+"-widget", [klass], {
					constructor: function(options) {
						this.widgetNode = options.apstrataWidgetNode
						this.embedNode = embedNode
					},
					
					postCreate: function() {
						var self = this
						
						// Remove spinner class
						d.removeClass(self.embedNode, "spinner")
						
						// Make widget visible and animate the opacity 
						d.style(self.widgetNode, "display", "block")
						d.style(self.widgetNode, "opacity", "0")
						this.inherited(arguments)
						
						dojo.animateProperty({
							node: self.widgetNode,
							duration: 500,
							properties: {
								opacity: 1
							}
						}).play()
					}
				})
			}

			// Instantiate the widget
			var w = new (dojo.getObject(klassName+"-widget"))({apstrataWidgetNode: widgetNode, embedNode: embedNode})
			d.place(w.domNode, widgetNode)
		})
	}
})	



