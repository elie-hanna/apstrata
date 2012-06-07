dojo.provide("apstrata.home.Gallery")

dojo.require("dojox.dtl._Templated")
dojo.require("dojo.store.Memory")

dojo.require("apstrata.home.CatalogData")
dojo.require("apstrata.home.GalleryItem")

dojo.declare("apstrata.home.Gallery",
[dijit._Widget, dojox.dtl._Templated], 
{
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.home", "templates/Gallery.html"),
	
	_category: "All",
	
	constructor: function() {
		var self = this
		var data = (new apstrata.home.CatalogData()).getServices()
		this.store = new dojo.store.Memory({data: data})
		
		this._search = null
	},
	
	search: function(v, category) {	
		if ((this._search != v) || (this._category != category)) {
			this._search = v
			if (category) this._category = category
			if (v && (v.trim()=="")) this._search = null
			this.refresh()
		}
	},
	
	refresh: function() {
		var self = this

		var query = this._queryParams()
		var queryOptions = this._queryOptions()

		dojo.fadeOut({
			node: self.domNode,
			onEnd: function() {
				self.render()
		
				dojo.attr(self.domNode, "id", "searchResults")
		
				dojo.when(
					self.store.query(query, queryOptions),
					function(result) {
						var i = 0
						var dv
						
						dojo.forEach(result, function(itemData) {
							if ((i % 6) == 0) dv = dojo.create("div", {"class": "line"}, self.domNode)
							var item = new apstrata.home.GalleryItem({resultSet: result, cursor: i})
							dojo.place(item.domNode, dv)
							i++
						})
						// insert an empty cell at the end because lines with 1 item get stretched
						if (dv) dojo.create("div", {"style": "display:table-cell;"}, dv)
					}
				)
			}
		}).play();
	},
	
	postCreate: function() {
		var self = this

		this.refresh()
		this.inherited(arguments)
	},

	/*
	 * Works by default for dojo.store.Memory and for filtering a label based on a string
	 * It should be overriden for different stores or for different filtering requirements 
	 */
	_queryParams: function() {
		var self = this

		return function(item) { 
			var found = (self._category == "All")
			if (!found) {
				if (self._category) {
					for (var i=0; i<item.tags.length; i++) {						
						found = (item.tags[i].toLowerCase() == self._category[0].toLowerCase())
						if (found) break
					}
				}
			}
			if (self._search) return (found) && (item.label.toLowerCase().indexOf(self._search.toLowerCase())>=0); else return found
		}
	},
	
	/*
	 * Works by default for dojo.store.Memory and for sorting the label attribute
	 * It should be overriden for different stores or for different sorting requirements 
	 */
	_queryOptions: function() {
		var _queryOptions = {}
		
		if (this._sort == 1) {
			_queryOptions = {
				sort: [{
					attribute: self.labelAttribute,
					ascending: true
				}]
			}
		} else if (this._sort == 2) {
			_queryOptions = {
				sort: [{
					attribute: self.labelAttribute,
					descending: true
				}]
			}
		} 
		
		return _queryOptions 
	},
	
})

	

