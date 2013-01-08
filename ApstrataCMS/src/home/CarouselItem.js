dojo.provide("apstrata.home.CarouselItem")

dojo.require("dijit._Widget")
dojo.require("dojox.dtl._Templated")

dojo.declare("apstrata.home.CarouselItem", 
[dijit._Widget, dojox.dtl._Templated], 
{

	widgetsInTemplate: false,
	templatePath: dojo.moduleUrl("apstrata.home", "templates/CarouselItem.html"),
	
	innerHtml: "",
	detailsInnerHtml: "",
	detailsImageUrl: "",
	parent: null,
	
	constructor: function(params) {
		dojo.mixin(this,params);
	},

	postCreate: function() {		
		this.domNode.innerHTML = this.innerHtml;
		this.inherited(arguments);
		
		dojo.connect(this.domNode, "onclick", dojo.hitch(this, this.displayDetails));
	},
	
	displayDetails: function() {
		if (this.detailsInnerHtml && this.parent && this.parent.itemClicked) {
			this.parent.itemClicked(this);
		}
	}
})
