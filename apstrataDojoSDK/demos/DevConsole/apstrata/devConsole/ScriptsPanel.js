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
dojo.provide("apstrata.devConsole.ScriptEditorPanel")

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
		
		this.reload()

		self.inherited(arguments)
	},

	reload: function() {
		var self = this

		this.container.client.call({
			action: "ListScripts",
			load: function(operation) {
				// Rearrange the result to suite the template
				self.data = []
				var tmp = []				
				dojo.forEach(operation.response.result.scripts, function(script) {
					tmp.push(script['name'])
				})			

				tmp.sort()

				for (var i=0; i<tmp.length; i++) {
					self.data.push({label: tmp[i], iconSrc: ""})
				}

				console.dir(self.data)
	
				// Cause the DTL to rerender with the fresh self.data
				self.render()
	
				dojo.connect(self, 'onClick', function(index, label) {
					self.openPanel(apstrata.devConsole.ScriptEditorPanel, {target: label})
				})
			},
			error: function(operation) {
			}
		})
	},

	newItem: function() {
		var self = this

		self.openPanel(apstrata.devConsole.ScriptEditorPanel)
		
		this.inherited(arguments)
	},

	onDeleteItem: function(index, label){
		var self = this
		
		this.container.client.call({
			action: "DeleteScript",
			request: {
				apsdb: {
					scriptName: label
				}
			},
			load: function(operation){
				self.reload()
			},
			error: function(operation){
			}
		})
	},
})

dojo.declare("apstrata.devConsole.ScriptEditorPanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,	
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/ScriptEditorPanel.html"),
	maximizePanel: true,
	
	constructor: function(attrs) {
		if (attrs.target) this.scriptName = attrs.target; else this.scriptName= ""
		if (attrs && attrs.target) this.update = true; else this.update = false
	},
	
	postCreate: function() {
		var self = this
		
		if (self.scriptName) {
			this.container.client.call({
				action: "GetScript",
				request: {
					apsdb: {
						scriptName: self.scriptName
					}
				},
				load: function(operation) {
					self.txtScript.value =  operation.response.result
					self.fldName.value = self.scriptName
					self._initCodeEditor()
				},
				error: function(operation) {
				}
			})
		} else {
			self.txtScript.value =  ""
			self.fldName.value = ""
			
			dojo.attr(this.btnRun, {'disabled': 'disabled'})
			
			// TODO: find a more elegant solution, initializing CodeEditor is giving an error, 
			//  unless some delay is provided
			setTimeout(dojo.hitch(this,'_initCodeEditor'), 500)	
			
		}
		
		this.inherited(arguments)
	},
	
	_initCodeEditor: function() {
		editAreaLoader.init({
			id: "txtEditor"	// id of the textarea to transform		
			,start_highlight: true	// if start with highlight
			,allow_resize: "both"
			,allow_toggle: false
			,word_wrap: true
			,language: "en"
			,syntax: "js"	
		});
	},
	
	_save: function() {
		var self = this

//		if (self.scriptName=="") self.scriptName = self.fldName.value

		var apsdb = {
			scriptName: self.fldName.value,
			script: editAreaLoader.getValue("txtEditor"),
			update: self.update
		}

//		if (self.scriptName != self.fldName.value) apsdb.newScriptName = self.fldName.value
		
		this.container.client.call({
			action: "SaveScript",
			request: {
				apsdb: apsdb
			},
			load: function(operation) {
				self.btnRun.removeAttribute('disabled')
//				dojo.attr(self.btnRun, {'disabled': ''})
				if (self.scriptName!=self.fldName.value) {
					self.scriptName = self.fldName.value
					self.getParent().reload()
				}
			},
			error: function(operation) {
			}
		})
	},
	
	_run: function() {
		var self = this

		this.openPanel(apstrata.devConsole.RunScriptPanel, {
			scriptName: self.scriptName
		})
	},
	
	onDeleteItem: function(index, label){
		var self = this
		
		this.container.client.call({
			action: "DeleteScript",
			request: {
				apsim: {
					scriptName: label
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

dojo.declare("apstrata.devConsole.RunScriptPanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/RunScriptPanel.html"),
	maximizePanel: false,
	
	constructor: function(attrs) {
		console.dir(this)
		if (attrs.scriptName) this.scriptName = attrs.scriptName
	},
	
	_getParams: function() {
		var frm = this.frmParams.attr('value')
		var params = {}
		
		if (frm.param1) params[frm.param1] = frm.value1 
		if (frm.param2) params[frm.param2] = frm.value2 
		if (frm.param3) params[frm.param3] = frm.value3 
		if (frm.param4) params[frm.param4] = frm.value4 

		return params 
	},
	
	_goNewWindow: function() {
		var self = this
		
		console.dir(this.frmParams.attr("value"))
		console.debug(this.scriptName)		

		var operation = new apstrata.Operation(this.container.connection)
		operation.apsdbOperation = "RunScript"
		operation.request = {
			apsdb: {
				scriptName: self.scriptName
			}
		}

		dojo.mixin(operation.request, this._getParams())

		var url = operation.buildUrl().url;
		window.open(url, 'Script Output:' + self.scriptName) 
	},

	_go: function() {
		var self = this
		
		if (self.scriptName) {
			this.container.client.call({
				action: "RunScript",
				request: {
					apsdb: {
						scriptName: self.scriptName
					}
				},
				load: function(operation) {
					console.dir(operation)
				},
				error: function(operation) {
				}
			})
		}
	},
	
	postCreate: function() {
		this.inherited(arguments)
	},
})