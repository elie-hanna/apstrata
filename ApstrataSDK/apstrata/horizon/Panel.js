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

dojo.provide('apstrata.horizon.Panel');

dojo.require('dojox.dtl._Templated')
dojo.require('apstrata.horizon.util._Templated')

dojo.require('dijit.layout.ContentPane')
dojo.require('apstrata.horizon.PanelIcons')
dojo.require("apstrata.horizon.PanelAlert")

dojo.require('apstrata.horizon.util.PanelAnimation')

dojo.declare("apstrata.horizon.Panel", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/Panel.html"),
	widgetsInTemplate: true,

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

			this._selectIds = attrs.selectIds
		}
		
		this._onGoingAnimation = true
		this._fixedPanel = false
		this.deferred = new dojo.Deferred()
	},

	/*
	 */
	_setStyle: function() {
		var self = this

		// Change panel width to occupy all remaining free space in container
		if (this.maximizePanel) {
			if (this._openPanel) {
				if (!this._maximizeWidth) {
					var marginL = dojo.style(self.domNode, "marginLeft")
					var marginR = dojo.style(self.domNode, "marginRight")
					this._maximizeWidth = self.getContainer().getRemainingFreeWidth(self.id) - marginL - marginR +'px'		
				}
			} else {
				this._maximizeWidth = self.getContainer().getRemainingFreeWidth(self.id) - dojo.style(this.domNode, "marginRight") - dojo.style(this.domNode, "marginLeft") +'px'		
			}
			dojo.style(this.domNode, {width: self._maximizeWidth})
		}
	},

	postCreate: function() {
		var self = this

		// mandatory style attributes for the panels to function
		dojo.style(this.domNode, "position", "absolute")
		dojo.style(this.domNode, "overflow", "hidden")
		dojo.style(this.domNode, "height", "99%")

		// When rendering the domNode id and widgetid are lost, save them them reinstall them in this.render
		this._savedId = this.domNode.id

		if (this.maximizable) {
			var icons = new apstrata.horizon.PanelIcons()
			dojo.place(icons.domNode, this.domNode)
			
//				dojo.style(icons.domNode, "left", dojo.position(self.domNode).w - dojo.position(icons.domNode).w - 20 + "px")
			
//			dojo.style(icons.domNode, "left", "10px")
			
			dojo.connect(icons, 'maximize', function() {
				self._savePos = dojo.marginBox(self.domNode)
				var w = dojo.marginBox(self.getContainer().domNode)
				
				var marginL = dojo.style(self.domNode, "marginLeft")
				var marginR = dojo.style(self.domNode, "marginRight")
				dojo.style(self.domNode, {
					left: "0px",
					width: w.w - marginL -marginR +"px", 
				})
				
				self.resize()
				self.getContainer.autoScroll()
			})
			dojo.connect(icons, 'restore', function() {
				var w = dojo.marginBox(self.getContainer().domNode)
				dojo.style(self.domNode, {
					left: self._savePos.l + "px",
					width: self._savePos.w +"px", 
				})

				self.resize()
				self.getContainer.autoScroll()
			})
		}

		// Instantiate the inner content widget		
		this._createContentWidget()
		
		this._animateToPosition()
		//self.deferred.callback({success: true})			

		this.inherited(arguments)
	},

	/**
	 * Instantiates an inner DTL content widget by dynamically creating a _Tempalted widget based on the contentTemplatePath
	 *  
	 *  expects:
	 *    this.contentTemplatePath equivalent of templatePath 
	 *    this.contentTemplateString equivalent of templateString
	 *    bindEvents array of strings, list of methods in Panel that are bound to events using dojoAttachEvent
	 *    	TODO: bindEvents should be made automatic
	 *  
	 *  adds the following:
	 *    this.contentDomNode: DOM node of the content panel widget
	 *    all events and attachpoints are linked to Panel
	 */
	_createContentWidget: function() {
		var containerPanel = this
		
		// If there's no contentTemplate Path or String, exit
		if (!(this.contentTemplatePath || this.contentTemplateString)) return

		var dynamicContentWidgetDefinition = {
			constructor: function() {
				var panel = this
				this.parentPanel = containerPanel
				
				dojo.forEach(containerPanel.bindEvents, function(event) {
					// bind methods associated with dojoAttachEvent(s) in this dynamic widget's context
					// 		as is expected by dijit._Widget 
					panel[event] = dojo.hitch(containerPanel, event)
				})
			},	
			
			postCreate: function() {
				// find all dojoAttachEvent nodes and make them properties to containerPanel 
				//		so they can be accessed from methods in containerPanel context
				dojo.query("[dojoAttachPoint]", this.domNode).forEach(function(node, index, arr) {
					containerPanel[dojo.attr(node, "dojoAttachPoint")] = node
				})
				
				// Call containerPanel postCreatePanel lifecycle method in its context
  				dojo.hitch(this, containerPanel.postCreateContent)()
			}
		}

		// Copy the template attributes into the new dynamic widget
		if (this.widgetsInTemplate) dynamicContentWidgetDefinition.widgetsInTemplate = true
		if (this.contentTemplateString) dynamicContentWidgetDefinition.contentTemplateString = this.contentTemplateString
		if (this.contentTemplatePath) dynamicContentWidgetDefinition.contentTemplatePath = this.contentTemplatePath

		// Declare a new class based on the prototype of dynamicContentWidgetDefinition
		dojo.declare(containerPanel.declaredClass+".Panel", [dijit._Widget, apstrata.horizon.util._Templated], dynamicContentWidgetDefinition)

		// Instantiate a new instance of dynamicContentWidgetDefinition
		var w = new (dojo.getObject(containerPanel.declaredClass+".Panel"))()
		this.contentDomNode = w.domNode
		
		// Place into DOM at the containerPanel node
		dojo.place(this.contentDomNode, containerPanel.dvContent)
	},
	
	postCreateContent: function() {
		
	},
	
	/**
	 * Panels are usually animated into place, this event gets called after the animation has ended
	 */
	onAnimationEnd: function() {
		// Resize after adding a panel because the scroll bar might show on the container
		// TODO: this should be handled differently
		this._onGoingAnimation = false
		if (this.doOpenPanel) this.doOpenPanel() 
		this.container.layout()
	},

	/*
	 * Creates sliding effect
	 */
	_animateToPosition: function() {
		var self = this
		apstrata.horizon.util.PanelAnimation(this)
	},

	getParent: function() {
		return this._parent
	},
	
	setFixedPanel: function(fixed) {
		this._fixedPanel = fixed	
	},
	
	isFixedPanel: function() {
		return this._fixedPanel
	},
	
	getPanelPosition: function() {
		return this.container.getChildPosition(this)
	},

	getContainer: function() {
		return this.container
	},

	/*
	 * Instantiates selected panel and opens it
	 */
	openPanel: function(panel, args) {

		/**
		 * Register a funtion to open a panel that will be called upon onAnimationEnd fires
		 */		
		this.doOpenPanel = function() {

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
					
	//		return this._openPanel
		}

		// If the panel is already open, code in onAnimationEnd won't be called again, so open the 
		//  panel here
		if (!this._onGoingAnimation) {
				this.doOpenPanel()			
		}
	},
	
	/*
	 * Closes a panel and ensures cleanup
	 */
	closePanel: function() {
		var degrees = 0;
//		dojo.require("dojox.css3.fx");
//		dojo.style(node, "transform", "rotate(70deg)");
// http://www.w3schools.com/css3/css3_2dtransforms.asp		

		
		// Destroy an existing child open panel
		if (this._openPanel) {
			this.getContainer().removeChild(this._openPanel)
			this._openPanel.destroyRecursive()
			this._openPanel = null
		}
	},
	
	/*
	 * 
	 */
	openById: function(id) {},
		
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
		var self = this
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
	},
	
	resize: function() {
		this._setStyle()
	},

	startup: function() {
		this.inherited(arguments);
		if (dojo.isIE && dojo.isIE == 9) {
			var box = dojo.marginBox(this.domNode);
			var footerHeight = 0;
			if(this.dvFooter){
				footerHeight = dojo.marginBox(this.dvFooter).h;
			}
			
			var totHeight = box.h - 40 - footerHeight;
			dojo.style(this.dvContent, "height", totHeight + "px");
			if (this._listContent) {
				dojo.style(this._listContent.domNode, "height", totHeight + "px");
			}			
		}
	},
	
	showAsBusy: function(b, message) {
		if (b) {
			if (this._curtain) return
			
			var c = dojo.marginBox(this.domNode)
			this._curtain = dojo.create("div", {}, this.domNode)
			dojo.style(this._curtain, {
				top: "0px", left: "0px",
				width: c.w + "px", height: c.h + "px"
			})
			dojo.addClass(this._curtain, "panelCurtain")
			
			this._curtainAnimation = dojo.create("div", {}, this._curtain)
			dojo.addClass(this._curtainAnimation, "busyIcon")
			
			var i = dojo.contentBox(this._curtainAnimation)
			dojo.style(this._curtainAnimation, {
				top: (c.h - i.h)/2 + "px",
				left: (c.w - i.w)/2 + "px"
			})

			this._curtainMessage = dojo.create("div", {}, this._curtain)
			dojo.addClass(this._curtainMessage, "busyMessage")
			
			if (message) this.setBusyMessage(message); else this.setBusyMessage("")
		} else {
			if (this._curtain) {
				if (this._curtain.parentNode)
					this._curtain.parentNode.removeChild(this._curtain)
				delete this._curtain
			}
		}
	},
	
	setBusyMessage: function(message) {
		this._curtainMessage.innerHTML = message

		var c = dojo.marginBox(this.domNode)
		var m = dojo.contentBox(this._curtainMessage)
		var i = dojo.marginBox(this._curtainAnimation)

		dojo.style(this._curtainMessage, {
			top: i.t+i.h + "px",
			left: (c.w - m.w)/2 + "px"
		})
	}, 
	
	displayError: function(errorCode, errorDetail) {
		var self = this
		
		new apstrata.horizon.PanelAlert({
			panel: self,
			width: 350,
			height: 150,
			title: "OOPS! An error has occured.",
			message: errorCode + ": " + errorDetail,
			iconClass: "errorIcon",
			actions: [
				'Ok'
			],
			actionHandler: function(action) {
				if (action=='Ok') {
					//do nothing
				} 
			}
		})
	}
})
