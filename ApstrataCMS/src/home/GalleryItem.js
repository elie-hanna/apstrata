dojo.provide("apstrata.home.GalleryItem")

dojo.require("dojox.dtl._Templated")
dojo.require("apstrata.home.GalleryItemViewer")

dojo.declare("apstrata.home.GalleryItem",
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.home", "templates/GalleryItem.html"),
	
	constructor: function(options) {
		this.resultSet = options.resultSet
		this.data = options.resultSet[options.cursor]
		this.cursor = options.cursor
		this.gallery = options.gallery
		this.iconUrl = apstrata.apConfig["apstrata.cms"]["baseUrl"] + apstrata.apConfig["apstrata.cms"]["cmsBasePath"] + "/resources/icons/";
	},
	
	postCreate: function() {
		this.inherited(arguments)
/*
		var label = this.gallery.getHashParam(this.gallery.GALLERY_ITEM)
		if (this.data.label == label) {
			this._click()
		}
*/
	},
	
	_click: function() {
		var self = this
		new apstrata.home.GalleryItemViewer({wikiUrl: apstrata.apConfig["apstrata.services"]["wikiUrl"], iconUrl: self.iconUrl, data: self.data, resultSet: self.resultSet, cursor: self.cursor, gallery: self.gallery})
	}
})	
