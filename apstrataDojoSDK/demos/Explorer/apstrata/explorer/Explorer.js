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
dojo.provide("apstrata.explorer.Explorer")
dojo.provide("apstrata.explorer.MainPanel")

dojo.require("apstrata.Client")
dojo.require("apstrata.explorer.Blog")
dojo.require("apstrata.explorer.Survey")
dojo.require("apstrata.horizon.Login")

dojo.require("apstrata.StickyConnection")

dojo.declare("apstrata.explorer.MainPanel", 
[apstrata.horizon.HStackableList], 
{
	data: [
		{label: "home", iconSrc: "../../apstrata/resources/images/pencil-icons/home.png"},
		{label: "blog", iconSrc: "../../apstrata/resources/images/pencil-icons/movie.png"},
		{label: "survey", iconSrc: "../../apstrata/resources/images/pencil-icons/comment.png"},
		{label: "preferences", iconSrc: "../../apstrata/resources/images/pencil-icons/tick.png"},
	],
	
	onClick: function(index, label) {
		var self = this
		if (label=='blog') this.openPanel(apstrata.explorer.Blog);
		else if (label=='home') this.openPanel(apstrata.horizon.Login);
		else if (label=='survey') this.openPanel(apstrata.explorer.Survey);
		else this.closePanel()
	}
})

dojo.declare("apstrata.explorer.Explorer", 
[apstrata.horizon.HStackableContainer], 
{
	connection: null,
	
	constructor: function(attrs) {
		var self = this
		
		if (attrs) {
			if (attrs.connection) {
				this.connection = attrs.connection
			} 
		}

		if (!attrs.connection) this.connection = new apstrata.StickyConnection()

		this.client = new apstrata.Client({
			connection: self.connection,
			handleResult: function(operation) {},
			handleError: function(operation) {
				var msg = 'Oops, there seems to be a problem:<br><br><b>' + operation.response.metadata.errorDetail + '</b>'
				self.alert(msg, self.domNode)
			}
		})
		
		this.margin = {}
		this.margin.w = 50
		this.margin.h = 145

/*
		this.margin.topH = 70
		this.margin.bottomH = 40
		this.margin.leftW = 25
		this.margin.rightW = 25
*/
		this.width = 450
		this.height = 250
	},
	
	postCreate: function() {
		var self = this

		dojo.addClass(this.domNode, 'horizon')

		// Create the background transparent div
		this.background = dojo.create("div", null, dojo.body())
		dojo.addClass(this.background, "horizonBackground")
		dojo.addClass(this.background, "rounded-sml")

		// Create the leftMost Panel
		this.main = new apstrata.explorer.MainPanel({container: self})
		this.addChild(this.main)
		
		this.inherited(arguments)
	},
	
	alert: function(msg, origin) {
		var dialog = new apstrata.widgets.Alert({width: 300, 
												height: 250, 
												actions: "close", 
												message: msg, 
												clazz: "rounded-sml Alert", 
												iconSrc: apstrata.baseUrl + "/resources/images/pencil-icons/alert.png", 
												animation: {from: origin}, 
												modal: true })

		dialog.show()
		dojo.connect(dialog, "buttonPressed", function(label) {
			dialog.hide()
		})
	}
})


