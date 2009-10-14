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
//		templatePath: dojo.moduleUrl("apstrata.apsdb.client.widgets", "templates/ConnectionStatus.html"),
		templateString: "<div></div>",
		constructor: function(/* apstrata.apsdb.client.Connection */ connection) {			
			var self = this;
			self.connection = connection

			dojo.require('apstrata.widgets.Alert')
			var dialog = new apstrata.widgets.Alert({width: 152, height: 152, message: "<div style='width: 100%; text-align: center;font-family: arial;color:#444444;'>talking to</div>", clazz: "rounded-sml"})

			dojo.style(dialog.domNode, {
				background: "url('"+apstrata.baseUrl+"/resources/images/apstrata-clouds.gif')",
				border: "solid 1px grey"
			})

			dojo.connect(connection.activity, "busy", function() { 
				dialog.show()
			
			//self.dlgWait.show() 
			})
			dojo.connect(connection.activity, "free", function() { 
				dialog.hide()
			//self.dlgWait.hide()
			})			
		}
		
	});
