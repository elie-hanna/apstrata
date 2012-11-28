dojo.provide("apstrata.cms.PageSelector");

dojo.require("dojox.dtl._Templated");
dojo.require("apstrata.horizon.util._Templated");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.SimpleTextarea");
dojo.require("dojox.grid.EnhancedGrid");
dojo.require("dojox.grid.enhanced.plugins.Pagination");
dojo.require("dojox.grid._CheckBoxSelector");

dojo.require("apstrata.sdk.ObjectStore");
dojo.require("apstrata.sdk.Connection");

dojo.declare("apstrata.cms.PageSelector", 
[dijit._Widget, dojox.dtl._Templated], 
{
	
	templatePath: dojo.moduleUrl("apstrata.cms", "templates/PageSelector.html"),
	widgetsInTemplate: true,
	
	_grid: null,
	_store: null,
	_apstrataStore: "apstrata",
	_container: null,
	_queryExpression: "documentType =\"page\"",	
	_queryFields: "title, apsdb.creator, apsdb.lastModifiedTime, pageStatus, category",
	_structure: [],
	_connection: null,
	_selectedPages: [],
	value: "",
	
	constructor: function(params) {
		
		this._connection = params.connection;
		this._apstrataStore = params.store ? params.store : this._apstrataStore;
		this._queryFields = params.queryFields ? params.queryFields : this._queryFields;
		this._selectedPages = params.pages ? params.pages : this._selectedPages; 
		this._queryExpression = params.queryExpression ? params.queryExpression : this._queryExpression;
		this.setStructure(params.structure);
		this._setStore();		
	},	
	
	postCreate: function() {
				
		this.inherited(arguments);
		this.startup();
	},
	
	set: function(key, value) {
		
		if (key == "value" ) {
			
			this._selectedPages = this._selectedPages.concat(value.split(","));
			this.readView.set("value", this._stringifyArray(this._selectedPages));
			this.inherited(arguments);
		}
		
		this.inherited(arguments);
	},	
	
	get: function(key) {
		
		if (key == "value") {
			
			return this.readView.get("value");
		}else  {
			
			return this.inherited(arguments);
		}
	},
	
	setStructure: function(structure) {
		
		this._structure = structure;
	},
	
	getStructure: function() {
		
		var defaultStructure = [
				{"name": "Title", "field": "title", "width": "200px"},
				{"name": "Author", "field": "apsdb.creator", "width": "200px"},
				{"name": "Status", "field": "pageStatus"},
				{"name": "Category", "field": "category"},			
				{"name": "Last modified", "field": "apsdb.lastModifiedTime", "width": "150px"}
			];
		
		if (this._structure) {
			return this._structure;
		}
		
		return defaultStructure;
	},
	
	startup: function() {
				
		// Create the grid, place it on the corresponding node and start it up so it is displayed correctly
		this._setGrid();
		dojo.place(this._grid.domNode, this.pageSelectorRoot);
		this._grid.startup();		
		
		// Connect the onclick event of the view to the showGrid method ==> when the text are is
		// clicked, it opens the grid to select pages from
		var showGrid = dojo.hitch(this, this.showGrid);
		dojo.connect(this.readView, "onClick", showGrid);		
		
		// Connect the confirm, cancel and close ("X") buttons + ESC event to corresponding private methods
		var confirmSelection = dojo.hitch(this, this._confirmSelection);
		dojo.connect(this.confirmSelection, "onclick", confirmSelection);
		var cancelSelection = dojo.hitch(this, this._cancelSelection);
		dojo.connect(this.cancelSelection, "onclick", cancelSelection);
		dojo.connect(this.dialog, "onCancel", cancelSelection);
		
		// Fill the textarea (readView) with a string built from the selected pages	
		this.readView.value = "";
		this.readView.value = this._stringifyArray(this._selectedPages);
		
		this.inherited(arguments);
	},
	
	showGrid: function(event) {
		
		dojo.style(this.dialog.closeButtonNode,"display","inline");
		this.dialog.show();
		this._checkSelectedPages();
	},	
	
	/*
	 * Creates the instance of the store that is used to load/upload the Collection data
	 */
	_setStore: function() {
	
		var sdkStore = new apstrata.sdk.ObjectStore({
				connection: new apstrata.sdk.Connection(this._connection),
				store: this._apstrataStore,
				queryFields: this._queryFields,
				queryExpression: this._queryExpression,
				fieldTypes: {"apsdb.lastModifiedTime": "date"} 
			}); 	
			
		this._store =  new apstrata.sdk.ObjectStoreAdaptor({
			
			objectStore: sdkStore
		});	
	},
	
	/*
	 * Creates the grid and connect its onClick event to PageSelector.onClick function	 
	 */
	_setGrid: function() {
				
		this._grid = new dojox.grid.EnhancedGrid({
		
			store: this._store,
			
			structure: [
				{
					type: "dojox.grid._CheckBoxSelector"
				},
				
				this.getStructure()
	   		 ],	   		
			height: "200px",
			autoWidth: true,
			keepSelection: true, // Do not forget this in order to keep selection when sorting
			plugins: {
				
				// we can pass a boolean for default values or a configuration object as shown here
				pagination: {
					
					pageSizes: ["10", "25"],
					description: true,
					sizeSwitch: true,
					pageStepper: true,
					gotoButton: false,
					defaultPageSize: this.maxRows,
					maxPageStep: 7,	
					position: "top"
				}
			}
		});	
	},	
	
	/*
	 * Loops through the grid items (pages) that were previously selected and check them on the grid
	 */
	_checkSelectedPages: function() {
		
		for (var i = 0; i < this._grid.rowCount && this._grid.rowsPerPage; i++) {
			
			var self = this;
			var currentRow = this._grid.getItem(i);
			var isAmongSelected = this._isItemSelected(currentRow, this._selectedPages); 
			
			if (isAmongSelected) {
				
				this._grid.selection.addToSelection(i);
			}
		}	
	},
		
	_isItemSelected: function(currentRow, selectedPages) {
				
		for (var x = 0; x < selectedPages.length; x++) {
			
			if (selectedPages[x] == currentRow["key"]) {
				return true;
			}			
		}
		
		return false;
	},
	
	/*
	 * When "confirm" button is clicked, copy the "key" property of all selected items (pages) on the grid
	 * into this._selectedPages (old value is replaced), then clear the selection on the grid before
	 * hiding the dialog box holding the grid and updating the readView element
	 */
	_confirmSelection: function(event) {
				
		// clean-up current this._selectedPages		
		this._selectedPages.splice(0, this._selectedPages.length);		
		var temp = this._grid.selection.getSelected();
		
		// fill this._selectedPages with the key of the items that are available in this._tempSelectedPages
		for (var i = 0; i < temp.length; i++) {
			
			this._selectedPages.push(temp[i]["key"]);
		}
		
		// clean-up the grid seletion (visual)
		this._grid.selection.clear();
		
		// update the text area (read view)
		this.readView.set("value", this._stringifyArray(this._selectedPages));
		this.value = this.readView.get("value");
		this.dialog.hide();
	},
	
	/*
	 * When "cancel" button is clicked, clear the selection on the grid before
	 * hiding the dialog box holding the grid
	 */
	_cancelSelection: function(event) {
		
		this._grid.selection.clear();
		this.dialog.hide();
	},
	
	/*
	 * Simple utility function that turns an array of strings into a string where
	 * strings are seperated  by commas ","
	 */
	_stringifyArray: function(array) {
		
		if (!dojo.isArray(array)) {
			
			return array;
		}
		
		var stringified = "";
		for (var i = 0; i < array.length; i++) {
			
			stringified += array[i] + ",";
		}
		
		stringified = stringified.substring(0, stringified.length - 1);
		return stringified;  
	}
});