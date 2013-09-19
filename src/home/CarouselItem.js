dojo.provide("apstrata.home.CarouselItem")

dojo.require("dijit._Widget")
dojo.require("dojox.dtl._Templated")

dojo.declare("apstrata.home.CarouselItem", 
[dijit._Widget, dojox.dtl._Templated], 
{

	widgetsInTemplate: false,
	templatePath: dojo.moduleUrl("apstrata.home", "templates/CarouselItem.html"),
	
	//The inner html of the item. This will be displayed in the carousel slider
	innerHtml: "",
	
	//The inner html that will get displayed once the item is clicked
	detailsInnerHtml: "",
	
	// The image url to use when the item is clicked
	detailsImageUrl: "",
	
	// The order or index of the item in the carousel
	index: null,
	
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
		if (this.detailsInnerHtml && this.parent && this.parent.selectItem) {
			this.parent.selectItem(this);
		}
		
		dojo.addClass(this.domNode.childNodes[0], "selected");
		
		//This is a hack and needs to be fixed. There was an extra div being displayed for the first item only.
		if (this.domNode.childNodes[0].childNodes.length > 0) {
			dojo.addClass(this.domNode.childNodes[0].childNodes[0], "selected");
		}
			
			
	}
})
