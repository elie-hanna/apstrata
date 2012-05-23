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

dojo.provide('apstrata.ui.widgets.LoginWidget');

dojo.require('dojox.dtl._Templated');
dojo.require('dijit.form.ValidationTextBox')

dojo.require('apstrata.ui.forms.FormGenerator')
dojo.require('apstrata.ui.FlashAlert')
dojo.require('apstrata.ui.ApstrataAnimation')

dojo.require('apstrata.sdk.Connection')
dojo.require('apstrata.sdk.Client')

dojo.require('apstrata.horizon.Preferences');

dojo.requireLocalization("apstrata.ui.widgets", "login-widget")

dojo.declare("apstrata.ui.widgets.LoginWidget", 
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.ui.widgets", "templates/LoginWidget.html"),
	
	autoLogin: false,
	
	constructor: function(attrs) {
		this.type = attrs.type
		this.nls = dojo.i18n.getLocalization("apstrata.ui.widgets", "login-widget")
		this.showPreferencesLink = false;
		
		dojo.mixin(this, apstrata.registry.get("apstrata.ui", "widgets.Login"))
	},
	
	_setUpLoginForm: function() {
		var self = this
		
		this._animation = new apstrata.ui.ApstrataAnimation({node: self.domNode})

		this.form = new apstrata.ui.forms.FormGenerator({
			definition: {
				label: "Login",
				cssClass: "newClass",
				fieldset: [
					{name: "key", required: true, displayGroup: "master"},
					{name: "secret", required: true, type: "password", displayGroup: "master"},
					{name: "key", required: true, displayGroup: "key"},
					{name: "user", required: true, displayGroup: "user"},
					{name: "password", required: true, type: "password", displayGroup: "user"},
				],
				actions: ['login']
			},
			displayGroups: self.type?self.type:"master",
			login: function(values) {
				self.form.disable()
				self._animation.show()

				var connection
				var credentials
				var serviceUrl
				var timeout
				
				if (apstrata.registry.get("apstrata.sdk", "Connection")) {
					credentials = apstrata.registry.get("apstrata.sdk", "Connection").credentials
					serviceUrl = apstrata.registry.get("apstrata.sdk", "Connection").serviceURL
					timeout = apstrata.registry.get("apstrata.sdk", "Connection").timeout
				}
				
				dojo.mixin(credentials, values)

				if (self.type == "user") {
					connection = new apstrata.sdk.Connection({credentials: credentials, serviceUrl: serviceUrl, timeout: timeout, loginType: "user"})
				} else {
					connection = new apstrata.sdk.Connection({credentials: credentials,  serviceUrl: serviceUrl, timeout: timeout, loginType: "master"})
				}

				connection.login().then(
					function() {
						self.form.enable()
						self._animation.hide()
						if (self._success) self._success(credentials)
					},
					function() {
						self.form.enable()
						self._animation.hide()
						self.form.vibrate(self.domNode)
						self.message(self.nls.BAD_CREDENTIALS)
						
						if (self._failure) self._failure()
					}
				)
			}	
		})
		dojo.place(this.form.domNode, this.dvLogin)

		// If credentials have been supplied in apConfig, show them
		if (apstrata.registry.get("apstrata.sdk", "Connection")) this.form.set("value", apstrata.registry.get("apstrata.sdk", "Connection").credentials)
		
		//Add the preferences link
		if (this.showPreferencesLink) {
			var prefsButton = new dijit.form.Button({
				label: 'Preferences',
				onClick: function() {
					self.showPreferences();
				}
			});
			dojo.place(prefsButton.domNode, this.dvLogin);
		}
	},

	postCreate: function() {
		var self = this
		
		this._setUpLoginForm()

		if (this.autoLogin) {
			self.form.disable()

			this._animation = new apstrata.ui.ApstrataAnimation({node: self.domNode})
			var credentials = apstrata.registry.get("apstrata.sdk", "Connection").credentials
			var serviceUrl =  apstrata.registry.get("apstrata.sdk", "Connection").serviceURL
			var timeout = apstrata.registry.get("apstrata.sdk", "Connection").timeout

			if (self.type == "user") {
				connection = new apstrata.sdk.Connection({credentials: credentials, serviceUrl: serviceUrl, timeout: timeout, loginType: "user"})
			} else {
				connection = new apstrata.sdk.Connection({credentials: credentials, serviceUrl: serviceUrl, timeout: timeout, loginType: "master"})
			}

			connection.login().then(
				function() {
					self.form.enable()
					if (self._success) self._success(credentials)
				},
				function() {
					self.form.enable()
				}
			)
		}

		this.inherited(arguments)	
	},
	
	message: function(message) {
		var self = this
		
		var alert = new apstrata.ui.FlashAlert({
			message: message,
			node: self.dvLogin
		})
		dojo.place(alert.domNode, this.domNode)
	},
	
	then: function(success, failure) {
		this._success = success
		this._failure = failure
	},
	
	/**
	 * Intercepts calls to set when name = "dimension" and sets curtain size
	 * @param {Object} name
	 * @param {Object} v
	 */
	set: function(name, v) {
		if ((name=="centerTo") && v){
			// Center the Login Widget inside the rectangle defined by v
			var d = dojo.marginBox(this.domNode)
			if (this.domNode) 
				dojo.style(this.domNode, {
					top:  v.top + (v.height - d.h)/2 + "px",
					left: v.left + (v.width - d.w)/2 + "px"
				})
		}
		this.inherited(arguments)
	},
	
	showPreferences: function() {		
		this.dvLogin.innerHTML = '';
		
		var prefs = new apstrata.horizon.Preferences({container: this.container});
		dojo.place(prefs.domNode, this.dvLogin);
		
		//This is a temp fix until we get the CSS for the UI updated
		dojo.style(dojo.query('.LoginWidget .login .panel')[0], 'position', '');

		/*		
		var anim = dojox.fx.flip({ 
			node: prefs.domNode,
			dir: "left",
			depth: .5,
			duration:400
		});		
		
		anim.play();
		*/		
	}
})
