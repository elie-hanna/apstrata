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
	
	startup: function() {
		this.openPanel(apstrata.explorer.HomePanel);
	},
	
	_openPanelbyLabel: function(label) {
		switch (label) {
			case 'blog': this.openPanel(apstrata.explorer.Blog); break;
			case 'survey': this.openPanel(apstrata.explorer.Survey); break;
			case 'init demos': this.openPanel(apstrata.explorer.InitDemos); break;
			case 'logout':  this.getContainer().connection.logout(); break;
		}
	},

	onClick: function(index, label) {
		var self = this

		if ((label == 'home') || (label == 'preferences')) {
			switch (label) {
				case 'home': this.home(); break;
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
				var msg = 'Oops, there seems to be a problem:<br><br><b>' + operation.response.metadata.errorDetail + '</b>'
				self.alert(msg, self.domNode)
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

	data: {
			configurations: [{
				apsdb: {
					createSchemaACL: "group:survey-users"
				}
			}],
			
			stores: [
				{
					apsdb: {
						store: 'explorerBlog',
						saveDocumentACL: 'group:blog-users',
						deleteDocumentACL: 'group:blog-users',
						getFileACL: 'anonymous',
						queryACL: 'anonymous'
					}
				},
				{
					apsdb: {
						store: 'surveyStore'
					}
				}
			],
			
			groups: [
				{
					apsim: {
						group: 'blog-users'
					}	
				},
				{
					apsim: {
						group: 'blog-admins'
					}	
				},
				{
					apsim: {
						group: 'survey-users'
					}	
				}
			],
			
			users: [
				{
					apsim:{
						user: 'joe',
						password: 'qw3rty',
						name: 'Joe Blogger',
						email: 'joe.blogger.explorer@apstrata.com',
						group: 'blog-users',
						update: 'false'
					}
				},
				{
					apsim:{
						user: 'jane',
						password: 'qw3rty',
						name: 'Jane Blogger',
						email: 'jane.blogger.explorer@apstrata.com',
						group: 'blog-users',
						update: 'false'
					}
				},
				{
					apsim:{
						user: 'mike',
						password: 'qw3rty',
						name: 'Michael Liss',
						email: 'michael.liss@apstrata.com',
						group: 'survey-users',
						update: 'false'
					}
				},
				{
					apsim:{
						user: 'ryan',
						password: 'qw3rty',
						name: 'Ryan Murray',
						email: 'ryan.murray@apstrata.com',
						group: 'survey-users',
						update: 'false'
					}
				},
			]
		},
	
	_init: function() {
		var self = this
		var is = new apstrata.util.BulkUpdate({connection: connection, data: self.data})
	}
})

