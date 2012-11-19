dojo.provide("apstrata.cms.PagesGrid");

dojo.require("dojox.grid.EnhancedGrid");
dojo.require("dojox.grid.enhanced.plugins.Pagination");
dojo.require("dijit.Editor")
dojo.require("dijit._editor.plugins.FontChoice");  // 'fontName','fontSize','formatBlock'
dojo.require("dijit._editor.plugins.TextColor");
dojo.require("dijit._editor.plugins.LinkDialog");
dojo.require("dojox.form.ListInput");
dojo.require("dijit.form.Button");
 
dojo.require("apstrata.horizon.Grid");
dojo.require("apstrata.horizon.GridFTSearch");
dojo.require("apstrata.cms.PagesGridFTSearch");
dojo.require("apstrata.cms.PageEditor");

/**
 * This class queries an Apstrata store for all page documents and displays them in a horizon grid
 * Note: Make sure you imported the dojox grid css files
 */
dojo.declare("apstrata.cms.PagesGrid", 
[apstrata.horizon.Grid], 
{
	// the 'grid store', i.e. the store used to wrap the pages data in the grid
	// it is passed to the dojox.grid.EnhancedGrid
	gridStore: null,
	
	// the object store responsible for fetching the pages from the apstrata store
	// it should be wrapped by the former
	dataStore: null,
	
	connection: null,
	gridParams: null,
	maxRows: 20,
	
	// the panel containing the details of the selected page document
	openedPanel: null,
	
	// the query to execute to fetch the page documents
	_queryExpression: "documentType =\"page\"",
	
	// the fields to returns when fetching the page documents 
	_queryFields: "title, apsdb.creator, apsdb.lastModifiedTime, pageStatus, category",
		
	// this attribute specifies the 'structure' of the grid, i.e. the matching between the column names
	// and the fields returned by the query executed by the dataStore   
    _gridStructure: null,
	
	constructor: function(credentials) {
		
		this.connection = credentials ?  new apstrata.sdk.Connection(credentials) 
								: new apstrata.sdk.Connection({credentials: this.container.connection});
		
		this._setGridStructure();
		
		// Create the dataStore, i.e the object store instance responsible for fetching the pages		
		this.dataStore = new apstrata.sdk.ObjectStore({
				connection: this.connection,
				store: "apstrata",
				queryFields: this._queryFields,
				queryExpression: this._queryExpression 
			}); 
			
		// gridClass is inherited from apstrata.horizon.Grid. It is used by the parent class if defined
		// if not defined, the parent Grid will use dojox.grid.DataGrid
		this.gridClass = dojox.grid.EnhancedGrid;
		
		// gridParams is inherited from apstrata.horizon.Grid. It is expected by the parent class
		this.gridParams = this._getGridParams();	
		
		// Override default this.filterClass
		this.filterClass = apstrata.cms.PagesGridFTSearch; 			
		this.inherited(arguments);
	},	
	
	/**
	 * Opens the PageEditor on a new page document.
	 */
	newItem: function(event) {
		
		this.openPanel(apstrata.cms.PageEditor, {
										
			maximizable: true, 
			attrs: {}
		});
	},
	
	/**
	 * Opens the PageEditor on a page document.
	 * First retrieves the selected document by docKey from the store
	 */
	editItems: function(event) {
				
		var self = this;
		this.showAsBusy(true, "Loading page...");	
		
		// identify the index of the item that was selected in the grid
		var index = this._grid.selection.selectedIndex;
		var item = this._grid.getItem(index);
		if (!item) {
			return;
		}
		
		// retrive the corresponding page document from the store. Set the queryFields
		// attribute of the store to return all fields
		this.dataStore.queryFields = "apsdb.documentKey, title, section1, section2, smallIcon, regularIcon, attachments, template, parent, documentType, css, javascript, description, category, tags, keywords, publishedDate, document.readACL, pageStatus";		
		this.dataStore.get(item.key).then( 
			
			// if successful, open the page document in the PageEditor instance
			function(doc) {
													
				self.openPanel(apstrata.cms.PageEditor, {
										
					maximizable: true, 
					attrs: {
						 doc: doc
					}
				});
				
				self.showAsBusy(false);	
			},
			
			function(error) {
				
				self.showAsBusy(false);	
				var errorDetail = response.metadata.errorDetail;
				var errorCode = response.metadata.errorCode;
				self._alert(errorDetail ? errorDetail : errorCode, "errorIcon");
			}
		);
		
		// re-set the store queryFields attribute to the initial value
		this.dataStore.queryFields = this._queryFields;
		
	},
	
	/*
	 * Overrides the inherited filter method (empty)
	 * If full text search is defined, will use it to filter the content of the grid
	 * If status is defined, will use it to filter the content of the grid
	 */
	filter: function(attr) {
		
		this.showAsBusy(true, "Filtering...");
		this.dataStore.ftsQuery = attr.search;
		
		// If status is defined, change the query expression of the store to include it
		if (attr.status) {
			
			this.dataStore.queryExpression = this.dataStore.queryExpression + " AND pageStatus=\"" + attr.status + "\"";
		}
		
		this.dataStore.query({}, null);
		this.refresh();
		this.showAsBusy(false);
						
		// reset the query expression of the store to its initial value;
		this.dataStore.queryExpression =  this._queryExpression
	},
	
	refresh: function() {
		
		this._grid.setStructure(this._grid.structure);		
	},
	
	_setGridStructure: function() {
		
		this._gridStructure = [
			{"name": "Title", "field": "title", "width": "200px"},
			{"name": "Author", "field": "apsdb.creator", "width": "200px"},
			{"name": "Status", "field": "pageStatus"},
			{"name": "Category", "field": "category"},			
			{"name": "Last modified", "field": "apsdb.lastModifiedTime", "width": "200px"}
	    ]
	},
	
	/*
	 * Creates the necessary grid parameters to pass to the parent class through the gridParams property
	 * These parameters are expected by dojox.grid.EnhancedGrid.
	 * Note: if you need pagination, do not forget to require "dojox.grid.enhanced.plugins.Pagination",
	 * otherwise you will get a "TypeError: registry is undefined" referencing the _PluginManager class
	 */
	_getGridParams: function() {			
					
		// We need to wrap the apstrata.sdk.ObjectStore, i.e. dataStore with an adapter in order to provide 
		// a store that fits with the dojox.grid.EnhancedGrid specifications	
		// Note: you do not have to require this class as it is defined inside apstrata.sdk.ObjectStore.js
		this.gridStore = new apstrata.sdk.ObjectStoreAdaptor({
			
			objectStore: this.dataStore
		});
			
		var gridParams = {
			
			store: this.gridStore,
			structure: [
				
				this._gridStructure
			],						
			rowSelector: "15px",
			height: "20em",
			autoWidth: true,			
			plugins: {
				
				// we can pass a boolean for default values of a configuration object as shown here
				pagination: { 
					pageSizes: ["10", "25", "50", "100"],
					description: true,
					sizeSwitch: true,
					pageStepper: true,
					gotoButton: false,
					defaultPageSize: this.maxRows,
					maxPageStep: 7,	
					position: "bottom"
				}
			}
		};
		
		return gridParams;
	},
	
	/*
	 * Formats the date cells 
	 */
	_formatDate: function(date) {
		
		if (date) {
			date = date.replace(/\T/g, " ")
		}
		return dojo.date.locale.format(date, {datePattern: "yyyy-MM-dd kk:mmZ"});  
	},
	
	/*
	 * Displays an alert message
	 */
	_alert: function(message, iconClass){
		
		var self = this;
		new apstrata.horizon.PanelAlert({
			panel: self,
			width: 320,
			height: 140,
			iconClass: iconClass,
			message: message,
			actions: ['OK'],
			actionHandler: function(action){
				self.closePanel();
			}
		});
	}
	
});