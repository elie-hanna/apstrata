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

dojo.provide("apstrata.horizon.HStackableList")

/*
 * This HStackable provides a scrolling vertical list of items. It provides edit and new functionality  
 */
dojo.declare("apstrata.horizon.HStackableList", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/HStackableList.html"),
	widgetsInTemplate: true,
	editable: false,
	noEdit: false,
	
	data: null,

	msgDelete: "are you sure you want to delete item: ",

	refresh: function() {
		this._editMode = false
		
	},
	
	_onClick: function(e) {
		if (this.noEdit) return;
		if (this._editMode) return;

		var label = e.currentTarget.getAttribute('itemLabel')
		var index = e.currentTarget.getAttribute('itemIndex')
		var attrs = this.data[index].attrs
		
		if (this._lastSelected) dojo.removeClass(this._lastSelected, "itemSelected")
		
		this._lastSelected = e.currentTarget
		
		dojo.addClass(e.currentTarget, "itemSelected")

		this.onClick(index, label, attrs)
	},
	
	_markSelected: function(e) {
		
	},
	
	onClick: function(index, label, attrs) {},
	
	_onMouseover: function(e) {
		this._saveBackground = e.currentTarget.style.background

		dojo.addClass(e.currentTarget, "itemMouseOver")
		
	},
	
	_onMouseout: function(e) {
		var self = this

		dojo.removeClass(e.currentTarget, "itemMouseOver")

	},
	
	newItem: function() {},
	
	editItems: function() {
		var self = this
		
		// Close any open panels
		this.closePanel()
		
		if (this._editMode) {
			var items = dojo.query('.item', this.domNode)
			dojo.forEach(items, function(item) {
				var icon = dojo.query('.iconDelete', item)
				
				if (icon) dojo.destroy(icon[0])
			})
			this._editMode = false
		} else {
			var items = dojo.query('.item', this.domNode)
			dojo.forEach(items, function(item) {
				var n = dojo.create("div", {innerHTML: "<div class='iconDelete'><img src='"+ self._apstrataRoot +"/resources/images/pencil-icons/stop-red.png'></div>"})
				n.setAttribute('itemLabel', item.getAttribute('itemLabel'))
				n.setAttribute('itemIndex', item.getAttribute('itemIndex'))
				dojo.place(n, item, 'first')
				
				dojo.connect(n, 'onclick', function(e) {
					self._alert(self.msgDelete + '[' + e.currentTarget.getAttribute('itemLabel') + "] ?", 
								e.currentTarget, 
								function(target) {
									self.onDeleteItem(target.getAttribute('itemIndex'), target.getAttribute('itemLabel'), self.data[target.getAttribute('itemIndex')].attrs)
								}, function(target) {
									
								})
				})
			})
			this._editMode = true
		}
	},
	
	onDeleteItem: function(index, label, attrs) {},

	_alert: function (msg, origin, yes, no) {
		dialog3 = new apstrata.widgets.Alert({width: 300, 
												height: 250, 
												actions: "yes,no", 
												message: msg, 
												clazz: "rounded-sml Alert", 
												iconSrc: apstrata.baseUrl + "/resources/images/pencil-icons/alert.png", 
												animation: {from: origin}, 
												modal: true })

		dialog3.show()
		dojo.connect(dialog3, "buttonPressed", function(label) {
			if (label == 'yes') {
				yes(origin)
			} else {
				no(origin)
			}
			dialog3.hide()
		})
	}
})			


dojo.declare("apstrata.horizon.HStackableMultiSelectList", 
[apstrata.horizon.HStackableList], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/HStackableMultiSelectList.html"),
	
	_onClick: function(e) {
		var self = this
		
		var item = e.currentTarget
		
		var icon = dojo.query('.iconDelete', item)
		if (icon.length>0) {
			dojo.destroy(icon[0])
		} else {
			var n = dojo.create("div", {innerHTML: "<img src='"+ self._apstrataRoot +"/resources/images/pencil-icons/add.png'>"})
			dojo.addClass(n, 'iconDelete')
			n.setAttribute('itemLabel', item.getAttribute('itemLabel'))
			dojo.place(n, item, 'first')
		}
		
		var nodes = dojo.query('.iconDelete', this.domNode)
		var list = []
		dojo.forEach(nodes, function(node) {
			list.push(node.getAttribute('itemLabel'))
		})
		
		this.onChange(list)
		
		this.inherited(arguments)
	},
	
	onChange: function(list) {
	}
})
