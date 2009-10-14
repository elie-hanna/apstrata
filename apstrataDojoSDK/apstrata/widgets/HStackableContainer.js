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

dojo.provide("apstrata.widgets.HStackablePanel")
dojo.provide("apstrata.widgets.HStackableList")
dojo.provide("apstrata.widgets.HStackableContainer")


dojo.declare("apstrata.widgets._HStackableContainerLayoutMixin", [], 
{
	_animateToPosition: function() {
		var self = this
		
		if (this.parentNode) {
			dojo.style(this.domNode, {
				left: self.parentNode.offsetLeft + "px",
				opacity: .8
			})

			var _animation = {
				node: self.domNode,
				easing: dojo.fx.easing.cubicIn,
				duration: 200,
				onEnd: function() {
				}
			}
			
			// The animation coordinates top/left have already been calculated during resize
			_animation.properties = {
				left: self.parentNode.offsetLeft + self.parentNode.offsetWidth + 5,
				opacity: 1
			}
			
			dojo.animateProperty(_animation).play()
		}
	}
})

dojo.declare("apstrata.widgets.HStackablePanel", 
[dijit.layout._LayoutWidget, apstrata.widgets._HStackableContainerLayoutMixin], 
{
	parentListId: "",

	constructor: function(attrs) {
			if (attrs.parentList) {
				this.parentNode = attrs.parentList.domNode
			} else if (attrs.parentListId) {
				this.parentListId = attrs.parentListId

				if (this.parentListId != "") {
						this.parentNode = dojo.byId(this.parentListId)
						if (!this.parentNode) throw Error('parentNode ' + attrs.parentListId + ' not found')
				}
			}
	},
	
	postCreate: function() {
		dojo.addClass(this.domNode, 'panel')
		dojo.addClass(this.domNode, 'hStackable')
		dojo.addClass(this.domNode, 'rounded-sml')
		this.inherited(arguments)
		this._animateToPosition()
	},
	
	layout: function() {
		var self = this
		this._animateIntoPosition()
	}
})			

var tmp1 = "{% for o in data %} <div class='item' itemIndex='{{ forloop.counter0 }}' itemLabel='{{ o.label }}' dojoAttachEvent='onmouseover: _onMouseover,onmouseout: _onMouseout,onclick: _onClick'> {% if o.iconSrc %}<div class='icon'><img src='{{ o.iconSrc }}'></div>{% endif %} <div class='label'> {{ o.label }} </div> <div style='clear: both;'></div></div> {% endfor %}"

dojo.declare("apstrata.widgets.HStackableList", 
[dijit._Widget, dojox.dtl._Templated, apstrata.widgets._HStackableContainerLayoutMixin], 
{
	templateString: "<div class='verticalList hStackable rounded-sml'><div class='vScrollable' dojoAttachPoint='dvList'>" + tmp1 + "</div> <div style='width: 100%; text-align: center;'> {% if editable %} <div dojoType='dijit.form.ToggleButton' iconClass='dijitCheckBoxIcon' dojoAttachEvent='onClick: editItems'>delete</div><div dojoType='dijit.form.Button' dojoAttachEvent='onClick: newItem'>new</div></div></div> {% endif %}",
	widgetsInTemplate: true,
	parentListId: "",
	data: null,
	parentList: null,
	editable: false,
	
	msgDelete: "are you sure you want to delete item: ",

	constructor: function(attrs) {
		if (attrs) {
			if (attrs.editable) this.editable = attrs.editable
			if (attrs.parentList) {
				this.parentNode = attrs.parentList.domNode
			} else if (attrs.parentListId) {
				this.parentListId = attrs.parentListId

				if (this.parentListId != "") {
						this.parentNode = dojo.byId(this.parentListId)
						if (!this.parentNode) throw Error('parentNode ' + attrs.parentListId + ' not found')
				}
			}
			
			if (attrs.data) this._data = attrs.data
		}
	},
	
	postCreate: function() {
		this.inherited(arguments)
		this._animateToPosition()
	},
	
	render: function() {
		this.inherited(arguments)
		this._animateToPosition()
	},
	
	_onClick: function(e) {
		if (this._editMode) return;

		var label = e.currentTarget.getAttribute('itemLabel')
		var index = e.currentTarget.getAttribute('itemIndex')
		
		if (this._lastSelected) dojo.removeClass(this._lastSelected, "itemSelected")
		
		this._lastSelected = e.currentTarget
		
		dojo.addClass(e.currentTarget, "itemSelected")

		this.onClick(index, label)
	},
	
	onClick: function(index, label) {},
	
	_onMouseover: function(e) {
		this._saveBackground = e.currentTarget.style.background

		dojo.addClass(e.currentTarget, "itemMouseOver")
		
	},
	
	_onMouseout: function(e) {
		var self = this

		dojo.removeClass(e.currentTarget, "itemMouseOver")

	},
	
	newItem: function() {
		
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
	},
	
	editItems: function() {
		var self = this
		
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
				dojo.place(n, item, 'first')
				
				dojo.connect(n, 'onclick', function(e) {
					self._alert(self.msgDelete + '[' + e.currentTarget.getAttribute('itemLabel') + "] ?", 
								e.currentTarget, 
								function(target) {
									self.onDeleteItem(target.getAttribute('itemIndex'), target.getAttribute('itemLabel'))
								}, function(target) {
									
								})
				})
			})
			this._editMode = true
		}
	},
	
	onDeleteItem: function(index, label) {},

	destroy: function() {
		if (this.openWidget) this.openWidget.destroy()
		this.inherited(arguments)
	}
})			

/*
 * Layout widget to contain the stackable widgets
 */
dojo.declare("apstrata.widgets.HStackableContainer", 
[dijit.layout._LayoutWidget], 
{

})
