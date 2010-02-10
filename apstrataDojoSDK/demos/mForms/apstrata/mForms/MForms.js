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
dojo.provide("apstrata.mForms.MForms")
dojo.provide("apstrata.mForms.MainPanel")

dojo.require('dojox.widget.Toaster')
dojo.require("dojo.parser");

dojo.require("apstrata.Client")
dojo.require("apstrata.horizon.Login")

dojo.require("apstrata.StickyConnection")

dojo.require("apstrata.horizon.HStackableMainPanel")
dojo.require("apstrata.horizon.Preferences")

dojo.require("apstrata.mForms.Campaigns")
dojo.require("apstrata.mForms.Targets")
dojo.require("apstrata.mForms.Forms")


dojo.declare("apstrata.explorer.MainPanel", 
[apstrata.horizon.HStackableMainPanel], 
{
	data: [
		{label: "introduction", iconSrc: "../../apstrata/resources/images/pencil-icons/home.png"},
		{label: "targets", iconSrc: "../../apstrata/resources/images/pencil-icons/users.png"},
		{label: "forms", iconSrc: "../../apstrata/resources/images/pencil-icons/survey.png"},
		{label: "campaigns", iconSrc: "../../apstrata/resources/images/pencil-icons/calendar.png"},
//		{label: "extract", iconSrc: "../../apstrata/resources/images/pencil-icons/statistic.png"},
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
			case 'targets': this.openPanel(apstrata.mForms.Targets); break;
			case 'forms': this.openPanel(apstrata.mForms.Forms); break;
			case 'campaigns': this.openPanel(apstrata.mForms.Campaigns); break;
			case 'logout':  this.getContainer().connection.logout(); break;
		}
	},

	onClick: function(index, label) {
		var self = this

		if ((label == 'introduction') || (label == 'preferences')) {
			switch (label) {
				case 'introduction': this.home(); break;
				case 'preferences': this.openPanel(apstrata.horizon.Preferences); break;
			}
		} else {
			if (connection.hasCredentials()) {
				self._openPanelbyLabel(label)
			} else {
				var okay = false
				this.openPanel(apstrata.mForms.Login, {
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
		this.openPanel(apstrata.mForms.HomePanel)
	}
})

dojo.declare("apstrata.mForms.MForms", 
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
		this.main = new apstrata.explorer.MainPanel({container: self})
		this.addChild(this.main)
		
		this.inherited(arguments)
	}
})

dojo.declare("apstrata.mForms.HomePanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.mForms", "templates/HomePanel.html"),

	maximizePanel: true,
	
	constructor: function() {
		var config = new apstrata.mForms.ApConfig()
		
		if (config.get().cobranding) 
			if (config.get().cobranding.homePanelTemplate) 
				this.templatePath = config.get().cobranding.homePanelTemplate
	}
	
	
})

dojo.require("apstrata.mForms.ApConfig")

dojo.declare("apstrata.mForms.Login", 
[apstrata.horizon.Login], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.mForms", "templates/Login.html"),

	maximizePanel: true,
	
	constructor: function() {
		var config = new apstrata.mForms.ApConfig()
		
		this.key = {}
		this.key.value = config.get().key
	},
	
	postCreate: function() {
		console.debug(this.templatePath)
		this.inherited(arguments)
	},
	
	loginUser: function() {
		this.inherited(arguments)
	},
	
	/**
	 * Closes the existing panel and opens the registration panel.
	 * NOTE: Called from the "Register here" link in the Login.html file
	 */
	switchToRegisterPanel: function () {
		this.close();
		this.openPanel(apstrata.mForms.RegistrationPanel);
	}
})

dojo.declare("apstrata.mForms.RegistrationPanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.mForms", "templates/Registration.html"),

	maximizePanel: true,
	
	constructor: function() {
		var config = new apstrata.mForms.ApConfig()
		
		this.key = {}
		this.key.value = config.get().key
	},
	
	_onMouseoverUser: function() {
		dojo.style(this.dvRegisterUser, {background: "#AAAADD"})
	},
	
	_onMouseoutUser: function() {
		dojo.style(this.dvRegisterUser, {background: "#DDDDee"})
	},
	
	postCreate: function() {
		console.debug(this.templatePath)
		this.inherited(arguments)
	},
	
	/**
	 * 1- Call script API to generate a registration code and call the SaveDocument API under the current authenticating
	 *    owner with the registration code as a field, then send an email to the user with the registration code and return
	 *    the document key in the result
	 * 2- If calling the script API is successful, then remove the registration panel and put the verify registration panel
	 * 3- If calling the script API is NOT successful, then show an error message with the code and detail
	 */
	registerUser: function() {
		if (this.registerUserForm.validate()) {
			var self = this;
			if (self.password.value != self.reenteredPassword.value) {
				self.errorMsg.innerHTML = 'Passwords do not match';
				return;
			}

			var client = new apstrata.Client({connection: connection});

			var scriptRequest = dojo.mixin(
				{
					apsdb: {
						scriptName: "verifyMFormsUser1",
					}
				},
				{
					firstName: self.firstName.value,
					lastName: self.lastName.value,
					password: self.password.value,
					username: self.username.value,
					email: self.email.value
				});

			// Call the verifyMFormsUser1 script to save a document with the registration code and send an email to the user
			var verifyUserScript1 = client.call({
				action: "RunScript",
				request: scriptRequest,
				load: function(operation) {
					if (operation.result.status == 'success') {
						var documentKey = operation.result.documentKey;
						self.close();
						self.openPanel(apstrata.mForms.VerifyRegistrationPanel, documentKey);
					} else {
						//operation.result.errorDetail;
					}
				},
				error: function(operation) {
					//fail(operation)
				}
			});
		}
	}
})

dojo.declare("apstrata.mForms.VerifyRegistrationPanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.mForms", "templates/VerifyRegistration.html"),

	maximizePanel: true,
	documentKey: "",
	
	constructor: function(documentKeyParam) {
		var config = new apstrata.mForms.ApConfig()
		
		this.key = {}
		this.key.value = config.get().key
		this.documentKey = documentKeyParam;
	},
	
	_onMouseoverUser: function() {
		dojo.style(this.dvRegisterUser, {background: "#AAAADD"})
	},
	
	_onMouseoutUser: function() {
		dojo.style(this.dvRegisterUser, {background: "#DDDDee"})
	},
	
	postCreate: function() {
		console.debug(this.templatePath)
		this.inherited(arguments)
	},
	
	/**
	 * 1- When the user clicks on the verify button in the VerifyRegistrationPanel, we call another script with the
	 *    registration code, and document key that the user input and validate that they are the same in the saved document
	 *    through the script
	 * 2- If they are the same, then continue to wherever the user wanted to go before he registered
	 * 3- If they are the NOT same, then display an error message saying that the registration code is invalid
	 */
	verifyUser: function() {
		if (this.registerUserForm.validate()) {
			var client = new apstrata.Client({connection: connection});
			var self = this;

			var scriptRequest = dojo.mixin(
				{
					apsdb: {
						scriptName: "verifyMFormsUser2",
					}
				},
				{
					registrationCode: self.registrationCode.value,
					documentKey: self.documentKey
				});

			// Call the verifyMFormsUser2 script to verify that the registration code is correct, then create the user
			var verifyUserScript2 = client.call({
				action: "RunScript",
				request: scriptRequest,
				load: function(operation) {
					if (operation.result.status != 'success') {
						self.errorMsg.innerHTML = operation.result.errorDetail;
					}
				},
				error: function(operation) {
					//fail(operation)
				}
			});
		}
	}
})


