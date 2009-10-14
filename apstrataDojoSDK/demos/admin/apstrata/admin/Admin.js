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
dojo.provide("apstrata.admin.Admin")

dojo.declare("apstrata.admin.Admin", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templateString: "<div><div class='devConsoleBackground rounded-sml'></div><div dojoType='apstrata.widgets.HStackableContainer' dojoAttachPoint='container'></div></div>",
	widgetsInTemplate: true,

	connection: null,

	constructor: function(attrs) {
		if (attrs.connection) this.connection = connection
	},

	postCreate: function() {
		var self = this
		
		dojo.addClass(this.container.domNode, 'devConsole')
		
		var main = new apstrata.admin.MainPanel({container: self})
		this.addChild(main)
	},
	
	addChild: function(child) {
		this.container.addChild(child)
	}
})
