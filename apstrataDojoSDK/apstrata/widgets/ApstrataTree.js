dojo.provide("apstrata.widgets.ApstrataTree")

dojo.require("dijit.Tree");
dojo.require("dijit.tree.ForestStoreModel");

dojo.require("apstrata.apsdb.client.Client")
dojo.require("apstrata.apsdb.client.ItemApsdbWriteStore")
dojo.require("apstrata.apsdb.client.widgets.ConnectionStatus")

dojo.declare("apstrata.widgets.ApstrataTree", 
				[dijit._Widget, dijit._Templated], 
				{
					
					templateString: "<div><div dojoAttachPoint='dvTree'></div></div>",
					store: null,
					query: "",
					rootLabel: "root",
					showRoot: false,
					
					constructor: function(attrs) {
						var self = this
						if (attrs && attrs.store && attrs.query) {
							this.store = attrs.store
							this.query = attrs.query

							if (attrs.rootLabel) self.rootLabel = attrs.rootLabel
							if (attrs.showRoot) self.showRoot = attrs.showRoot

							this.model = new dijit.tree.ForestStoreModel({
							        store: self.store,
							        query: {query: self.query},
							        rootLabel: self.rootLabel,
									rootId: "rootId",
									childrenAttrs: ["children"]
							})
							
						}
					},
					
					postCreate: function() {
						var self = this
						if (this.model) {
						    this.tree = new dijit.Tree({
						        model: self.model,
								showRoot: self.showRoot
						    })
							
							dojo.place(this.tree.domNode, this.dvTree, "first")
						} else {
							this.dvTree.innerHTML = "Please provide a data store!"
						}
					}
				})	
