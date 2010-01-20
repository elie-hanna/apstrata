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

dojo.provide("apstrata.horizon.Preferences")

dojo.require("dijit.form.Form")
dojo.require("dijit.form.Button")
dojo.require("dijit.form.ToggleButton")
dojo.require("dijit.form.ValidationTextBox")
dojo.require("dijit.form.DateTextBox")
dojo.require("dijit.form.HorizontalSlider")
dojo.require("dijit.form.HorizontalRuleLabels")

dojo.declare("apstrata.horizon.Preferences", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.horizon", "templates/PreferencesPanel.html"),

	maximizePanel: true,
	
	constructor: function() {
		this.serviceUrl = connection.serviceUrl
		
		this._TIMEOUT_VALUES = [5000, 10000, 20000, 30000, 60000, 120000]

	},
	
	postCreate: function() {
		this.preferences = this.getContainer().loadPreferences()
		
		this.chkHelp.attr('checked', this.preferences.showContextualHelp)
		this.chkRest.attr('checked', this.preferences.showRestMonitor)

		this.fldServiceUrl.value = this.preferences.serviceUrl?this.preferences.serviceUrl:"http://apsdb.apstrata.com/sandbox-apsdb/rest"
		this.sldTimeout.attr('value', dojo.indexOf(this._TIMEOUT_VALUES, this.preferences.timeout))

		this.inherited(arguments)
	},
	
	_help: function(val) {
		this.preferences.showContextualHelp = val
		this.savePreferences()
	},
	
	_rest: function(val) {
		this.preferences.showRestMonitor = val
		this.savePreferences()
	},
	
	_serviceUrl: function() {
		this.preferences.serviceUrl = this.fldServiceUrl.value
		this.savePreferences()
	},
	
	
	/*
		<div dojoType='dijit.form.ToggleButton' style='font-size: 0.8em; color: #0000AA'
			dojoAttachPoint="chkToaster" dojoAttachEvent="onChange: _toaster"
			iconClass='dijitCheckBoxIcon'>Enable Toaster</div><br><br>
	_toaster: function(val) {
		if (val) {
			toaster.show()
		} else {
			toaster.hide()
		}

		this.savePreferences()
	},
	 */
	
	_timeout: function(value) {
		this.preferences.timeout = this._TIMEOUT_VALUES[value]
		this.savePreferences()
	},
	
	savePreferences: function() {
		var self = this
		this.preferences.serviceUrl = this.fldServiceUrl.value

		this.getContainer().savePreferences(this.preferences)
	},
	
	destroy: function() {
		this.savePreferences()
		console.dir(this.getContainer().loadPreferences())
		
		this.inherited(arguments)
	}
})
