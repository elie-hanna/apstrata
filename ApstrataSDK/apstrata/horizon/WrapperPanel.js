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

dojo.provide('apstrata.horizon.WrapperPanel');

dojo.require("apstrata.horizon.Panel")

/**
 * Wraps any dijit inside a panel
 */
dojo.declare("apstrata.horizon.WrapperPanel", 
[apstrata.horizon.Panel], 
{	
	templateString: "<div class='panel Wrapper'>{{ }}<div dojoAttachPoint='dvHeader' class='header'></div><div dojoAttachPoint='dvContent' class='content'><div dojoAttachPoint='dvWidget'></div></div> <div dojoAttachPoint='dvFooter' class='footer'></div></div>",
	
	widgetsInTemplate: true,
	
	constructor: function(options) {
		var self = this
		this.options = options
		this.widgetClass = options.widgetClass
		this.attrs = options.attrs
		this.cssClass = options.cssClass
		
		if (options.maximizable) this.maximizable = true
	},
	
	postCreate: function() {
		var self = this
		
		if (this["cssClass"]) dojo.addClass(this.domNode, this["cssClass"])
		
		if (this.widgetClass) {
			var attrs = this.attrs?this.attrs:{};
			attrs.container = this.container;
			attrs.wrapperPanel = this;
			self._widget = new dojo.getObject(self.widgetClass)(attrs, self.dvWidget);
		}

		this.inherited(arguments)
	},
	
	//
	// Properties
	//
	getWidget: function() {
		return this._widget
	},
	
	
	// 
	// Public methods
	//
	resize: function() {
		var h = dojo.contentBox(this.domNode).h
		var hh = dojo.contentBox(this.dvHeader).h
		var fh = dojo.contentBox(this.dvFooter).h
		
		dojo.style(this.dvContent, {
			height: h-hh-fh + "px"
		})
	}
		
})

