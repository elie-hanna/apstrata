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
dojo.provide("apstrata.devConsole.DevConsole")

dojo.require("apstrata.horizon.HStackableMainPanel")

dojo.require("apstrata.horizon.Login")
dojo.require("apstrata.horizon.Preferences")

dojo.require("apstrata.devConsole.HomePanel")
dojo.require("apstrata.devConsole.ConfigurationPanel")
dojo.require("apstrata.devConsole.StoresPanel")
dojo.require("apstrata.devConsole.SchemasPanel")
dojo.require("apstrata.devConsole.ScriptsPanel")
dojo.require("apstrata.devConsole.GroupsPanel")
dojo.require("apstrata.devConsole.UsersPanel")

dojo.declare("apstrata.devConsole.MainPanel", 
[apstrata.horizon.HStackableMainPanel], 
{
	data: [
		{label: "home", iconSrc: "../../apstrata/resources/images/pencil-icons/home.png"},
		{label: "stores", iconSrc: "../../apstrata/resources/images/pencil-icons/datebase.png"},
		{label: "schemas", iconSrc: "../../apstrata/resources/images/pencil-icons/schema.png"},
		{label: "scripts", iconSrc: "../../apstrata/resources/images/pencil-icons/configuration.png"},
		{label: "groups", iconSrc: "../../apstrata/resources/images/pencil-icons/users.png"},
		{label: "users", iconSrc: "../../apstrata/resources/images/pencil-icons/user-man.png"},
//		{label: "favourites", iconSrc: "../../apstrata/resources/images/pencil-icons/favourites.png"},
		{label: "configuration", iconSrc: "../../apstrata/resources/images/pencil-icons/configuration.png"},
		{label: "preferences", iconSrc: "../../apstrata/resources/images/pencil-icons/tick.png"}
//		{label: "logout", iconSrc: "../../apstrata/resources/images/pencil-icons/left.png"}
	],
	
	constructor: function() {
		this.setConnection(connection)
	},
	
	_openPanelbyLabel: function(label) {
		switch (label) {
			case 'configuration': this.openPanel(apstrata.devConsole.ConfigurationPanel); break;
			case 'stores': this.openPanel(apstrata.devConsole.StoresPanel); break;
			case 'schemas': this.openPanel(apstrata.devConsole.SchemasPanel); break;
			case 'scripts': this.openPanel(apstrata.devConsole.ScriptsPanel); break;
			case 'groups': this.openPanel(apstrata.devConsole.GroupsPanel); break;
			case 'users': this.openPanel(apstrata.devConsole.UsersPanel); break;
			case 'favourites': this.openPanel(apstrata.devConsole.FavouritesPanel); break;
			case 'logout':  this.getContainer().connection.logout(); break;
		}
	},

	onClick: function(index, label) {
		var self = this

		if ((label == 'home') || (label == 'preferences')) {
			switch (label) {
				case 'home': this.openPanel(apstrata.devConsole.HomePanel); break;
				case 'preferences': this.openPanel(apstrata.horizon.Preferences); break;
			}
		} else {
			if (connection.hasCredentials()) {
				self._openPanelbyLabel(label)
			} else {
				var okay = false
				this.openPanel(apstrata.devConsole.Login, {
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
	
	_login: function() {
		this.container.connection.login()
	},
	
	startup: function() {
		this.home()
		
		// TODO: this is a temporary solution, the delay makes it work but it needs to be fixed
//		if (this.getContainer().connection.hasCredentials()) 
//			setTimeout(dojo.hitch(this.getContainer().connection, "login"), 500)
		/*
		if(this.getContainer().connection.hasCredentials()){
			this.getContainer().connection.login()			
		}else{
			
		}
	*/
		this.getContainer().connection.credentials.secret =  "";
		this.getContainer().connection.credentials.password =  "";
		
		this.inherited(arguments)
	},
	
	home: function() {
		this.openPanel(apstrata.devConsole.HomePanel)
	}
})

dojo.declare("apstrata.devConsole.DevConsole",
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

		if (!attrs.connection) this.connection = new apstrata.Connection()

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
				var msg = 'Oops, there seems to be a problem:<br><br><b>' + errMsg.replace(/\&/g, "&amp;").replace(/\\u000a/g, " ").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;") + '</b>'
				apstrata.alert(msg, self.domNode)
			}
		})
		
		this.margin = {}
		
		this.margin.left = 25
		this.margin.right = 25
		this.margin.top = 75
		this.margin.bottom = 30
		

/*
		this.margin.w = 50
		this.margin.h = 145

		this.margin.topH = 70
		this.margin.bottomH = 40
		this.margin.leftW = 25
		this.margin.rightW = 25

		this.width = 450
		this.height = 250
*/
	},
	
	postCreate: function() {
		var self = this

		// Create the leftMost Panel
		this.main = new apstrata.devConsole.MainPanel({container: self})
		this.addChild(this.main)
		
		this.inherited(arguments)
	}
}),

dojo.require("apstrata.devConsole.ApConfig")

dojo.declare("apstrata.devConsole.Login", 
[apstrata.horizon.Login], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/Login.html"),

	maximizePanel: true
})
