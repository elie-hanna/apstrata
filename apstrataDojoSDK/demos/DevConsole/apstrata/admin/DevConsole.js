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
dojo.provide("apstrata.admin.DevConsole")

dojo.require("apstrata.Client")

dojo.require('apstrata.admin.MainPanel')

/*
 * Main apstrata developer console widget. It encapsulates the HStackableContainer panels container
 */
dojo.declare("apstrata.admin.DevConsole", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templateString: "<div><div class='devConsoleBackground rounded-sml' dojoAttachPoint='background'></div><div dojoType='apstrata.widgets.HStackableContainer' dojoAttachPoint='container'></div></div>",
	widgetsInTemplate: true,

	connection: null,

	constructor: function(attrs) {
		var self = this
		
		this.connection = attrs.connection
		this.client = new apstrata.Client({
			connection: connection,
			handleResult: function(operation) {
				
			},
			handleError: function(operation) {
				var msg = 'Oops, there seems to be a problem:<br><br><b>' + operation.response.metadata.errorMessage + '</b>'
				self.alert(msg, self.domNode)
			}
		})
	},

	postCreate: function() {
		var self = this

//		var loginWidget = new apstrata.widgets.client.LoginWidget({client: self.client, visibleWidth: "17", offsetFromCenter: "440"})
//		dojo.place(loginWidget.domNode, dojo.body, "last")
		
		dojo.addClass(this.container.domNode, 'devConsole')
		
		this.main = new apstrata.admin.MainPanel({container: self})
		this.addChild(this.main)

		self.output = dojo.byId('consoleOutput')
	},
	
	open: function(label) {
		this.main.open(label)
	},
	
	addChild: function(child) {
		this.container.addChild(child)
	},
	
	alert: function(msg, origin) {
		dialog3 = new apstrata.widgets.Alert({width: 300, 
												height: 250, 
												actions: "close", 
												message: msg, 
												clazz: "rounded-sml Alert", 
												iconSrc: apstrata.baseUrl + "/resources/images/pencil-icons/alert.png", 
												animation: {from: origin}, 
												modal: true })

		dialog3.show()
		dojo.connect(dialog3, "buttonPressed", function(label) {
			dialog3.hide()
		})
	},
	
	print: function(msg) {
		dojo.create("div", {innerHTML: msg, style: {position: 'relative', left: '200px', width: '800px'}}, this.background)

		this.background.scrollTop = this.background.scrollHeight - this.background.clientHeight

	}
})
