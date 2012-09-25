/*******************************************************************************
 *  Copyright 2009-2011 Apstrata
 *  
 *  This file is part of Apstrata Database Javascript Client.
 *  
 *  Apstrata Database Javascript Client is free software: you can redistribute it
 *  and/or modify it under the terms of the GNU Lesser General Public License as
 *  published by the Free Software Foundation, either version 3 of the License,
 *  or (at your option) any later version.
 *  
 *  Apstrata Database Javascript Client is distributed in the hope that it will be
 *  useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *  
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with Apstrata Database Javascript Client.  If not, see <http://www.gnu.org/licenses/>.
 * *****************************************************************************
 */
dojo.provide("apstrata.horizon.Grid")

dojo.require("dojox.grid.DataGrid")

dojo.require("apstrata.horizon.Panel")
dojo.require("apstrata.horizon.GridFTSearch")

/*
 * This Grid component provides the necessary functionality to instantiate the grid, filter and action areas
 * it also provides the main event handlers for adding, deleting and filtering the grid
 */
dojo.declare("apstrata.horizon.Grid", 
[apstrata.horizon.Panel], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/Grid.html"),
	widgetsInTemplate: true,

	store: null,
	rowsPerPage: 20,
	
	constructor: function() {
		this.editable = true
		this.filterable = true
		// If no custom grid widget is specified use default dojox.grid.DataGrid 
		if (!this.gridClass) this.gridClass = dojox.grid.DataGrid
	},
	
	startup: function() {
		var self = this

		// If no custom grid widget is specified use default apstrata.horizon.GridFTSearch 
		if(!this.filterClass) this.filterClass = apstrata.horizon.GridFTSearch
		if (this.filterable) {
			var filterDv = dojo.create("div", null, this.dvHeader)
			this._filter = new this.filterClass(null, filterDv)
			dojo.connect(this._filter, "search", dojo.hitch(this, "filter"))
		}
		
		this.resize()
		
		this._grid = new this.gridClass(this.gridParams)
		dojo.place(this._grid.domNode, this.dvContent)
		this._grid.startup()
		this._handle = dojo.connect(this._grid, "onRowClick", dojo.hitch(this, "onClick")) 

		this.inherited(arguments)
	},

	onClick: function(e) {
		// To obtain the selected items and clicked
		//  this._grid.selection.getSelected(), e.rowIndex
	},
	
	// function called each time containers dimensions change
	resize: function() {
		var self = this

		dojo.style(this.dvContent, "height", self.getContentHeight() + "px")				
		
		if (this._grid) {
			this._grid.resize({h: self.getContentHeight()})
			this._grid.update()
		}

		this.inherited(arguments)
	},
	
	addNodeToHeader: function(n) {
		dojo.place(n, this.dvHeader)
	},

	filter: function(attr) {},
	editItems: function() {},
	newItem: function() {},
	
	
	/*
	 * @param processedKeys?: used to keep track of processed keys in order to make sure that we delete multiple versions only once, 
	 * since in apstrata deleting a document will delete all its versions
	 */
	deleteSingleItem: function(selection, index, processedKeys, deferred) {
		var self = this;
		
		if (!processedKeys[selection[index].key]) {
			processedKeys[selection[index].key] = "processed"
			self.gridParams.store.objectStore.remove(selection[index].key, {method:"GET"}).then(
				function() {
					if (index + 1 < selection.length) {
						self.deleteSingleItem(selection, index + 1, processedKeys, deferred);
					} else {
						deferred.resolve();
					}
				},
				function(response) {
					if (response.metadata) {
						self.displayError(response.metadata.errorCode, response.metadata.errorDetail + "[Document Key: " + selection[index].key + "]");
					} else if (response.errorCode) {
						self.displayError(response.errorCode, response.errorDetail + "[Document Key: " + selection[index].key + "]");					
					}
					if (index + 1 < selection.length) {
						self.deleteSingleItem(selection, index + 1, processedKeys, deferred);
					} else {
						deferred.resolve();
					}
				}
			);
		} else {
			if (index + 1 < selection.length) {
				self.deleteSingleItem(selection, index + 1, processedKeys, deferred);
			} else {
				deferred.resolve();
			}
		}	
		
	},
	
	deleteItems: function() {
		var self = this;
		var finalDef = new dojo.Deferred();
		
		/*
		 * Not sure if the following logic to ensure that all documents have been deleted will work, 
		 * due to using a shared varialble called processed which is not synchronized over multiple 
		 * asynchronous delete calls.
		 * May be it is better to use the publish/subscribe pattern
		 */
		var selection = self._grid.selection.getSelected();
		if (selection && selection.length > 0) {
			new apstrata.horizon.PanelAlert({
				panel: self,
				width: 320,
				height: 150,
				message: "Are you sure that you want to delete the selected row(s)?",
				iconClass: "deleteIcon",
				actions: [
					'Yes',
					'No'
				],
				actionHandler: function(action) {
					if (action == 'Yes') {
						self.showAsBusy(true, 'deleting document(s)...');
						self.closePanel();
						var deferred = new dojo.Deferred();
						dojo.when(
							deferred,
							function() { 
								self._grid.selection.clear();
								self.showAsBusy(false);
								finalDef.resolve();
							},
							function() {
								self.showAsBusy(false);
								finalDef.reject();
							}
						);
						self.deleteSingleItem(selection, 0, {}, deferred);
					}
				}
			})
		}
				
		return finalDef;
		
	},

	getContentHeight: function() {
		var h, c, f
		
		h = dojo.marginBox(this.dvHeader).h
		c = dojo.contentBox(this.domNode).h
		f = dojo.marginBox(this.dvFooter).h
		
		return  c  - h - f
	}
})

