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

dojo.provide("apstrata.devConsole.ConfigurationPanel");

dojo.declare("apstrata.devConsole.ConfigurationPanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/ConfigurationPanel.html"),
	
	constructor: function(attrs) {

	},
	
	postCreate: function() {
		var self = this;
		var request = {};
		
		var attrs = {
			action: "ListConfiguration",
			request: request,
			load: function(operation) {
				var q = operation.response.result;
				self.createSchemaACL.attr("value", q.createSchemaACL);
				self.createScriptACL.attr("value", q.createScriptACL);
				self.sendEmailACL.attr("value", q.sendEmailACL);
				if(q.disableSchemalessDocs == true || q.disableSchemalessDocs=="true")
					self.disableSchemalessDocs.attr("checked", q.disableSchemalessDocs);
			},
			error: function(operation) {
			}
		}
		this.container.client.call(attrs);
		this.inherited(arguments);
	},

	_save: function() {
		var self = this;
		if (this.configurationForm.validate()) {
			var request = {};
			request["apsdb"] = {
				createSchemaACL: self.createSchemaACL.getValue(),
				createScriptACL: self.createScriptACL.getValue(),
				sendEmailACL: self.sendEmailACL.getValue(),
				disableSchemalessDocs: self.disableSchemalessDocs.attr("checked")
			}
			var attrs = {
				action: "SaveConfiguration",
				request: request,
				load: function(operation){
				},
				error: function(operation){
				}
			};
			this.container.client.call(attrs);
		}
	},
	
	_cancel: function() {
		this.panel.destroy()
	}
})