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

dojo.provide('apstrata.horizon._ListContent');

dojo.declare("apstrata.horizon._ListContent", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/_ListContent.html"),
	widgetsInTemplate: true,
	data: [],
	
	// these are calculated dynamically based on list width
	_labelWidth: 85,
	_itemWidth: 120,
	
	constructor: function(args) {
		this.data = args.data
		this.originalData = this.data.slice(0) //copy arry
		this.parent = args.parent
		this.order = 0
		
		this.width = this.parent.width - 8
		this._labelWidth = this.width - 75
		this._itemWidth = this.width - 4
		this._setHeight()
	},

	_setHeight: function() {
		var m = (this.parent.editable?36:0) + ((this.parent.filterable || this.parent.sortable)?25:0) + 17
//		var m = (this.parent.editable?36:0) + ((this.parent.filterable || this.parent.sortable)?25:0) + 17 + 20
		
		this.height = this.parent.getContainer().height - m
	},

	setHeight: function() {
		this._setHeight()
		this.render()
	},

	postCreate: function() {
		this.inherited(arguments)
	},
	
	setData: function(data) {
		this.data = data
		this.originalData = this.data.slice(0) //copy arry

		this.sort(this.order)
		this.render()
	},
	
	compare: function(a, b) {
		var _a = a.label.toLowerCase()
		var _b = b.label.toLowerCase()
		
		// psudeo code.
		if (_a < _b) {
			return -1;
		}
		if (_a > _b) {
			return 1;
		}
		if (_a == _b) {
			return 0;
		}
	},
	
	render: function() {
		this.inherited(arguments)
	},
	
	sort: function(order) {
		this.order = order
		switch (order) {
			case 0:
				this.data = this.originalData.slice(0)
				break;
			case 1:
//				this.data = this.originalData.slice(0)
				this.data.sort(this.compare)
				break;
			case 2:
//				this.data = this.originalData.slice(0)
				this.data.sort(this.compare)
				this.data.reverse()			
				break;
		}
		
		this.render()
	},
	
	select: function(index, label, attrs) {
	},

	_onClick: function(e) {
		if (this.noEdit) return;
		if (this._editMode) return;

		var label = e.currentTarget.getAttribute('itemLabel')
		var index = e.currentTarget.getAttribute('itemIndex')
		var attrs = this.data[index].attrs
		
//		this.select(index, label, attrs)

		if (this._lastSelected) dojo.removeClass(this._lastSelected, "itemSelected")
		this._lastSelected = e.currentTarget
		dojo.addClass(e.currentTarget, "itemSelected")

		this.parent.onClick(index, label, attrs)
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

	}

})
