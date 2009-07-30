/*******************************************************************************
 *  Copyright 2009 apstrata
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *
 *  You may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0.html
 *  This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 *  CONDITIONS OF ANY KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations under the License.
 * *****************************************************************************
 */

dojo.provide("apstrata.apsdb.client.widgets.ConnectionStatus");

dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");

dojo.declare("apstrata.apsdb.client.widgets.ConnectionStatus",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.apsdb.client.widgets", "templates/ConnectionStatus.html"),
		
		constructor: function(/* apstrata.apsdb.client.Connection */ connection) {			
			var self = this;
			self.connection = connection

			dojo.connect(connection.activity, "busy", function() { self.dlgWait.show() })
			dojo.connect(connection.activity, "free", function() { self.dlgWait.hide() })			
		}
		
	});
