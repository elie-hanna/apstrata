dojo.provide("apstrata.home.Carousel")

dojo.require("dijit._Widget")
dojo.require("dojox.dtl._Templated")
dojo.require("dijit.form.ValidationTextBox")

dojo.require("apstrata.sdk.Client");
dojo.require("apstrata.home.CarouselItem");

dojo.declare("apstrata.home.Carousel", 
[dijit._Widget, dojox.dtl._Templated], 
{

	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.home", "templates/Carousel.html"),
	
	//The dockeys of the pages to be displayed in the carousel
	itemsIds: null,
	
	//The pages to be displayed in the carousel
	items: null,
	
	connection: null,
	store: null,
	
	/**
	 * @param: params.items = array of items to use as content of the carroussel
	 */
	constructor: function(params) {
		if (params) {
			if (params.connection) {
				this.connection = params.connection;
			}
			
			if (params.itemsIds) {
				this.itemsIds = params.itemsIds;
			}
			
			if (params.items) {
				this.pages = params.items;
			}
			
			if (params.store) {
				this.store = params.store;
			}
		}
	},

	postCreate: function() {
		
		if (this.connection) {
			var client = new apstrata.sdk.Client(this.connection);
			
			if (this.itemsIds) {
				var queryCondition = "apsdb.documentKey = \"" + this.itemsIds[0] + "\"";
				for (var i = 1; i < this.itemsIds.length; i++) { 
					queryCondition = queryCondition + " or apsdb.documentKey = \"" + this.itemsIds[i] + "\"";
				};
				
				var params = {
					"apsdb.store": this.store,
					"apsdb.queryFields": "title, section1, section2, regularIcon",
					"apsdb.query": queryCondition		
				};
				
				client.call("Query", params).then(
			
					function(response) {
						this.items = response.result.documents; 
					},
				
					function(response) {
						
					}
				);
			}
		}

		if (this.items) {
		
			if (this.itemsIds) {	
				for (var i = 0; i < this.itemsIds.length; i++) {
					for (j = 0; j < this.items.length; j++) {
						if (this.items[j]["key"] == this.itemsIds[i]) {
							this.addItem(this.pages[j], j);
						}
					}
					
					
				}
			} else {
				for (j = 0; j < this.items.length; j++) {
					this.addItem(this.items[j], j);
				}
			}			
		}

		this.inherited(arguments)	
		
	}, 
	
	startup: function() {

		this.inherited(arguments);
		
	},
	
	addItem: function(item, index) {
			var itemWidget = new apstrata.home.CarouselItem({
				innerHtml: item.section2,
				detailsInnerHtml: item.section1,
				detailsImageUrl: (this.connection ? this.getUrl(item.regularIcon, item.key) : item.regularIcon),
				parent: this
			});
			
			dojo.place(itemWidget.domNode, this.slidesControls);
			
			if (index == 0) {
				itemWidget.displayDetails();
			}
	},
	
	getUrl: function(imageName, docKey) { 
		var params = {
			"apsdb.fieldName": "regularIcon",
			"apsdb.fileName": imageName,
			"apsdb.store": "apstrata",
			"apsdb.documentKey": docKey
		}; 
		
		var imageUrl = this.connection.sign("GetFile", dojo.objectToQuery(params)).url; 
		return imageUrl;
	},
	
	itemClicked: function(item) {
		var itemCloned = dojo.clone(item);
		this.slideImage.src = itemCloned.detailsImageUrl;		
		this.slideDetails.innerHTML = itemCloned.detailsInnerHtml;
		
		var selectedNodes = dojo.query(".selected");
		if (selectedNodes) {
			for (var x = 0; x < selectedNodes.length; x++) {
				dojo.toggleClass(selectedNodes[x], "selected");
			}
		}
	}
})
