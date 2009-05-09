dojo.provide("apstrata.wiki.widgets.PageTree");

dojo.require("dijit.Tree");
dojo.require("dojo.parser");
dojo.require("dojo.dnd.Source");
dojo.require("dijit._tree.dndSource");

dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");

dojo.declare("apstrata.wiki.widgets.PageTree",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.wiki.widgets", "templates/PageTree.html"),
		selectedPage: null,
		pageCounter: 0,

		constructor: function() {
			this.pageStore = pageStore;
			console.dir(pageStore);
			console.debug(this.abc);
		},

		postCreate: function() {
			this.connect(this.btnDelete, "onclick", function() {
				this.deletePage();
			});

			this.connect(this.btnAdd, "onclick", function() {
				this.addPage();
			});
			
			this.connect(this.treePages, "onClick", function(evt) {
				this.selectPage(evt);
				console.dir(evt)
			});
		},
		
		selectPage: function(evt) {
			if (evt.dockey[0]!="root") {
				this.selectedPage = evt.dockey[0];
				this.selectedObject = evt;
			} else {
				this.selectedPage = null;
			}
		},
		
		addPage: function() {
			var parent; 
			this.pageStore.fetchItemByIdentity({ 
			    identity: "root", 
			    onItem : function(item, request) { 
				//capture the item...or do something with it 
				parent = item; 
				console.debug("found");
			    } 
			});
			
			var newPage = {
				dockey: 'tempId' + (this.pageCounter++),
				title: 'empty page ' + (this.pageCounter++),
				content: '',
				tags: []
			}
			
			this.pageStore.newItem(newPage, {parent:parent, attribute:"children"});
			
//			this.pageStore.newItem({ name:"new page " + (this.pageCounter++), type:'section'}, {parent:parent, attribute:"children"});
		},

		deletePage: function () {
			var page;
			    
			console.debug(this.selectedPage)
			
			this.pageStore.fetchItemByIdentity({ 
			    identity: this.selectedPage, 
			    onItem : function(item, request) { 
				//capture the item...or do something with it 
				page = item; 
				console.debug("found");
			    } 
			});
			
			this.pageStore.deleteItem(page);
		}
		
	});
