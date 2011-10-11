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
		var defaultUDSchema = '<!-- \r\n'
							+ 'This is the default user schema. Feel free to modify it to your liking.\r\n'
							+ 'This schema follows all rules and restrictions as all other schemas, as do the documents (users) created out of it.\r\n'
							+ 'However, it imposes the following restrictions of its own:\r\n'
							+ '1. The five default fields (email, name, login, password and locale) are required.\r\n'
							+ '2. This schema cannot be deleted.\r\n'
							+ '\r\n'
							+ 'Additionally, since this schema is used for user management, the following ACLs are set by default upon creation of each new user document:\r\n'
							+ '- document.readACL = login, creator\r\n'
							+ '- document.writeACL = login, creator\r\n'
							+ '- deleteACL = nobody\r\n'
							+ '- requiredVisibles.readACL = login, creator\r\n'
							+ '- requiredEditables.readACL = login, creator\r\n'
							+ '- requiredEditables.writeACL = login, creator\r\n'
							+ '\r\n'
							+ 'You can specify your own ACLs upon user creation by passing them as parameters to the SaveUser API as described in the documentation.\r\n'
							+ '-->\r\n'
							+ '<schema>\r\n'
							+ '  <aclGroups>\r\n'
							+ '    <aclGroup name="requiredHidden">\r\n'
							+ '      <read>creator</read>\r\n'
							+ '      <write>creator</write>\r\n'
							+ '      <fields>\r\n'
							+ '        <field>groups</field>\r\n'
							+ '      </fields>\r\n'
							+ '    </aclGroup>\r\n'
							+ '    <aclGroup name="requiredVisibles">\r\n'
							+ '      <read>creator</read>\r\n'
							+ '      <write>nobody</write>\r\n'
							+ '      <fields>\r\n'
							+ '        <field>login</field>\r\n'
							+ '      </fields>\r\n'
							+ '    </aclGroup>\r\n'
							+ '    <aclGroup name="requiredEditables">\r\n'
							+ '      <read>creator</read>\r\n'
							+ '      <write>creator</write>\r\n'
							+ '      <fields>\r\n'
							+ '        <field>name</field>\r\n'
							+ '        <field>password</field>\r\n'
							+ '        <field>locale</field>\r\n'
							+ '      </fields>\r\n'
							+ '    </aclGroup>\r\n'
							+ '    <defaultAcl>\r\n'
							+ '      <read>creator</read>\r\n'
							+ '      <write>creator</write>\r\n'
							+ '    </defaultAcl>\r\n'
							+ '    <schemaAcl>\r\n'
							+ '      <read>creator</read>\r\n'
							+ '      <write>creator</write>\r\n'
							+ '      <delete>nobody</delete>\r\n'
							+ '    </schemaAcl>\r\n'
							+ '  </aclGroups>\r\n'
							+ '  <fields>\r\n'
							+ '    <field name="login" type="string"/>\r\n'
							+ '    <field name="name" type="string"/>\r\n'
							+ '    <field name="groups" type="string"/>\r\n'
							+ '    <field name="password" type="string" />\r\n'
							+ '    <field name="locale" type="string" />\r\n'
							+ '  </fields>\r\n'
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

		if (!self.update) self.schemaName = self.fldName.value

		var apsdb = {
			schemaName: self.schemaName,
			schema: editAreaLoader.getValue(self.txtSchema.id),
			update: self.update
		}

		if (self.update && self.schemaName != self.fldName.value) apsdb.newSchemaName = self.fldName.value
		
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
	
	editItems: function() {
		var self = this
		
		// Close any open panels
		this.closePanel()
		
		if (this._editMode) {
			var items = dojo.query('.deleteCell', this.domNode)
			dojo.forEach(items, function(item) {
				var icon = dojo.query('.iconDelete', item)
				
				if (icon) dojo.destroy(icon[0])
			})
			this._editMode = false
		} else {
			var items = dojo.query('.deleteCell', this.domNode)
			dojo.forEach(items, function(item) {
				var n = dojo.create("div", {innerHTML: "<img src='"+ self._apstrataRoot +"/resources/images/pencil-icons/stop-red.png'>"})
				// no deletion possible for user schema
				if (item.getAttribute('itemLabel') != 'apsdb_user') {
					n.setAttribute('itemLabel', item.getAttribute('itemLabel'))
					n.setAttribute('itemIndex', item.getAttribute('itemIndex'))
	
					dojo.addClass(n, 'iconDelete')
					dojo.place(n, item)
					
					dojo.connect(n, 'onclick', function(e) {
						self._alert(self.msgDelete + '[' + e.currentTarget.getAttribute('itemLabel') + "] ?", 
									e.currentTarget, 
									function(target) {
										self.onDeleteItem(target.getAttribute('itemIndex'), target.getAttribute('itemLabel'), self.data[target.getAttribute('itemIndex')].attrs)
										self._editMode = false
									}, function(target) {
										
									})
					})
				}
			})
			this._editMode = true
		}
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
