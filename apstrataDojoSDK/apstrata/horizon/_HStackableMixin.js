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

dojo.provide("apstrata.horizon._HStackableMixin")

dojo.require("dojox.dtl._Templated")
dojo.require("dijit.layout._LayoutWidget")

/*
 * This mixin class insures that a HStackable Widget animates/opens in the appropriate position in the Stackable Container
 */
dojo.declare("apstrata.horizon._HStackableMixin", [], 
{
	parentListId: "",
	parentList: null,

	maximizePanel: false,
	width: 160,
	height: 300,

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
		if (this.maximizePanel) {
			if (this._openPanel) {
				if (!this._maximizeWidth) {
					this._maximizeWidth = self.getContainer().getRemainingFreeWidth(self.id)+'px'		
				}
			} else {
				this._maximizeWidth = self.getContainer().getRemainingFreeWidth(self.id)+'px'		
			}
			dojo.style(this.domNode, {width: self._maximizeWidth})
		}
		 
//		dojo.style(this.domNode, {height: (this.getContainer().height - 20) + "px"})

		// Change panel width to occupy all remaining free space in container
		//if (this.maximizePanel) dojo.style(this.domNode, {width: self.getContainer().getRemainingFreeWidth(self.id)+'px'})
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
		this.closePanel();

		// Use the parentList and container parameters if they were sent in the argument list.
		var parentList = null;
		var container = null;
		if (args) {
			if (args.parentList)
				parentList = args.parentList;
			if (args.container)
				container = args.container;
		}
		if (parentList == null)
			parentList = self;
		if (container == null)
			container = self.getContainer();

		// Mixin to the custom args the pointers to the parent and container		
		var newArgs = dojo.mixin(args, {parentList: parentList, container: container})
		
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

