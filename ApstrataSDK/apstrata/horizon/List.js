/*******************************************************************************
 *  Copyright 2009 Apstrata
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

dojo.provide('apstrata.horizon.List');

dojo.require('dijit.form.ToggleButton')
dojo.require('dijit.form.Button')

dojo.require("apstrata.horizon.Panel")
dojo.require('apstrata.horizon.list.SimpleListContent')
dojo.require('apstrata.horizon.util.FilterLabelsByString')
dojo.require('apstrata.horizon.list.SimpleFilterAndSort')

/*
 * This List provides a scrolling vertical list of items. It provides edit and new functionality  
 */
dojo.declare("apstrata.horizon.List", 
[apstrata.horizon.Panel], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/List.html"),
	widgetsInTemplate: true,

	//
	// widget attributes
	//
	editable: false,
	filterable: false,
	sortable: false,
	
	// Experimental, if true the panel will only shrink to show the icons 
	narrowOnClick: false,
	
	// Install simple filter widget
	filterWidget: apstrata.horizon.list.SimpleFilterAndSort,
	
	// This is a dojo.store data source of the widget
	store: null,
	
	//
	// private variables
	//
	_filter: '',
	_queryOptions: null,

	// index of the essential item properties
	idProperty: 'key',
	labelProperty: 'title',
	
	_messages: {},
		
	//
	// Messages
	// TODO: get from resource bundle
	//
	_MSG_FILTER: 'type to filter',	
	
	contentClass: apstrata.horizon.list.SimpleListContent,
	
	constructor: function() {
		this._messages = {
			editButtonLabel: "edit",
			newButtonLabel: "new",
			clickToEditMessage: "double click to edit..."
		}
	},
	
	startup: function() {
		var self = this

		// Instantiate the widget that will display the content
		self._listContent = new this.contentClass({result: [], parent: self, selectIds: self._selectIds})

		dojo.place(self._listContent.domNode, self.dvContent)

		// Place the sorting filtering widget
		if (this.sortable || this.filterable) {
			self._filterWidget = new this.filterWidget({parent: self})		
			dojo.place(self._filterWidget.domNode, self.dvHeader)

			dojo.connect(self._filterWidget, "onSortChange", dojo.hitch(this, "sort"))
			dojo.connect(self._filterWidget, "onFilterChange", dojo.hitch(this, "filter"))
		}
		
		this.resize()
		this.reload()
		
		this.inherited(arguments)
	},
	
	sort: function(sort) {
		this._sort = sort
		this.reload()
	},
   
	select: function() {
		this._listContent.select();
	},   
	
	filter: function(filter) {
		this._filter = filter
		this.reload()
	},

	// function called each time containers dimensions change
	resize: function() {
		var self = this
		if (self._listContent) self._listContent.layout()
		if (self._filterWidget) self._filterWidget.layout()
			
		this.inherited(arguments)
	},
	
	reload: function() {
		var self = this
		
		// Sometimes this might get called before a store has been initialized.
		if (!this.store) return
		
		var query = this._queryParams()
		var queryOptions = this._queryOptions()
				
		this.showAsBusy(true, "refreshing list")
		dojo.when(
			this.store.query(
				query,
				queryOptions
			),
			function(result) {
				self.showAsBusy(false)

				self._listContent.setData(result) 		
        		self.select();    
			}
		)
	},
	

	_markSelected: function(e) {
		
	},

	openById: function(id) {
		this.inherited(arguments)
		this._listContent.selectItem(id)
	},	
	
	/*
	 * Works by default for dojo.store.Memory and for filtering a label based on a string
	 * It should be overriden for different stores or for different filtering requirements 
	 */
	_queryParams: function() {
		var self = this

		return function(item) { return apstrata.horizon.util.FilterLabelsByString(item, self._filter) }
	},
	
	/*
	 * Works by default for dojo.store.Memory and for sorting the label attribute
	 * It should be overriden for different stores or for different sorting requirements 
	 */
	_queryOptions: function() {
		var _queryOptions = {}
		
		if (this._sort == 1) {
			_queryOptions = {
				sort: [{
					attribute: "label",
					ascending: true
				}]
			}
		} else if (this._sort == 2) {
			_queryOptions = {
				sort: [{
					attribute: "label",
					descending: true
				}]
			}
		} 
		
		return _queryOptions 
	},
	
	getContentHeight: function() {
		return  dojo.contentBox(this.domNode).h  - dojo.contentBox(this.dvHeader).h - dojo.contentBox(this.dvFooter).h
	},
	
	//
	// Rendering and visual state widgets
	// 
	
	/**
	 * Toggles edit mode by showing delete icons, making labels clickable and closing child panels
	 * @param {Object} editMode boolean if true puts form into edit mode
	 */
	setEditMode: function(editMode) {
		var self = this
		
		// Close any open panels
		this.closePanel()

		this._editMode = editMode

		if (editMode) {
			// edit mode

			if (self._filterWidget) self._filterWidget.set('enabled', false)
			this.showEditTooltip()
			this.hideDeleteIcons()
			this.dimReadOnlyLabels()
			this._tglEdit.set('checked', true)
		} else {
			// normal mode
			this._editMode = false

			if (self._filterWidget) self._filterWidget.set('enabled', true)
			this.hideEditTooltip()
			this.showDeleteIcons()
			this.unDimReadOnlyLabels()
			this._listContent.cancelEdits()
			this._tglEdit.set('checked', false)
		}	
	},

	showEditTooltip: function() {
		var self = this
		var items = dojo.query('.listInnerLabel', this.domNode)
		dojo.forEach(items, function(item) {
			dojo.attr(item, "title", self._messages.clickToEditMessage)
		})
	},
	
	hideEditTooltip: function() {
		var items = dojo.query('.listInnerLabel', this.domNode)
		dojo.forEach(items, function(item) {
			dojo.attr(item, "title", "")
		})
	},

	showDeleteIcons: function() {
		var items = dojo.query('.deleteCell', this.domNode)
		dojo.forEach(items, function(item) {
			dojo.style(item, "display", "none")
		})
	},
	
	hideDeleteIcons: function() {
		var items = dojo.query('.deleteCell', this.domNode)
		dojo.forEach(items, function(item) {
			dojo.style(item, "display", "block")
		})
	},
	
	dimReadOnlyLabels: function() {
		var items = dojo.query('.readOnly', this.domNode)
		dojo.forEach(items, function(item) {
			dojo.addClass(item, "dim")
		})
	},
	
	unDimReadOnlyLabels: function() {
		var items = dojo.query('.readOnly', this.domNode)
		dojo.forEach(items, function(item) {
			dojo.removeClass(item, "dim")
		})
	},

	//
	// List data manipulation methods
	//

	addItem: function(item) {
		var self = this
		dojo.when (
			this.store.add(item),
			function() {
				self.reload()
				self._tglEdit.set("checked", false) 
				if (self._filterWidget) self._filterWidget.set('enabled', true)
			},
			function() {
				
			}
		)
	},
	
	putItem: function(item) {
		var self = this
		dojo.when (
			this.store.put(item),
			function() {
				self.reload()
				self._tglEdit.set("checked", false) 
				if (self._filterWidget) self._filterWidget.set('enabled', true)
			},
			function() {
				
			}
		)
	},

	deleteItem: function(id) {
		var self = this
		var deferred = this.store.remove(id) 
		dojo.when (
			deferred,
			function() {
				self.reload()
				self._tglEdit.set("checked", false) 
				if (self._filterWidget) self._filterWidget.set('enabled', true)
			},
			function() {
				
			}
		)
		return deferred
	},

	changeItemLabel: function(id, label) {
		var self = this
		
		var item = this.store.get(id)
		item[this.labelProperty] = label
		var a = this.store.put(item, {overwrite: true})
		if (this.store.save) {
			// if the store supports save, we need to save the change in the remote storage
			this.store.save.then(function(){
				// on success we can show the modified label
				self._listContent.changeItemLabel(id, label)
			}, function() {
				// on failure revert the old value
				self._listContent.revertItemEdit()
			})
		} else {
			self._listContent.changeItemLabel(id, label)
		}
	},
	
	changeStaticItemLabel: function(id, label) {
		var self = this
		
		var item = this.store.get(id)
		item[this.labelProperty] = label
		var a = this.store.put(item, {overwrite: true})		
		self._listContent.changeStaticItemLabel(id, label)
	},	
	
	revertItemEdit: function() {
		this._listContent.revertItemEdit()
	}, 
	
	//
	// Private action handlers
	//

	/**
	 * Triggered when new button is pressed
	 */		
	_newItem: function() {
		this._tglEdit.set('checked', false)
		this.setEditMode(false)
		
		this.onAddItem()
		this.newItem() // calling this for backward compatibility
	},
	
	/**
	 * Triggered when editItems button is pressed
	 */
	editItems: function() {
		this.setEditMode(this._tglEdit.get('checked'))
	},
				
	
	//
	// Obsolete action handlers
	//
	onDeleteRequest: function(id, item) { console.warn('apstrata.horizon.List.onDeleteRequest is Obsolete, use onDeleteItem instead') },
	onChangeRequest: function(id, oldValue, newValue) { console.warn('apstrata.horizon.List.onChangeRequest is Obsolete, use onChangeLabel instead') },
	newItem: function() { console.warn('apstrata.horizon.List.newItem is Obsolete, use onAddItem instead') },
	
	//
	// Action handlers
	//
	onAddItem: function() {},
	onDeleteItem: function(id) {},
	onChangeLabel: function(id, oldValue, newValue) {},
	onClick: function(index, id, args) {}
	
})			

