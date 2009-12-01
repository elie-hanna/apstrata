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

dojo.require("apstrata.horizon.HStackableMainPanel")
dojo.require("apstrata.horizon.Login")
dojo.require("apstrata.horizon.Preferences")

dojo.declare("apstrata.explorer.MainPanel", 
[apstrata.horizon.HStackableMainPanel], 
{
	data: [
		{label: "home", iconSrc: "../../apstrata/resources/images/pencil-icons/home.png"},
		{label: "blog", iconSrc: "../../apstrata/resources/images/pencil-icons/movie.png"},
		{label: "survey", iconSrc: "../../apstrata/resources/images/pencil-icons/comment.png"},
		{label: "init demos", iconSrc: "../../apstrata/resources/images/pencil-icons/refresh.png"},
		{label: "preferences", iconSrc: "../../apstrata/resources/images/pencil-icons/tick.png"}
	],
	
	constructor: function() {
		this.setConnection(connection)
	},
	
	startup: function() {
		this.openPanel(apstrata.explorer.HomePanel)
		
		this.inherited(arguments)
	},
	
	_openPanelbyLabel: function(label) {
		switch (label) {
			case 'survey': this.openPanel(apstrata.explorer.Survey); break;
			case 'init demos': this.openPanel(apstrata.explorer.InitDemos); break;
			case 'logout':  this.getContainer().connection.logout(); break;
		}
	},

	onClick: function(index, label) {
		var self = this

		if ((label == 'home') || (label == 'blog') || (label == 'preferences')) {
			switch (label) {
				case 'home': this.home(); break;
				case 'blog': this.openPanel(apstrata.explorer.Blog); break;
				case 'preferences': this.openPanel(apstrata.horizon.Preferences); break;
			}
		} else {
			if (connection.hasCredentials()) {
				self._openPanelbyLabel(label)
			} else {
				var okay = false
				this.openPanel(apstrata.horizon.Login, {
					success: function() {
						okay = true
						if (okay) self._openPanelbyLabel(label)
					}, 
					failure: function() {
					} 
				})
			}
		}			
	},
	
	startup: function() {
		this.home()
		
		this.inherited(arguments)
	},
	
	home: function() {
		this.openPanel(apstrata.explorer.HomePanel)
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
				var errMsg 
				if (operation.response.metadata.errorDetail=="") {
					errMsg = operation.response.metadata.errorCode
				} else {
					errMsg = operation.response.metadata.errorDetail
				}
				
				var msg = 'Oops, there seems to be a problem:<br><br><b>' + errMsg + '</b>'
				apstrata.alert(msg, self.domNode)
			}
		})
		
		this.margin = {}
		
		this.margin.left = 25
		this.margin.right = 25
		this.margin.top = 75
		this.margin.bottom = 30
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
	}
})

dojo.declare("apstrata.explorer.HomePanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.explorer", "templates/HomePanel.html"),

	maximizePanel: true
})

dojo.declare("apstrata.explorer.InitDemos", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.explorer", "templates/InitDemos.html"),

	maximizePanel: true,

	_init: function() {
		var self = this

		// AJAX Load the summary text, based on summaryUrl
		dojo.xhrGet({
			url: "initAccount.json",
			handleAs: 'json',
			
			load: function(json) {
				var is = new apstrata.util.BulkUpdate({connection: connection, data: json})
			},
			
			error: function() {
				// not found
				apstrata.alert("File initAccount.json not found!")
			}
		})
	}
})

