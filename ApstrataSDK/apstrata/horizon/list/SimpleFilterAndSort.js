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

dojo.provide('apstrata.horizon.list.SimpleFilterAndSort')

dojo.require("dojox.dtl._Templated")

dojo.require("dijit.Tooltip");

/*
 * This List provides a scrolling vertical list of items. It provides edit and new functionality  
 */
dojo.declare("apstrata.horizon.list.SimpleFilterAndSort", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon.list", "templates/SimpleFilterAndSort.html"),
	widgetsInTemplate: true,
	
	_sort: 0,
	
	constructor: function() {
		this.parent = arguments['parent']
	},
	
	layout: function() {
		var self = this

		// TODO: the timeout should be replaced with a hook into the end of the panel slide animation 
		setTimeout(
			function() {
				var p = dojo.contentBox(self.domNode)
				var p1 = dojo.marginBox(self.dvSortField)
				dojo.style(self.fldSearch.domNode, {
					width: (p.w - p1.w-3) + "px"
				})
			}, 
		1)
	},
	
	postCreate: function() {
        new dijit.Tooltip({
            connectId: [self.imgUp],
            label: "sort ascending"
        });
		
        new dijit.Tooltip({
            connectId: [self.imgDown],
            label: "sort descening"
        });
		
		this.inherited(arguments)
		this.layout()
	},
	
	_upOn: function() {
		dojo.removeClass(this.imgUp, 'off')		
		dojo.addClass(this.imgUp, 'on')
	},
	
	_upOff: function() {
		if (this._sort == 1) return
		dojo.removeClass(this.imgUp, 'on')		
		dojo.addClass(this.imgUp, 'off')
	},
	
	_downOn: function() {
		dojo.removeClass(this.imgDown, 'off')		
		dojo.addClass(this.imgDown, 'on')
	},
	
	_downOff: function() {
		if (this._sort == 2) return
		dojo.removeClass(this.imgDown, 'on')		
		dojo.addClass(this.imgDown, 'off')
	},
	
	// manages sort ascending toggle
	_ascending: function() {
		if (this._sort != 1) {
			this._sort = 1
			this._upOn()
			this._downOff()

			this._queryOptions = {
				sort: [{
					attribute: "label",
					ascending: true
				}]
			}
		} else {
			this._sort = 0
			this._upOff()
			this._queryOptions = {}
		}
		
		this.onSortChange(this._sort)
	},
	
	// manages sort descending toggle
	_descending: function() {
		if (this._sort != 2) {
			this._sort = 2
			this._downOn()
			this._upOff()

			this._queryOptions = {
				sort: [{
					attribute: "label",
					descending: true
				}]
			}
		} else {
			this._sort = 0
			this._downOff()
			this._queryOptions = {}
		}

		this.onSortChange(this._sort)
	},

	change: function(v) {
		this.onFilterChange(v.trim())
	}, 
	
	onSortChange: function(sort) {},
	onFilterChange: function(filter) {},
	
	_enableState: function() {
		if (this._enabled) {
			dojo.style(this.domNode, "visibility", "visible")
		} else {
			dojo.style(this.domNode, "visibility", "hidden")
		}
	},
	
	set: function() {
		if (arguments[0] == 'enabled') {
			this._enabled = arguments[1]
			this._enableState()
		}
		this.inherited(arguments)
	}
})