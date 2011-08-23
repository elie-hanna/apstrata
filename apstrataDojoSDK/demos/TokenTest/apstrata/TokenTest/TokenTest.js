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
dojo.provide("apstrata.TokenTest.TokenTest");

dojo.require("dojo.parser");

dojo.require("apstrata.Client")
dojo.require("apstrata.horizon.Login")
dojo.require("apstrata.StickyConnection")
dojo.require("apstrata.horizon.HStackableMainPanel")
dojo.require("apstrata.horizon.Preferences")

dojo.declare("apstrata.TokenTest.TokenTest", 
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

		// Create the leftMost Panel
		this.main = new apstrata.TokenTest.Login({container: self})
		this.addChild(this.main)
		
		this.inherited(arguments)
	}
});

dojo.require("apstrata.TokenTest.ApConfig");

dojo.declare("apstrata.TokenTest.Login", 
[apstrata.horizon.Login], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.TokenTest", "templates/Login.html"),
	PARAMETER_TOKEN_EXPIRES: "apsdb.tokenExpires",
	PARAMETER_TOKEN_LIFE_TIME: "apsdb.tokenLifetime",

	maximizePanel: true,
	
	constructor: function() {
		var config = new apstrata.TokenTest.ApConfig();
		this.key = {};
		this.key.value = config.get().key;
	},
	
	postCreate: function() {
		console.debug(this.templatePath)
		this.inherited(arguments)
	},
	
	loginUser: function() {
		var self = this;
		var config = apstrata.apConfig.get();

		var parameters = {};
		parameters[self.PARAMETER_TOKEN_EXPIRES] = config.tokenExpires;
		parameters[self.PARAMETER_TOKEN_LIFE_TIME] = config.tokenLifetime;
		this.inherited(arguments, [ parameters ]);
	},
	
	/**
	 * Closes the existing panel and opens the registration panel.
	 * NOTE: Called from the "Register here" link in the Login.html file
	 */
	switchToRegisterPanel: function () {
		//this.getParent().openPanel(apstrata.mForms.RegistrationPanel);
	}
});
