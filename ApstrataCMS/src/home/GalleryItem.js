dojo.provide("apstrata.home.GalleryItem")

dojo.require("dojox.dtl._Templated")
dojo.require("apstrata.home.GalleryItemViewer")

dojo.declare("apstrata.home.GalleryItem",
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.home", "templates/Item.html"),
	
	constructor: function(options) {
		this.resultSet = options.resultSet
		this.data = options.resultSet[options.cursor]
		this.cursor = options.cursor
	},
	
	postCreate: function() {
		
		this.inherited(arguments)
	},
	
	_click: function() {
		var self = this
		new apstrata.home.GalleryItemViewer({data: self.data, resultSet: self.resultSet, cursor: self.cursor})
	}
})	
