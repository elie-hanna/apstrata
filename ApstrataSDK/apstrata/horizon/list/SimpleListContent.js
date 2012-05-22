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

dojo.provide('apstrata.horizon.list.SimpleListContent');

dojo.require('dijit.InlineEditBox')

dojo.declare("apstrata.horizon.list.SimpleListContent", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon.list", "templates/SimpleListContent.html"),
	widgetsInTemplate: true,
	data: [],
	
	// these are calculated dynamically based on list width
	_labelWidth: 85,
	_itemWidth: 120,
	height: 100,
	
	_normalizeResult: function(result) {
		var self = this;

		this.data = [];
		dojo.forEach(result, function(item) {
			if (!item['id']) item['id'] = item[self.parent.idProperty]
			if (!item['label']) item['label'] = item[self.parent.labelProperty] || "<empty>"
			
			item.isDeleteable = true || (self.parent.isDeletableCondition && (item[self.parent.isDeletableCondition.field] == item[self.parent.isDeletableCondition.value]))
			item.isEditable = true || (self.parent.isEditableCondition && (item[self.parent.isEditableCondition.field] == item[self.parent.isEditableCondition.value]))

			if (item.canBeDeleted) item.isDeleteable = true; else item.isDeleteable = false 
			if (item.canBeEdited) item.isEditable = true; else item.isEditable = false 
			
			if (self.parent.itemIsDeleteable) {
				item.isDeleteable = self.parent.itemIsDeleteable(item)
			}

			if (self.parent.itemIsEditable) {
				item.isEditable = self.parent.itemIsEditable(item)
			}
			
			self.data.push(item);
		})
	},
	
	constructor: function(args) {
		var self = this
		this.result = args.result
		this.parent = args.parent
		
		this._activeEdit = false

		if (args.selectIds) {
			this._selectId = args.selectIds.shift()
			this._selectIds = args.selectIds
		}
		
		this._lastSelectedIndex = null
		this._activeInlineEdit = null

		this._normalizeResult(args.result)
	},
	
	postCreate: function() {
		this.inherited(arguments)
	},
	
	startup: function() {
		this.render()
		this.inherited(arguments)
	},
	
	setData: function(result) {
		var self = this
		
		this._normalizeResult(result)
		this.render()
		this.layout()
	},
	
	layout: function() {
		var self = this

		// IE8 breaks when value is negative
		if (self.parent.getContentHeight() >= 0)
			dojo.style(self.domNode, "height", self.parent.getContentHeight() + "px")				
		if (self._lastSelectedIndex) self.toggleItem(self._lastSelectedIndex, true)
	},

	render: function() {
		var self = this
		this.inherited(arguments)

//		this.select()

//		setTimeout( dojo.hitch(this, "select"), 1)
/*
		setTimeout(
			dojo.hitch(this, function() {
					if (self._selectId) {
						self.selectItem(self._selectId, true)
						self._selectId = null
					}
				}), 1)

		setTimeout(function() {
			if (self._selectId) {
				self.selectItem(self._selectId, true)
				self._selectId = null
			}
		}, 1)
*/
	},

	select: function() {
		var self = this
		if (this._selectId) {
			var queryItemId = this._selectId;
			if (dojo.isIE) {
				queryItemId = queryItemId.replace(new RegExp("\\\\", "g"), "\\\\");
			}
			var node = dojo.query("[itemid=\"" + queryItemId + "\"]", this.domNode)[0];
			if (node) {   
				var index = node.getAttribute('itemIndex');
				
				if (this._lastSelectedIndex) this.toggleItem(this._lastSelectedIndex, false);
				this.toggleItem(this._selectId, true);
				this._lastSelectedIndex = this._selectId;
					
				this.parent.onClick(index, this._selectId, { selectIds: self._selectIds });
			}
		}
		
		// Experimental, if true the panel will only shrink to show the icons 
		if (this.parent.narrowOnClick) dojo.style(this.parent.domNode, {width: "55px"})
	},

	toggleItem: function(id, selected) {
		if (dojo.isIE) {
			id = id.replace(new RegExp("\\\\", "g"), "\\\\");
		}
		var node = dojo.query("[itemid=\""+ id +"\"]", this.domNode)[0];
		if (node) {
			if (selected) {
				dojo.addClass(node, "itemSelected")
			} else {
				dojo.removeClass(node, "itemSelected")
			}
		}
	},
	

	_onClick: function(e) {
		if (this.noEdit) return;

		var index = e.currentTarget.getAttribute('itemIndex')
		var id = e.currentTarget.getAttribute('itemId')

		this._selectId = id

		if (!this.parent._editMode) {
			this.select()
		}
	},

	_deleteItem: function(e) {
		var self = this
		var id = e.currentTarget.getAttribute('itemId')
		var item = self.parent.store.get(id)

		self.parent.onDeleteRequest(id, item)
		self.parent.onDeleteItem(id, item)
	},
	
	// this needs to be reviewed, currently not using it
	removeItem: function(id){
		
		for (var i=0; i<this.data.length; i++) {
			if (this.data[i].id == id) {
				this.data.splice(i, 1)
				this.render()
				this.layout()
				this.parent.showDeleteIcons()
				return
			}
		}
		
	},	
	
	_editLabel: function(e) {
		var self = this

		if (this._activeEdit || !this.parent._editMode) return
		
		// Determine which div has been clicked 
		var target = e.currentTarget || e.srcElement
		
		// Deduce the id in the store from the itemId attribute we placed in the template
		this._editedItemId = target.getAttribute('itemId')
		
		// Determine the oldValue from the store because this hasn't been changed yet
		this._oldValue = this.parent.store.get(this._editedItemId).Name
		
		this.toggleItem(this._editedItemId, false)
		
		this._activeEdit = true
		
		var tmpDiv = dojo.create("div", {innerHTML: self._oldValue})
		dojo.addClass(tmpDiv, "listInnerLabel")
		dojo.place(tmpDiv, target, "only")
		var editorParams = (this.parent.editorParams)? this.parent.editorParams : {};
		var editorType = (this.parent.editorType)? this.parent.editorType : "dijit.form.TextBox"; 
		
		this._activeInlineEdit = new dijit.InlineEditBox({ 
			editor: editorType,
			renderAsHtml: false, 
			autoSave: false,
			editorParams: editorParams,
			onChange:function() {
				self._activeEdit = false
				var newValue = this.get("value")
				
				self.parent.onChangeRequest(self._editedItemId, self._oldValue, newValue, function() {
					self.parent.changeItemLabel(id, newValue)
				}, function() {
					self.revertItemEdit()
				})
			},
			onCancel: function() {
				self.revertItemEdit()
			}
		}, tmpDiv)
	},
	
	cancelEdits: function() {
		if (this._activeInlineEdit) this._activeInlineEdit.cancel()
	},
	
	changeItemLabel: function(id, label) {
		if (!this._activeInlineEdit) return
		
		var n = this._activeInlineEdit.domNode.parentNode
		this._activeInlineEdit.destroyRecursive()
		n.innerHTML = "<div class='listInnerLabel' title='" + this.parent._messages.clickToEditMessage + "'>"+label+"</div>" 
		
		this._activeEdit = false
	},
	
	changeStaticItemLabel: function(id, label) {
		var node =dojo.query("[itemid=\""+ id +"\"] .listInnerLabel", this.domNode)[0];
		if (node) { 
			node.innerHTML = label;
		}
	},	
	
	revertItemEdit: function() {
		if (!this._activeInlineEdit) return
		
		var n = this._activeInlineEdit.domNode.parentNode
		this._activeInlineEdit.destroyRecursive()
		n.innerHTML = "<div class='listInnerLabel' title='" + this.parent._messages.clickToEditMessage + "'>"+this._oldValue+"</div>" 

		this._activeEdit = false
	},
	
	_onMouseover: function(e) {
		this._saveBackground = e.currentTarget.style.background
		dojo.addClass(e.currentTarget, "itemMouseOver")
	},
	
	_onMouseout: function(e) {
		var self = this
		dojo.removeClass(e.currentTarget, "itemMouseOver")
	},
	
	_markSelected: function(e) {}
})
