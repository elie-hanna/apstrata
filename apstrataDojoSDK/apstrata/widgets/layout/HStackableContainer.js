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

dojo.provide("apstrata.widgets.layout.HStackablePanel")
dojo.provide("apstrata.widgets.layout.HStackableList")
dojo.provide("apstrata.widgets.layout.HStackableContainer")

/*
 * Layout widget container of the HStackable widgets
 */
dojo.declare("apstrata.widgets.layout.HStackableContainer", 
[dijit.layout._LayoutWidget], 
{
	addChild: function(child) {
//		child.container = this
		this.inherited(arguments)
	},
	
	autoScroll: function() {
		this.domNode.scrollLeft = this.domNode.scrollWidth - this.domNode.clientWidth
	},
	
	
	// Call layout for each contained widget upon resize
	layout: function() {
		dojo.forEach(this.getChildren(), function(child) {
			child.layout()
		})
	},
	
	getRemainingFreeWidth: function() {
		var w = 0
		dojo.forEach(this.getChildren(), function(child) {
			w += child.domNode.offsetWidth
		})
		return this.domNode.offsetWidth - w - 10
	}
})

/*
 * This mixin class insures that a HStackable Widget animates/opens in the appropriate position in the Stackable Container
 */
dojo.declare("apstrata.widgets.layout._HStackableMixin", [], 
{
	parentListId: "",
	parentList: null,

	maximizePanel: false,

	/*
	 * Instantiate an HStackable and set its parent
	 */
	constructor: function(attrs) {
		if (attrs) {
			if (attrs.container) this.container = attrs.container
			
			if (attrs.parentList) {
				this.parentNode = attrs.parentList.domNode
			} else if (attrs.parentListId) {
					this.parentListId = attrs.parentListId
					
					if (this.parentListId != "") {
						this.parentNode = dojo.byId(this.parentListId)
						if (!this.parentNode) 
							throw Error('parentNode ' + attrs.parentListId + ' not found')
					}
			}
		}
	},

	/*
	 */
	_setStyle: function() {
		var self = this
		
		dojo.addClass(this.domNode, 'hStackable')
		dojo.addClass(this.domNode, 'rounded-sml')

		// Change panel width to occupy all remaining free space in container
		if (this.maximizePanel) dojo.style(this.domNode, {width: self.getContainer().getRemainingFreeWidth()+'px'})
	},

	postCreate: function() {
		this._setStyle()

		this.inherited(arguments)
		this._animateToPosition()
	},
	
	/*
	 * Creates sliding effect
	 */
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
					self.getContainer().autoScroll()
				}
			}
			
			// The animation coordinates top/left have already been calculated during resize
			_animation.properties = {
				left: self.parentNode.offsetLeft + self.parentNode.offsetWidth + 5,
				opacity: 1
			}
			
			dojo.animateProperty(_animation).play()
		}
	},

	getParent: function() {
		return this._parent
	},

	getContainer: function() {
		return this.container
	},

	/*
	 * Instantiates selected panel and opens it
	 */
	openPanel: function(panel, args) {
		var self = this
		
		// Destroy an existing child open panel
		this.closePanel()
		
		// Mixin to the custom args the pointers to the parent and container		
		var newArgs = dojo.mixin(args, {parentList: self, container: self.getContainer()})
		
		// Instantiate new Class 'panel'
		this._openPanel = new panel(newArgs)

		this._openPanel._parent = this
		
		// Add to DojoLayout container
		this.getContainer().addChild(this._openPanel)
	},
	
	/*
	 * Closes a panel and ensures cleanup
	 */
	closePanel: function() {
		// Destroy an existing child open panel
		if (this._openPanel) {
			this.container.removeChild(this._openPanel)
			this._openPanel.destroy()
			this._openPanel = null
		}
	},
	
	/*
	 * Ensures cleanup when a panel is destroyed
	 */
	destroy: function() {
		this.closePanel()
	},
	
	/*
	 * Executes animation effect after a slide contents have been refreshed
	 */
	render: function() {
		this.inherited(arguments)

		this._setStyle()

		this._animateToPosition()
	},
	
	layout: function() {
		console.debug('layout ->')
	}
})

/*
 * This is a general purpose HStackable that can be used to contain arbitrary widgets such as forms etc.
 */
dojo.declare("apstrata.widgets.layout.HStackableWidget", 
[dijit._Widget, dojox.dtl._Templated, apstrata.widgets.layout._HStackableMixin], 
{
})

/*
 * This is a container Layout & HStackable widget that can be used to contain arbitrary widgets such as forms etc.
 */
dojo.declare("apstrata.widgets.layout.HStackableLayout", 
[dijit.layout._LayoutWidget, apstrata.widgets.layout._HStackableMixin], 
{
})

/*
 * This HStackable provides a scrolling vertical list of items. It provides edit and new functionality  
 */
dojo.declare("apstrata.widgets.layout.HStackableList", 
[dijit._Widget, dojox.dtl._Templated, apstrata.widgets.layout._HStackableMixin], 
{
	templatePath: dojo.moduleUrl("apstrata.widgets.layout", "templates/HStackableList.html"),
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
		
		if (this._lastSelected) dojo.removeClass(this._lastSelected, "itemSelected")
		
		this._lastSelected = e.currentTarget
		
		dojo.addClass(e.currentTarget, "itemSelected")

		this.onClick(index, label)
	},
	
	_markSelected: function(e) {
		
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

	_alert: function (msg, origin, yes, no) {
		dialog3 = new apstrata.widgets.layout.Alert({width: 300, 
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

dojo.declare("apstrata.widgets.layout.HStackableMultiSelectList", 
[apstrata.widgets.layout.HStackableList], 
{
	templatePath: dojo.moduleUrl("apstrata.widgets.layout", "templates/HStackableMultiSelectList.html"),
	
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
