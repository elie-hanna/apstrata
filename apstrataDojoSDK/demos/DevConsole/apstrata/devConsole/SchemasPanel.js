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

dojo.provide("apstrata.devConsole.SchemasPanel")

dojo.declare("apstrata.devConsole.SchemaEditorPanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,	
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/SchemaEditorPanel.html"),
	maximizePanel: true,
	
	constructor: function(attrs) {
		if (attrs.target) this.schemaName = attrs.target; else this.schemaName= ""
		if (attrs && attrs.target) this.update = true; else this.update = false
	},
	
	postCreate: function() {
		var self = this
		
		if (self.schemaName) {
			this.container.client.call({
				action: "GetSchema",
				request: {
					apsdb: {
						schemaName: self.schemaName
					}
				},
				load: function(operation) {
//					self.txtSchema.value =  self.formatXml(operation.response.result)
					self.txtSchema.value =  operation.response.result
					self.fldName.value = self.schemaName 
				},
				error: function(operation) {
				}
			})
		}
		
		this.inherited(arguments)
	},
	
	formatXml: function(xml) {
	    var formatted = '';
	    var reg = /(>)(<)(\/*)/g;
	    xml = xml.replace(reg, '$1\r\n$2$3');
	    var pad = 0;
	    dojo.forEach(xml.split('\r\n'), function(node) {
	        var indent = 0;
	        if (node.match( /.+<\/\w[^>]*>$/ )) {
	            indent = 0;
	        } else if (node.match( /^<\/\w/ )) {
	            if (pad != 0) {
	                pad -= 1;
	            }
	        } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
	            indent = 1;
	        } else {
	            indent = 0;
	        }
	
	        var padding = '';
	        for (var i = 0; i < pad; i++) {
	            padding += '  ';
	        }
	
	        formatted += padding + node + '\r\n';
	        pad += indent;
	    });
		console.debug(formatted)
	    return formatted;
	},


	_save: function() {
		var self = this

		if (self.schemaName=="") self.schemaName = self.fldName.value

		var apsdb = {
			schemaName: self.schemaName,
			schema: self.txtSchema.value,
			update: self.update
		}

		if (self.schemaName != self.fldName.value) apsdb.newSchemaName = self.fldName.value
		
		this.container.client.call({
			action: "SaveSchema",
			request: {
				apsdb: apsdb
			},
			load: function(operation) {
				self.getParent().reload()
			},
			error: function(operation) {
			}
		})
	}
})

dojo.declare("apstrata.devConsole.SchemasPanel", 
[apstrata.horizon.HStackableList], 
{	
	data: [],
	editable: true,

	reload: function() {
		var self = this
		
		this.container.client.call({
			action: "ListSchemas",
			load: function(operation) {
				// Rearrange the result to suite the template
				self.data = []
				dojo.forEach(operation.response.result.schemas, function(schema) {
					self.data.push({label: schema['@name'], iconSrc: ""})
				})			
	
				// Cause the DTL to rerender with the fresh self.data
				self.render()
	
				dojo.connect(self, 'onClick', function(index, label) {
					self.openPanel(apstrata.devConsole.SchemaEditorPanel, {target: label})
				})
			},
			error: function(operation) {
			}
		})
	},
	
	postCreate: function() {
		var self = this

		dojo.publish("/apstrata/documentation/topic", [{
			topic: "apstrata Stores APIs",
			id: "StoresAPI"
		}])
		
		this.reload()

		self.inherited(arguments)
	},

	newItem: function() {
		var self = this

		self.openPanel(apstrata.devConsole.SchemaEditorPanel)
		
		this.inherited(arguments)
	}
})
