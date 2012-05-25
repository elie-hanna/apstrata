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

dojo.provide('apstrata.horizon.NewList');

dojo.require('dijit.form.ToggleButton')
dojo.require('dijit.form.Button')
dojo.require('apstrata.horizon.PanelAlert')

dojo.require('apstrata.horizon.util.FilterLabelsByString')
dojo.require('apstrata.horizon.list.SimpleFilterAndSort')

dojo.require("apstrata.horizon.Panel")

dojo.requireLocalization("apstrata.horizon", "list")


/*
 * This List provides a scrolling vertical list of items. It provides edit and new functionality  
 */
dojo.declare("apstrata.horizon.NewList", 
[apstrata.horizon.Panel], 
{
	
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/NewList.html"),
	
	//
	// Public attributes
	//	

	// Data
	store: null,
	labelAttribute: "label",
	idAttribute: "id",
	iconAttribute: "iconClass",

	// mode
	editable: true,
	multiEditMode: true,
	confirmDeletes: true,
	confirmEdits: true,

	// Features
	filterable: false,
	sortable: false,

	// Visual
	dockOnClick: false,
	
	// Install simple filter widget
	filterWidget: apstrata.horizon.list.SimpleFilterAndSort,

	//
	// private variables
	//
	_filter: '',
	_queryOptions: null,

	constructor: function(options) {
		dojo.mixin(this, options)	
		
		this._itemNodes = {}
		this._labelNodes = {}
		
		this._dirtyBuffer = {
			_buffer: {},
			empty: function() {this._buffer = {}},
			get: function(){return this._buffer},
			markDeleted: function(id, d) {
				if (!this._buffer[id]) {
					this._buffer[id] = {
						id: id,
						deleted: d
					}
				} else this._buffer[id].deleted = d
			},
			markChanged: function(id, o, n) {
				var change = { oldLabel: o, newLabel: n }
				if (!this._buffer[id]) {
					this._buffer[id] = {
						id: id,
						change: change
					}
				} else this._buffer[id].change = change
			},
			isDeleted: function(id) {
				return this._buffer[id] && this._buffer[id].deleted
			},
			revert: function(id) {
				if (this._buffer[id]) delete this._buffer[id]
			}
		}

		if (options.selectIds) {
			this._selectId = options.selectIds.shift()
			this._selectIds = options.selectIds
		}
		
		this.nls = dojo.i18n.getLocalization("apstrata.horizon", "list")
	},
	
	postCreate: function(options) {	
		if (!this.editable)	dojo.addClass(this.dvFooter, "footerCollapsed")
		this.inherited(arguments)
	},
	
	startup: function(options) {
		var self = this
		
		this.reload()
		this._addActions()

		// Place the sorting filtering widget
		if (this.sortable || this.filterable) {
			self._filterWidget = new this.filterWidget({parent: self})		
			dojo.place(self._filterWidget.domNode, self.dvHeader)

			dojo.connect(self._filterWidget, "onSortChange", dojo.hitch(this, "sort"))
			dojo.connect(self._filterWidget, "onFilterChange", dojo.hitch(this, "filter"))
		}
		
		this.inherited(arguments)
	},
	
	// 
	// Public methods
	//
	resize: function() {
		var h = dojo.contentBox(this.domNode).h
		var hh = dojo.contentBox(this.dvHeader).h
		var fh = dojo.contentBox(this.dvFooter).h
		
		dojo.style(this.dvContent, {
			height: h-hh-fh + "px"
		})
	},
	
	reload: function() {
		var self = this

		if (!this.store) return

		this.closePanel()

		var query = this._queryParams()
		var queryOptions = this._queryOptions()

		this.showAsBusy(true, "refreshing list")
		dojo.when(
			this.store.query(query, queryOptions),
			function(result) {
				self.showAsBusy(false)
				if (self._tglEdit) self._tglEdit.set('checked', false)
				if (self._tglEdit) self._editList()
				self._render(result)	
				if (self._selectId) 
					if (self._cachedResult[self._selectId]) self.select(self._selectId);
						else delete self._selectedId
			},
			function(responseMetadata) {
				self.displayError(responseMetadata.errorCode, responseMetadata.errorDetail)
			}
		)
	},
	
	/**
	 * This can be overriden to make some items non deleteable
	 * 
	 * @param {Object} item
	 */
	isItemDeleteable: function(item) {
		return true
	},
	
	
	/**
	 * Called internally by the renderer to understand if an item is deleteable or not
	 * This can be overriden to make some items non editable
	 * 
	 * @param {Object} item
	 */
	isItemEditable: function(item) {
		return true
	},

	// Actions
	
	/**
	 * Called internally by the renderer to understand if an item is editable or not
	 * Mark an item as selected
	 * 
	 * @param {string} id
	 */
	select: function(id) {
		this.highlight(id)
		if (!this._tglEdit || !this._tglEdit.get('checked')) this.onClick(id, this._selectIds)
	},
		
	/**
	 * Highlight an item without causing an onClick
	 * 
	 * @param {Object} id
	 */
	highlight: function(id) {
		this._selectedId = id
		
		if (this._selectedNode) {
			dojo.removeClass(this._selectedNode, "itemSelected")
		}
		
		dojo.addClass(this._itemNodes[id], "itemSelected")
		this._selectedNode = this._itemNodes[id]
	},
	
	/**
	 * Removes any highlited item
	 * 
	 */
	deSelect: function() {
		if (this._selectedNode) {
			dojo.removeClass(this._selectedNode, "itemSelected")
		}

		delete this._selectedId
	},
	
	/**
	 * Toggles the list between editable and non-editable
	 */
	toggleEdit: function() {
		this._editList()
	},
	
	/**
	 * Revert changes made on an item
	 * 
	 * @param {string} id
	 */
	resetItem: function(id) {
		this._dirtyBuffer.revert(id)
		var r = this._cachedResult[id] //this.store.get(id)
		this._renderItem(r)
	},

	filter: function(filter) {
		this._selectId = null
		this._filter = filter
		this.reload()
	},
	
	sort: function(sort) {
		this._sort = sort
		this.reload()
	},

	commitChanges: function(dirtyBuffer) {
		var self = this
				
		for (var id in dirtyBuffer) {
			var dirtyItem = dirtyBuffer[id]

			if (dirtyItem.deleted) this.store.remove(id)
			if (dirtyItem.change) {
				var item = self._cachedResult[id]
				self.setLabel(item, dirtyItem.change.newLabel)
				this.store.put(item)
			}
		}

		this.reload()

		console.dir(dirtyBuffer)
	},
	
	deleteItem: function(id) {
		var self = this
		var deferred = this.store.remove(id) 
		dojo.when (
			deferred,
			function() {
				self.reload()
				if (self._tglEdit) self._tglEdit.set("checked", true) 
				if (self._filterWidget) self._filterWidget.set('enabled', true)
			},
			function(responseMetadata) {
				self.displayError(responseMetadata.errorCode, responseMetadata.errorDetail)
			}
		)
		return deferred
	},

	//
	// Properties
	//
	
	/**
	 * Returns true if the list is in edit mode
	 */
	isEditMode: function() {
		return this._tglEdit && this._tglEdit.get('checked')
	},
	
	/**
	 * Returns the selected Id
	 */
	getSelectedId: function() {
		return this._selectedId
	},
	
	//
	// Events
	//
	
	/**
	 * Called when the new button is clicked
	 */
	onNew: function() {},
	
	/**
	 * Called when the list is taken out of edit mode
	 *  The standard behavior commits items in the dirtyBuffer to the object store and reloads the list
	 * 
	 * @param {Object} list of items that changed
	 */
	onEdit: function(state, dirtyBuffer) {
		if (false) this.commitChanges(dirtyBuffer)
	},

	/**
	 * Called when an item is clicked
	 * 
	 * @param {string} id
	 */
	onClick: function(id, selectedIds) {},
	
	/**
	 * Called when an item delete icon is clicked
	 * 
	 * @param {string} id
	 */
	onDeleteItem: function(id) {
		var self = this
		
		var label = this.getLabel(this._cachedResult[id])
		
		if (this.multiEditMode && this.confirmDeletes) {
			new apstrata.horizon.PanelAlert({
				panel: self,
				width: 320,
				height: 150,
				message: dojo.string.substitute(self.nls.CONFIRM_DELETE, [label]),
				iconClass: "deleteIcon",
				actions: [
					'Yes',
					'No'
				],
				actionHandler: function(action) {
					if (action=='Yes') {
						self._handleSingleEditMode()
					} else {
						self.resetItem(id)
					}
				}
			})
		}
	},

	/**
	 * Called when a label is edited
	 * 
	 * @param {string} id
	 * @param {string} oldLabel
	 * @param {string} newLabel
	 */
	onEditLabel: function(id, oldLabel, newLabel) {
		var self = this

		if (this.multiEditMode && this.confirmEdits) {
			new apstrata.horizon.PanelAlert({
				panel: self,
				width: 320,
				height: 150,
				message: dojo.string.substitute(self.nls.CONFIRM_EDIT, [oldLabel, newLabel]),
				iconClass: "editIcon",
				actions: ['Yes', 'No'],
				actionHandler: function(action){
					if (action == 'Yes') {
						self.changeItemLabel(id, newLabel)
						self._handleSingleEditMode()
					}
					else {
						self.resetItem(id)
					}
				}
			})
		}
	},
	
	//
	// Private events
	//
	
	/**
	 * manages the highliting of deleted items
	 * 
	 * @param {string} id
	 */
	_onDelete: function(id) {
		if (this._dirtyBuffer.isDeleted(id)) {
			dojo.removeClass(this._labelNodes[id], "deleted")
			this._dirtyBuffer.markDeleted(id, false)
		} else {
			dojo.addClass(this._labelNodes[id], "deleted")
			this._dirtyBuffer.markDeleted(id, true)
			this.onDeleteItem(id)
		}
	},

	/*
	 * Works by default for dojo.store.Memory and for filtering a label based on a string
	 * It should be overriden for different stores or for different filtering requirements 
	 */
	_queryParams: function() {
		var self = this

		return function(item) { return apstrata.horizon.util.NewFilterLabelsByString(item, self._filter, self.labelAttribute) }
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
					attribute: this.labelAttribute,
					ascending: true
				}]
			}
		} else if (this._sort == 2) {
			_queryOptions = {
				sort: [{
					attribute: this.labelAttribute,
					descending: true
				}]
			}
		} 
		
		return _queryOptions 
	},

	
	//
	// Data methods
	//
	getLabel: function(item) {
		return item[this.labelAttribute]
	},
	
	setLabel: function(item, label) {
		item[this.labelAttribute] = label
	},
	
	// This function should be overriden in the subclass to implement the behavior upon changing the item label, 
	// such as making a call to the server to make the label change
	changeItemLabel: function(id, label) {
		
	},
	
	getId: function(item) {
		return item[this.idAttribute]
	},
	
	getIconClass: function(item) {
		return item[this.iconAttribute]
	},
	

	//
	// Private methods
	//
	
	_render: function(result) {
		var self = this
		
		self.dvContent.innerHTML = ''
		
		this._cachedResult = {}

		dojo.forEach(result, function(row) {
			
			self._cachedResult[self.getId(row)] = row
			
			var n = dojo.create("div", {"data-id": self.getId(row)})
			dojo.addClass(n, "item")
			dojo.place(n, self.dvContent)
			
			self._itemNodes[self.getId(row)] = n

			self._renderItem(row)
		})
	},

	_addNode: function(elementn, attributes, cssClass, parent) {
		var n = dojo.create(elementn, attributes)
		dojo.addClass(n, cssClass)
		dojo.place(n, parent)
		
		return n
	},

	_renderItem: function(row) {
		var self = this
		
		// clear node contents if any so it can be re-rendered
		var n = self._itemNodes[this.getId(row)]
		n.innerHTML = ""
		
		var customIcon = this.getIconClass(row)
		
		var item = this._addNode("div", {title: self.getLabel(row)}, "item", n)
			var cell1 = this._addNode("div", {}, "deleteCell", item)
			var cell2 = this._addNode("div", {}, "iconCell", item)
			var cell3 = this._addNode("div", {}, "labelCell", item)
						
		var deleteIcon = this._addNode("div", {}, "deleteIcon", cell1)
		var icon = this._addNode("div", {}, "icon " + customIcon, cell2)
		var label = this._addNode("div", {innerHTML: self.getLabel(row)}, "label", cell3)

		// If no icon class has been set for the item, hide the icon cell, otherwise add the icon class to the node
		if (!customIcon) dojo.style(cell2, "display",  "none"); else dojo.addClass(icon, customIcon)

		dojo.connect(item, "onclick", dojo.hitch(self, "select", (self.getId(row)+"")))
		dojo.connect(label, "onclick", dojo.hitch(self, "_editLabel", (self.getId(row)+"")))

		if (!this.isItemDeleteable(row)) {
			dojo.addClass(deleteIcon, "deleteIconDisabled");
		} else {
			dojo.connect(deleteIcon, "onclick", dojo.hitch(self, "_onDelete", (self.getId(row)+"")))
		}
		
		dojo.style(cell1, "display", this.isEditMode()?"table-cell":"none")

		self._labelNodes[self.getId(row)] = label
	},
		
	_addActions: function() {
		var self = this
		
		if (this.editable) {
			this._tglEdit = new dijit.form.ToggleButton({label: "Edit", iconClass:"dijitCheckBoxIcon" ,onClick: dojo.hitch(self, "_editList")})
			dojo.place(this._tglEdit.domNode, this.dvFooter)

			this._btnNew = new dijit.form.Button({label: "New", onClick: dojo.hitch(self, "onNew")})
			dojo.place(this._btnNew.domNode, this.dvFooter)
		}
	},
	
	_editList: function() {
		if (this._tglEdit.get('checked')) {
			this._startEditingList()
		} else {
			this._finishEditingList()
		}
	},

		_startEditingList: function() {
			var self = this

			// Close any open panels before putting this in edit mode			
			this.closePanel()
			
			this._tglEdit.set('label', 'Save Edits')
			this._btnNew.set('disabled', 'disabled')

			// show delete nodes
			dojo.query(".deleteCell", this.domNode).forEach(function(node){
				dojo.style(node, "display", "table-cell")
				if (self.multiEditMode) dojo.attr(node, "title", self.nls.TOOLTIP_DELETE_UNDELETE);
				else dojo.attr(node, "title", self.nls.TOOLTIP_DELETE)
			})

			// Make non editable labels appear disabled
			for (id in this._cachedResult) {
				var row = this._cachedResult[id]
				var labelNode = this._labelNodes[id]

				if (!this.isItemEditable(row)) dojo.addClass(labelNode, "labelEditDisabled")
			}
			
			// Install label tooltips
			dojo.query(".labelCell", this.domNode).forEach(function(node){
				dojo.attr(node, "title", self.nls.TOOLTIP_EDIT)
			})
			
			this.onEdit(true)
		},
		
		_finishEditingList: function() {
			this._tglEdit.set('label', 'Edit')
			this._btnNew.set('disabled', '')
			
			if (self._activeInlineEdit) this._finishEditingLabel()

			// hide delete nodes
			dojo.query(".deleteCell", this.domNode).forEach(function(node){
				dojo.style(node, "display", "none")
			})
			
			// remove deleted row effect on label
			dojo.query(".label", this.domNode).forEach(function(node){
				dojo.removeClass(node, "deleted")
			})

			// remove tooltips
			dojo.query(".labelCell", this.domNode).forEach(function(node){
				dojo.attr(node, "title", "")
			})

			// remove disabled effect from non editable rows
			for (id in this._cachedResult) {
				var row = this._cachedResult[id]
				var labelNode = this._labelNodes[id]

				if (!this.isItemEditable(row)) dojo.removeClass(labelNode, "labelEditDisabled")		
			}
			
			if (this._tglEdit.get('checked')) this._tglEdit.set('checked', false)
			
			this.onEdit(false, this._dirtyBuffer.get())
			
			this._dirtyBuffer.empty()
		},
		
	_handleSingleEditMode: function() {
		if (!this.multiEditMode) this._finishEditingList()
	},
		
	_editLabel: function(id) {
		var self = this
		
		// If an edit is already active, don't edit
		if (this._activeInlineEdit) return
		
		if (!this.isItemEditable(this._cachedResult[id])) return
		
		// If the list is not in edit mode
		if (!this._tglEdit.get('checked')) return
		
		// If the current item is deleted
		if (this._dirtyBuffer.isDeleted(id)) return
		
		var v = self._labelNodes[id].innerHTML
		self._labelNodes[id].innerHTML = ""		
		var editNode = dojo.create("div", {innerHTML:v})
		dojo.place(editNode, self._labelNodes[id])

		this._activeInlineEdit = new dijit.InlineEditBox({ 
			editor: "dijit.form.TextBox",
			renderAsHtml: false, 
			autoSave: false,
			editorParams: {},
			onChange:function() {
				var newValue = this.get("value")
				self._startEditingLabel(id, newValue, v)
			},
			onCancel: function() {
				self._finishEditingLabel(id, v)
			}
		}, editNode)
	},

		_startEditingLabel: function(id, newValue, v) {
			var self = this
			self._activeInlineEdit.destroyRecursive()
			delete self._activeInlineEdit
			self._labelNodes[id].innerHTML = newValue
			self._dirtyBuffer.markChanged(id, v, newValue)
	
			self.onEditLabel(id, v, newValue)
		},
		
		_finishEditingLabel: function(id, v) {
			var self = this
			self._activeInlineEdit.destroyRecursive()
			delete self._activeInlineEdit
			self._labelNodes[id].innerHTML = v
		}

})