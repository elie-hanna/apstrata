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

dojo.require("apstrata.horizon._ListContent")


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
	
	filterable: false,
	sortable: false,
	
	data: null,

	_filter: '',
	_FILTER_MESSAGE: 'type to filter',

	msgDelete: "are you sure you want to delete item: ",

	postCreate: function() {

		this._resizeFilterField()
		this.inherited(arguments)
	},

	startup: function() {
		this.inherited(arguments)
		this.refresh()
	},

	_resizeFilterField: function() {
		var self = this
		if (!this.dvSearchField) return
		dojo.style(this.dvSearchField, {
			width: (self.width - 39) + "px"
		})
	},

	refresh: function() {
		var self = this

		this._listContent = new apstrata.horizon._ListContent({data: self.data, parent: self})
		dojo.place(this._listContent.domNode, this.dvItems)

		this._resizeFilterField()
		this._editMode = false
		this.render()
	},
	
	render: function() {
		var self = this
		this.inherited(arguments)
		
		if (this.dvItems) {
			this._listContent = new apstrata.horizon._ListContent({data: self.data, parent: self})
			dojo.place(this._listContent.domNode, this.dvItems)
		}
		
		this._resizeFilterField()
//		if (this._listContent) {
//			this._listContent.setData(this.data)
//		}
	},
	
	layout: function() {
		if (this._listContent) {
			this._resizeFilterField()
			
			this._listContent.setHeight()
		}
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
			var items = dojo.query('.deleteCell', this.domNode)
			dojo.forEach(items, function(item) {
				var icon = dojo.query('.iconDelete', item)
				
				if (icon) dojo.destroy(icon[0])
			})
			this._editMode = false
		} else {
			var items = dojo.query('.deleteCell', this.domNode)
			dojo.forEach(items, function(item) {
				var n = dojo.create("div", {innerHTML: "<img src='"+ self._apstrataRoot +"/resources/images/pencil-icons/stop-red.png'>"})
				n.setAttribute('itemLabel', item.getAttribute('itemLabel'))
				n.setAttribute('itemIndex', item.getAttribute('itemIndex'))

				dojo.addClass(n, 'iconDelete')
				dojo.place(n, item)
				
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
	},

	filterChange: function(e) {
		var self = this
		if (e.keyCode == 8) {
			this._filter = (e.currentTarget.value.toLowerCase()).substr(0, e.currentTarget.value.length-1)
		} else {
			this._filter = (e.currentTarget.value + e.keyChar).toLowerCase()
		}
 		
		if (this._filter == '') {
			var _newData = this.data
//			this.txtSearch.value = this._FILTER_MESSAGE
		} else {
			var _newData = []
			
			for (var i=0; i<this.data.length; i++) {
				j = ((this.data[i]).label.toLowerCase()).indexOf(this._filter)
				if (j>=0) {
					var label = this.data[i].label.substring(0, j) + 
						"<span class='highlightFilter'>" + this._filter + "</span>" + 
						this.data[i].label.substring(j + this._filter.length)
console.debug(label)	
					if (j>=0) _newData.push({label: label, img: self.iconSrc})
				}
			}
		}
		
		this._listContent.setData(_newData)
	},
/*	
	focus: function(e) {
		console.dir(e)
		if (this._filter == '') this.txtSearch.value = ''
		
	},
*/
	_ascending: function() {
		if (this._sort != 1) {
			this._sort = 1
			this._upOn()
			this._downOff()
		} else {
			this._sort = 0
			this._upOff()
		}
		
		this._listContent.sort(this._sort)
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

	_descending: function() {
		if (this._sort != 2) {
			this._sort = 2
			this._downOn()
			this._upOff()
		} else {
			this._sort = 0
			this._downOff()
		}

		this._listContent.sort(this._sort)
	},
	
	_downOn: function() {
		dojo.removeClass(this.imgDown, 'off')		
		dojo.addClass(this.imgDown, 'on')
	},
	
	_downOff: function() {
		if (this._sort == 2) return
		dojo.removeClass(this.imgDown, 'on')		
		dojo.addClass(this.imgDown, 'off')
	}

})			


dojo.declare("apstrata.horizon.HStackableList2", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/HStackableList.html"),
	widgetsInTemplate: true,
	editable: false,
	noEdit: false,
		
	filterable: false,
	sortable: false,

	data: null,

	msgDelete: "are you sure you want to delete item: ",

	refresh: function() {
		this._editMode = false
		
	},
	
	postCreate: function() {
		var self = this

		this._listContent = new apstrata.horizon._ListContent({data: self.data, parent: self})
		dojo.place(this._listContent.domNode, this.dvItems)

	},
	
	startup: function() {
		if (this.editable) {
/*
			var w1 = dojo.coords(this.dvItems)
			var w2 = dojo.coords(this.dvEdit)
			
			console.dir(w1)
			console.dir(w2)

			dojo.style(this.dvItems, {height: (w1.h - w2.h) + "px"})
*/			
			dojo.style(this.dvItems, {height: "400px"})
		} 

		this.inherited(arguments)
	},
	
	render: function() {
		this.inherited(arguments)
		
		if (this._listContent) this._listContent.render()
	},

	_filter: '',
	
	filterChange: function(e) {
		if (e.keyCode == 8) {
			this._filter = (e.currentTarget.value.toLowerCase()).substr(0, e.currentTarget.value.length-1)
		} else {
			this._filter = (e.currentTarget.value + e.keyChar).toLowerCase()
		}
 		
		if (this._filter == '') {
			var _newData = this.data
		} else {
			var _newData = []
			
			for (var i=0; i<this.data.length; i++) {
				if (((this.data[i]).label.toLowerCase()).indexOf(this._filter)==0) _newData.push(this.data[i])
			}
		}
		
		this._listContent.setData(_newData)
	},
	
	onClick: function(index, label, attrs) {},
		
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
	
	_ascending: function() {
		if (this._sort != 1) {
			this._sort = 1
			this._upOn()
			this._downOff()
		} else {
			this._sort = 0
			this._upOff()
		}
		
		this._listContent.sort(this._sort)
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

	_descending: function() {
		if (this._sort != 2) {
			this._sort = 2
			this._downOn()
			this._upOff()
		} else {
			this._sort = 0
			this._downOff()
		}

		this._listContent.sort(this._sort)
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


