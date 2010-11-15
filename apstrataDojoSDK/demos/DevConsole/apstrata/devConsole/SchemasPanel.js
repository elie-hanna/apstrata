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

		// If the schema being shown is the UD schema, then show the default UD schema button to allow resetting the UD schema.
		if (self.schemaName == 'apsdb_user') {
			self.btnDefaultUDSchema.domNode.style.display = '';
		} else {
			self.btnDefaultUDSchema.domNode.style.display = 'none';
		}

		if (self.schemaName) {
			this.container.client.call({
				action: "GetSchema",
				request: {
					apsdb: {
						schemaName: self.schemaName
					}
				},
				load: function(operation) {
					self.fldName.attr("value", self.schemaName)
					self.txtSchema.attr("value", operation.response.result)

					self._initCodeEditor()
				},
				error: function(operation) {
				}
			})
		} else {
			self.txtSchema.value = ""

			// TODO: find a more elegant solution, initializing CodeEditor is giving an error, 
			//  unless some delay is provided
			setTimeout(dojo.hitch(this,'_initCodeEditor'), 500)	
		}

		this.inherited(arguments)
	},
	
	_initCodeEditor: function() {
		var self = this;
		editAreaLoader.init({
			id: self.txtSchema.id	// id of the textarea to transform
			,start_highlight: true	// if start with highlight
			,allow_resize: "both"
			,allow_toggle: false
			,word_wrap: true
			,language: "en"
			,syntax: "xml"
		});
	},

	/**
	 * Sets the default user directory schema in the edit area.
	 */
	_defaultUDSchema: function() {
		var self = this;
		var defaultUDSchema = '<schema>\n'
							+ '<aclGroups>\n'
							+ '        <aclGroup name="requiredVisibles">\n'
							+ '                <read>anonymous</read>\n'
							+ '                <fields>\n'
							+ '                        <field>login</field>\n'
							+ '                        <field>name</field>\n'
							+ '                        <field>groups</field>\n'
							+ '                        <field>password</field>\n'
							+ '                        <field>locale</field>\n'
							+ '                </fields>\n'
							+ '        </aclGroup>\n'
							+ '</aclGroups>\n'
							+ '<fields>\n'
							+ '        <field name="login" type="string" />\n'
							+ '        <field name="name" type="string"/>\n'
							+ '        <field name="groups" type="string" />\n'
							+ '        <field name="password" type="string" />\n'
							+ '        <field name="locale" type="string" />\n'
							+ '</fields>\n'
							+ '</schema>';
		editAreaLoader.setValue(self.txtSchema.id, defaultUDSchema);
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
			schema: editAreaLoader.getValue(self.txtSchema.id),
			update: self.update
		}

		if (self.schemaName != self.fldName.value) apsdb.newSchemaName = self.fldName.value
		
		this.container.client.call({
			action: "SaveSchema",
			request: {
				apsdb: apsdb
			},
			formNode: self.frmSchema.domNode,
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
					self.data.push({label: schema['name'], iconSrc: ""})
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
	
	onDeleteItem: function(index, label){
		var self = this
		
		this.container.client.call({
			action: "DeleteSchema",
			request: {
				apsdb: {
					schemaName: label
				}
			},
			load: function(operation){
				self.reload()
			},
			error: function(operation){
			}
		})
	},	

	newItem: function() {
		var self = this

		self.openPanel(apstrata.devConsole.SchemaEditorPanel)
		
		this.inherited(arguments)
	}
})
