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

dojo.provide('apstrata.ui.widgets.LoginWidgetPreferences');

dojo.require("apstrata.horizon.Panel")

dojo.require('dijit.form.Form');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.ToggleButton');
dojo.require('dijit.form.ValidationTextBox');
dojo.require('dijit.form.DateTextBox');
dojo.require('dijit.form.HorizontalSlider');
dojo.require('dijit.form.HorizontalRuleLabels');

dojo.declare("apstrata.ui.widgets.LoginWidgetPreferences", 
[apstrata.horizon.Panel], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.ui.widgets", "templates/LoginWidgetPreferences.html"),

	maximizePanel: true,
	
	constructor: function(attrs) {
		this.serviceURL = ""
		this._TIMEOUT_VALUES = [5000, 10000, 20000, 30000, 60000, 120000]
		this.autoLogout = false;
		dojo.mixin(this, attrs);
	},
	
	postCreate: function() {
		this.preferences = this.loadPreferences();
		
		this.fldServiceURL.value = this.preferences.serviceURL?this.preferences.serviceURL:"https://sandbox.apstrata.com/apsdb/rest";

		if(this.preferences.timeout)
			this.sldTimeout.set('value', dojo.indexOf(this._TIMEOUT_VALUES, this.preferences.timeout))

		this.inherited(arguments)
	},
	
	savePreferences: function() {
		var self = this;
		
		var preferences = {
			serviceURL: self.fldServiceURL.value,
			timeout: self._TIMEOUT_VALUES[self.sldTimeout.value]
		}
		
		this.onChange(preferences)
		
		dojo.cookie(this.applicationId + "-prefs", dojo.toJson(preferences), { expires: 365 });
	},

	loadPreferences: function() {
		var prefs = {}

		try {
			var prefs = dojo.fromJson(dojo.cookie(this.applicationId + "-prefs"))
			if (!prefs) {
				prefs = {
					serviceURL: apstrata.apConfig["apstrata.sdk"].Connection.serviceURL,
					//timeout: this._TIMEOUT_VALUES[apstrata.apConfig["apstrata.sdk"].Connection.timeout]
					timeout: apstrata.apConfig["apstrata.sdk"].Connection.timeout
				};
			} else {
				this.onChange(prefs)
			}
		} catch (err) {
			
		}
		
		return prefs
	}

})
