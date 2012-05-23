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

dojo.provide('apstrata.horizon.Preferences');

dojo.require("apstrata.horizon.Panel")

dojo.require('dijit.form.Form');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.ToggleButton');
dojo.require('dijit.form.ValidationTextBox');
dojo.require('dijit.form.DateTextBox');
dojo.require('dijit.form.HorizontalSlider');
dojo.require('dijit.form.HorizontalRuleLabels');

dojo.declare("apstrata.horizon.Preferences", 
[apstrata.horizon.Panel], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/PreferencesPanel.html"),

	maximizePanel: true,
	
	constructor: function(attrs) {
		this.serviceUrl = ""
		this._TIMEOUT_VALUES = [5000, 10000, 20000, 30000, 60000, 120000]
		this.autoLogout = false;
		dojo.mixin(this, attrs);

	},
	
	postCreate: function() {
		this.preferences = this.getContainer().loadPreferences();
		
		this.fldServiceUrl.value = this.preferences.serviceUrl?this.preferences.serviceUrl:"https://sandbox.apstrata.com/apsdb/rest";

		if(this.preferences.timeout)
			this.sldTimeout.attr('value', dojo.indexOf(this._TIMEOUT_VALUES, this.preferences.timeout))

		this.inherited(arguments)
	},
	
	savePreferences: function() {
		var self = this;
		this.preferences.serviceUrl = this.fldServiceUrl.value;
		this.preferences.timeout = this._TIMEOUT_VALUES[this.sldTimeout.value];
		this.getContainer().savePreferences(this.preferences, this.autoLogout);
	}
})
