dojo.provide("apstrata.wiki.widgets.PageTree");

dojo.require("dijit.Tree");
dojo.require("dojo.parser");
dojo.require("dojo.dnd.Source");
dojo.require("dijit._tree.dndSource");
dojo.require("dojo.data.ItemFileWriteStore");

dojo.declare("apstrata.wiki.widgets.PageTree",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.wiki.widgets", "templates/PageTree.html"),
		pageStore: null,
		selectedPage: null,
		pageCounter: 0,
		

		constructor: function() {
			this.pageStore = pageStore;  // needs to be passed as param
//			console.debug(this.abc);
			
//			this.pageStore = new dojo.data.ItemFileWriteStore({url: "wikidata5.json"});
//			console.dir(this.pageStore);
			dojo.extend(dijit.Tree, {
			    refresh: function() {
				this._itemNodeMap = {};
				this.model.root = null;
				if (this.rootNode) {
				    this.rootNode.destroyRecursive();
				}
				this._load();
			    }
			});
		},

		postCreate: function() {
			this.connect(this.btnDelete, "onclick", function() {
				this.deletePage();
			});

			this.connect(this.btnAdd, "onclick", function() {
				this.addPage();
			});

			this.connect(this.btnRefresh, "onclick", function() {
				this.treePages.startup();
			});
			
			this.connect(this.treePages, "onClick", function(evt) {
				this.selectPage(evt);
				console.dir(evt)
			});
			
			this.connect(this.treePages, "onLeaveRoot", function(item) {
				console.debug("leave root");
				console.dir(item);
			});

			var ps = this.pageStore;
			var pageTree = this;
			
			dojo.connect(this.pageStore, "onSet", function(item, attribute, oldValue, newValue) {
				console.debug("onSet:" + attribute);
				console.dir({item: item, attribute: attribute, oldValue: oldValue, newValue: newValue});
				
				if (attribute=="children") {
					var itemName = ps.getValue(item, "name");
					var children = ps.getValue(item, "children");
	    
					var movedItem = newValue[newValue.length-1]; 
					console.dir(movedItem)
	    //			    movedItem.atRoot = false;
					
					var f = pageTree.findPage(movedItem.dockey[0]);
	    console.debug(f.dockey + " parent is " + item.dockey)
	    
//	    			    ps.setValue(f, "atRoot", "false");
					
				}

			})
			
			
			dojo.connect(this.treePages, "onDndDrop", function(source, nodes, copy) {
				console.debug("dnd drop");
				console.dir(source);
				console.dir(nodes);
		//		console.debug("-->"+copy);
			})
			
			
		},
		
		selectPage: function(evt) {
			if (evt.dockey[0]!="root") {
				this.selectedPage = evt.dockey[0];
				this.selectedObject = evt;
			} else {
				this.selectedPage = null;
			}
		},
		
		findPage: function(dockey) {
			foundItem = null;
			
			this.pageStore.fetchItemByIdentity({ 
			    identity: dockey, 
			    onItem : function(item, request) { 
				//capture the item...or do something with it 
				foundItem = item; 
				console.debug("found");
			    } 
			});
			
			return foundItem
		},
		
		
		addPage: function() {
			var parent = this.findPage("root");
			
			var newPage = {
				dockey: 'tempId' + (this.pageCounter++),
				title: 'empty page ' + (this.pageCounter++),
				atRoot: 'true',
				content: '',
				tags: []
			}
			
			this.pageStore.newItem(newPage, {parent:parent, attribute:"children"});
		},

		deletePage: function () {
			var page = this.findPage(this.selectedPage);
			this.pageStore.deleteItem(page);

/*			    
			console.debug(this.selectedPage)
			
			this.pageStore.fetchItemByIdentity({ 
			    identity: this.selectedPage, 
			    onItem : function(item, request) { 
				//capture the item...or do something with it 
				page = item; 
				console.debug("found");
			    } 
			});
*/			
		}
		
	});
