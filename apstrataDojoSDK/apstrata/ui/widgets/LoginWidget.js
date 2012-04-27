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
		
		var configRegistry = dojo.getObject("apstrata.apConfig.widgetConfig")
		
		if (configRegistry) {
			var config = configRegistry["apstrata.ui.widgets.Login"]
			if (config) dojo.mixin(this, config)
		}
	},

	postCreate: function() {
		var self = this
		
		if (this.autoLogin) {
			var connection
			var values = apstrata.apConfig.credentials

			if (self.type == "user") {
				connection = new apstrata.sdk.Connection({credentials: values, loginType: "user"})
			} else {
				connection = new apstrata.sdk.Connection({credentials: values, loginType: "master"})
			}

			connection.login().then(
				function() {
					self.form.enable()
					self._animation.hide()
					if (self._success) self._success(values)
				},
				function() {
					self.form.enable()
					self._animation.hide()
					self.form.vibrate(self.domNode)
					self.message(self.nls.BAD_CREDENTIALS)
					
					if (self._failure) self._failure()
				}
			)
		} else {
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
					dojo.mixin(values, apstrata.apConfig.credentials)
	
					if (self.type == "user") {
						connection = new apstrata.sdk.Connection({credentials: values, loginType: "user"})
					} else {
						connection = new apstrata.sdk.Connection({credentials: values, loginType: "master"})
					}
	
					connection.login().then(
						function() {
							self.form.enable()
							self._animation.hide()
							if (self._success) self._success(values)
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
			if (apstrata.apConfig) this.form.set("value", apstrata.apConfig.credentials)
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
	}
})
