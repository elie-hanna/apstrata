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

dojo.provide("apstrata.devConsole.ScriptsPanel")

dojo.declare("apstrata.devConsole.ScriptsEditorPanel", 
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
				self.close()
			},
			error: function(operation) {
			}
		})
	},
	
	onDeleteItem: function(index, label){
		var self = this
		
		this.container.client.call({
			action: "DeleteSchema",
			request: {
				apsim: {
					schemaName: label
				}
			},
			load: function(operation){
				self.reload()
			},
			error: function(operation){
			}
		})
	}	
})

dojo.declare("apstrata.devConsole.ScriptsPanel", 
[apstrata.horizon.HStackableList], 
{	
	data: [],
	editable: true,

	postCreate: function() {
		var self = this

		dojo.publish("/apstrata/documentation/topic", [{
			topic: "apstrata Stores APIs",
			id: "StoresAPI"
		}])
		
		this.container.client.call({
			action: "ListScripts",
			load: function(operation) {
				// Rearrange the result to suite the template
				self.data = []
				dojo.forEach(operation.response.result.scripts, function(script) {
					self.data.push({label: script['@name'], iconSrc: ""})
				})			
	
				// Cause the DTL to rerender with the fresh self.data
				self.render()
	
				dojo.connect(self, 'onClick', function(index, label) {
					self.openPanel(apstrata.devConsole.ScriptEditorPanel, {target: label})
				})
			},
			error: function(operation) {
			}
		})

		self.inherited(arguments)
	},

	newItem: function() {
		var self = this

		self.openPanel(apstrata.devConsole.ScriptEditorPanel)
		
		this.inherited(arguments)
	}
})
