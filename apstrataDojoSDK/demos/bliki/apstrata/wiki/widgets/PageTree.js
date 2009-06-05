dojo.provide("apstrata.wiki.widgets.PageTree");

dojo.require("dijit.Tree");
dojo.require("dojo.parser");
dojo.require("dojo.dnd.Source");
dojo.require("dijit._tree.dndSource");

dojo.require("apstrata.apsdb.client.ApsdbRWStore");

dojo.declare("apstrata.wiki.widgets.PageTree",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.wiki.widgets", "templates/PageTree.html"),
		pageStore: null,
		pageCounter: 0,
		
		constructor: function(connection) {
			this.connection = connection
			this.storeName = connection.defaultStore
			this.selectedItem = null
		},

		dataLoadingStarted: function() {},
		
		dataLoadingFinished: function() {},

		postCreate: function() {
			self = this;
			this.dataLoadingStarted();

			var queryParams = {storeName: self.storeName, columns: "title,atRoot,contents,tags"}

			this.pageStore = new apstrata.apsdb.client.ApsdbRWStore(self.connection, queryParams);
			
			dojo.connect(this.pageStore, "isReady", function() {
				self.dataLoadingFinished()
			})

			var forestModel = new dijit.tree.ForestStoreModel({
				store: this.pageStore,
				query: "atRoot=\"true\"",
				rootId: "apstrata",
				rootLabel: "Apstrata Wiki",
				childrenAttrs: ["children"]
			});

			this.tree = new dijit.Tree({
						'labelAttr': 'name',
						'model': forestModel
//						,
//						'dndController': "dijit._tree.dndSource"
					});

			dojo.place(this.tree.domNode, this.treePlaceHolder, "first");

			this.connect(this.btnDelete, "onclick", function() {
				this.deletePage();
			});

			this.connect(this.btnAdd, "onclick", function() {
				this.addPage();
			});

			this.connect(this.btnRefresh, "onclick", function() {
				this.tree.startup();
			});
			
			this.connect(this.tree, "onClick", function(evt) {
				if (!evt.root) {
					this.selectPage(evt);					
				}
			});
			
			this.connect(this.tree, "onLeaveRoot", function(item) {
				console.debug("leave root");
			});

			var ps = this.pageStore;
			var pageTree = this;
			
			dojo.connect(this.pageStore, "onNew", function() {
			})

			dojo.connect(self.pageStore, "onDelete", function() {
//				self.selectedPageDeleted()
			})

			dojo.connect(this.pageStore, "onSet", function(item, attribute, oldValue, newValue) {
				console.debug("onSet:" + attribute);
				console.dir({item: item, attribute: attribute, oldValue: oldValue, newValue: newValue});
				
				if (attribute=="children") {
					var itemName = ps.getValue(item, "name");
					var children = ps.getValue(item, "children");
	    
					var movedItem = newValue[newValue.length-1]; 
					console.dir(movedItem)
					
					var f = pageTree.findPage(movedItem["@key"][0]);
				}
			})

			
			
			dojo.connect(this.tree, "onDndDrop", function(source, nodes, copy) {
				console.debug("dnd drop");
				console.dir(source);
				console.dir(nodes);
			})
			
			
		},
		
		getStore: function() {
			return this.pageStore;	
		},
		
		getSelectedItem: function() {
			return this.selectedItem;	
		},
		
		selectPage: function(evt) {
			this.selectedItem = evt
		},
		
		selectedPageDeleted: function() {
			
		},
		
		findPage: function(key) {
			foundItem = null;
			
			this.pageStore.fetchItemByIdentity({ 
			    identity: key, 
			    onItem : function(item, request) { 
				//capture the item...or do something with it 
				foundItem = item; 
			    } 
			});
			
			return foundItem
		},
		
		
		addPage: function() {
			var self = this;

			var newPage = {
				title: 'empty page ' + (self.pageCounter++),
				atRoot: 'true',
				contents: ' ',
				tags: ' '
			}
			
			this.pageStore.newItem(newPage)//, {parent:parent, attribute:"children"});
		},

		deletePage: function () {
			this.pageStore.deleteItem(this.selectedItem)
			this.selectedPageDeleted()
		}
		
	});
