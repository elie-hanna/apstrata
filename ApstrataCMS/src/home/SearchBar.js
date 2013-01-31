dojo.provide("apstrata.home.SearchBar")

dojo.require("dojox.dtl._Templated")
dojo.require("dojo.store.Memory")

dojo.require("dijit.form.TextBox")

dojo.declare("apstrata.home.SearchBar",
[dijit._Widget, dojox.dtl._Templated], 
{
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.home", dojo.getObject("searchBarTemplate") ? searchBarTemplate : "templates/SearchBar.html"),
	
//	_categories: ["All", "|", "REST API", "|", "Identity", "Persistence", "Messaging", "Push Notification", "Orchestration", "|", "Script", "Widget", "Social", "|", "HTML5", "Mobile", "|", "Application", "SDK"],
	_categories: ["All", "|", "REST API", "|", "Identity", "Persistence", "Messaging", "Push Notification", "Orchestration", "|", "Widget", "Social", "|", "HTML5", "Mobile", "|", "SDK"],
	
	_emptyMessage: "search here",
	
	constructor: function(attrs) {
		dojo.mixin(this, attrs)
		this.searchTerm = ""
		this.categories = ["All"]
	},
	
	postCreate: function() {
		var v = this.fldSearch.get("value")
		if (v.trim() == "") this.fldSearch.set("value", this._emptyMessage)
	},
	

	focus: function() {
		var v = this.fldSearch.get("value")
		if (v.trim() == this._emptyMessage) this.fldSearch.set("value", "")
		
		if (apstrata.slides) apstrata.slides.openSlide(2)
	},
	
	blur: function() {
		var v = this.fldSearch.get("value")
		if (v.trim() == "") {
			this.fldSearch.set("value", this._emptyMessage)
			this.onSearch(v, this.categories)
		} else this.onSearch(v, this.categories)
	},
	
	changeCategory: function(n) {
		var self = this
		this.categories = [dojo.attr(n.currentTarget, "data-category")]
		dojo.query(".category").forEach(function(n){
			if (dojo.attr(n, "data-category")==self.categories[0]) {
				dojo.addClass(n, "selected")
			} else {
				dojo.removeClass(n, "selected")
			}
		})	
		
		this.onSearch(this.searchTerm, this.categories)

		if (apstrata.slides) apstrata.slides.openSlide(2)
	},
	
	change: function(v) {
		if (v == this._emptyMessage) {
			this.searchTerm = ""
			this.onSearch("", this.categories)
		} else {
			this.searchTerm = v
			this.onSearch(v, this.categories)
		} 
	},
	
	keyPress: function(e) {
		if (e.keyCode == 13) this.blur()
	},
	
	onSearch: function(searchTerm, category) {},	
})