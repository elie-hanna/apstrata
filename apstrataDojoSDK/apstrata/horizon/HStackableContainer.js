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

dojo.provide("apstrata.horizon.HStackablePanel")
dojo.provide("apstrata.horizon.HStackableList")
dojo.provide("apstrata.horizon.HStackableContainer")
dojo.provide("apstrata.horizon.HStackableMainPanel")

dojo.require("dojo.cookie")

/*
 * Layout widget container of the HStackable widgets
 */
dojo.declare("apstrata.horizon.HStackableContainer", 
[dijit.layout._LayoutWidget], 
{
	
	applicationId: "horizon",
	
	_marginRight: 5,

	__children: {},
	
	constructor: function(attrs) {
		if (attrs && attrs.applicationId) this.applicationId = attrs.applicationId
	},
	
	startup: function() {
		setTimeout(dojo.hitch(this, 'loadPreferences'), 3000)
		
		this.inherited(arguments)
	},
	
	addChild: function(child) {
		this.__children[child.id] = child
		
		this.inherited(arguments)
	},
	
	removeChild: function(child) {
		if (this.__children[child.id]) delete this.__children[child.id]
		
		this.inherited(arguments)
	},
	
	autoScroll: function() {
		this.domNode.scrollLeft = this.domNode.scrollWidth - this.domNode.clientWidth
	},
		
	getRemainingFreeWidth: function(excludeId) {
		var w = 0
		
		for (id in this.__children) {
			if (id != excludeId) {
				var child = this.__children[id]
				
				w += child.domNode.offsetWidth
			}
		}

//	todo: don't know why this is not working on logout		
//		dojo.forEach(this.__children, function(child) {
//			w += child.domNode.offsetWidth
//		})
		return this.domNode.offsetWidth - w - this._marginRight * this.getChildren().length
	},

	/*
	 * Auto calculate coordinates and size of Explorer based on 
	 *  window size and this.margin analog to CSS margin
	 */
	_layoutMarginMode: function() {
		var w = dijit.getViewport()
		
		var coord = {}

		coord.top = (this.margin.top + this._marginRight) + "px"
		coord.left = (this.margin.left + this._marginRight) + "px"
		coord.width = (w.w - this.margin.left - this.margin.right - 2*this._marginRight) + "px"
		coord.height = (w.h - this.margin.top - this.margin.bottom - 2*this._marginRight) + "px"
		dojo.style(this.background, {
			top: (this.margin.top) + "px",
			left: (this.margin.left) + "px",
			width: (w.w - this.margin.left - this.margin.right) + "px",
			height: (w.h - this.margin.top - this.margin.bottom) + "px",
			zIndex: "10"
		})
		dojo.style(this.domNode, {
			top: coord.top,
			left: coord.left,
			width: coord.width,
			height: coord.height,
			zIndex: "100"
		})
	},

	/*
	 * Auto calculate coordinates and size of Explorer based on 
	 *  window size and explorer target size
	 */
	_layoutSizeMode: function() {
		coord.top = ((w.h - this.height)/2)
		coord.left = ((w.w - this.width)/2)
		coord.width = (this.width)
		coord.height = (this.height)


		dojo.style(this.background, {
			top: (this.margin.h/2) + "px",
			left: (this.margin.w/2) + "px",
			width: (w.w - this.margin.w) + "px",
			height: (w.h - this.margin.h) + "px",
			zIndex: "10"
		})

		dojo.style(this.domNode, {
			top: coord.top + "px",
			left: coord.left + "px",
			width: coord.width + "px",
			height: coord.height + "px",
			zIndex: "100"
		})
	},
	
	layout: function() {
		this._layoutMarginMode()

		// Call layout for each contained widget upon resize
		dojo.forEach(this.getChildren(), function(child) {
			child.layout()
		})

		this.inherited(arguments)
	},
	
	savePreferences: function(preferences) {
		dojo.cookie(this.applicationId + "-prefs", dojo.toJson(preferences))
		this.preferencesChanged(preferences)
	},
	
	loadPreferences: function() {
		var prefs = {}

		try {
			var prefs = dojo.fromJson(dojo.cookie(this.applicationId + "-prefs"))
			if (prefs) this.preferencesChanged(prefs); else prefs = {}
		} catch (err) {
			
		}
		
		return prefs
	},

	preferencesChanged: function(preferences) {}
})

/*
 * This mixin class insures that a HStackable Widget animates/opens in the appropriate position in the Stackable Container
 */
dojo.declare("apstrata.horizon._HStackableMixin", [], 
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
				this._parent = attrs.parentList
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
		if (this.maximizePanel) dojo.style(this.domNode, {width: self.getContainer().getRemainingFreeWidth(self.id)+'px'})
	},

	postCreate: function() {
		this._setStyle()
		
		this.inherited(arguments)
		this._animateToPosition()

		// When rendering the domNode id and widgetid are lost, save them them reinstall them in this.render
		this._savedId = this.domNode.id
	},
	
	/*
	 * Creates sliding effect
	 */
	_animateToPosition: function() {
		var self = this
		
		if (this.parentNode) {

			dojo.style(this.domNode, {
				left: (self.parentNode.offsetLeft) + "px",
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
				left: self.parentNode.offsetLeft + self.parentNode.offsetWidth + self.getContainer()._marginRight,
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

		// Add to DojoLayout container
		this.getContainer().addChild(this._openPanel)
		
		return this._openPanel
	},
	
	/*
	 * Closes a panel and ensures cleanup
	 */
	closePanel: function() {
		// Destroy an existing child open panel
		if (this._openPanel) {
			this.getContainer().removeChild(this._openPanel)
			this._openPanel.destroy()
			this._openPanel = null
		}
	},
	
	close: function() {
		this.getParent().closePanel()
	},
	
	/*
	 * Ensures cleanup when a panel is destroyed
	 */
	destroy: function() {
		this.closePanel()
		this.inherited(arguments)
	},
	
	/*
	 * Executes animation effect after a slide contents have been refreshed
	 */
	render: function() {
		this.inherited(arguments)

		// When rendering the domNode id and widgetid are lost, reinstall them
		dojo.attr(this.domNode, 'id', this._savedId)
		dojo.attr(this.domNode, 'widgetid', this._savedId)

		this._setStyle()

		this._animateToPosition()
	},

	/*
	 * Invoked by the container when the window size changes
	 */
	layout: function() {
		this._setStyle()
	}
})

/*
 * This is a general purpose HStackable that can be used to contain arbitrary widgets such as forms etc.
 */
dojo.declare("apstrata.horizon.HStackableWidget", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
})

/*
 * This is a container Layout & HStackable widget that can be used to contain arbitrary widgets such as forms etc.
 */
dojo.declare("apstrata.horizon.HStackableLayout", 
[dijit.layout._LayoutWidget, apstrata.horizon._HStackableMixin], 
{
})

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

dojo.declare("apstrata.horizon.HStackableMainPanel", 
[apstrata.horizon.HStackableList], 
{
	postCreate: function() {
		var mainPanel = this

		dojo.subscribe("/apstrata/connection/login/success", function(data) {
			mainPanel.data.push({label: "logout", iconSrc: "../../apstrata/resources/images/pencil-icons/left.png"})
			mainPanel.render()
		})
		
		dojo.subscribe("/apstrata/connection/logout", function(data) {
			mainPanel.data.pop()
			mainPanel.render()
			mainPanel.home()
		})
		
		this.inherited(arguments)
	},
	
	startup: function() {
		// TODO: this should not use global connection, find a solution
		if (connection.hasCredentials) {
			this.data.push({label: "logout", iconSrc: "../../apstrata/resources/images/pencil-icons/left.png"})
			this.render()
		} 
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
