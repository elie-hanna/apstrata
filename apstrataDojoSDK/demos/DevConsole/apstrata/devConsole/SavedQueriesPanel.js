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

dojo.provide("apstrata.devConsole.SavedQueriesPanel")
dojo.provide("apstrata.devConsole.SavedQueryEditorPanel")

dojo.require("dijit.form.Form")
dojo.require("dijit.form.Button")
dojo.require("dijit.form.ValidationTextBox")
dojo.require("dijit.form.SimpleTextarea")

dojo.declare("apstrata.devConsole.SavedQueriesPanel",
[apstrata.horizon.HStackableList],
{
	data: [],
	editable: true,
	filterable: true,
	sortable: true,

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
			action: "ListSavedQueries",
			load: function(operation) {
				// Rearrange the result to suite the template
				self.data = []
				var tmp = []
				dojo.forEach(operation.response.result.savedQueries, function(savedQuery) {
					tmp.push(savedQuery['name'])
				})

				tmp.sort()

				for (var i=0; i<tmp.length; i++) {
					self.data.push({label: tmp[i], iconSrc: ""})
				}

				console.dir(self.data)

				// Cause the DTL to rerender with the fresh self.data
				self.render()

				dojo.connect(self, 'onClick', function(index, label) {
					self.openPanel(apstrata.devConsole.SavedQueryEditorPanel, {target: label})
				})
			},
			error: function(operation) {
			}
		})
	},

	newItem: function() {
		var self = this

		self.openPanel(apstrata.devConsole.SavedQueryEditorPanel)

		this.inherited(arguments)
	},

	onDeleteItem: function(index, label){
		var self = this

		this.container.client.call({
			action: "DeleteSavedQuery",
			request: {
				apsdb: {
					queryName: label
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

dojo.declare("apstrata.devConsole.SavedQueryEditorPanel",
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin],
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/SavedQueryEditorPanel.html"),
	maximizePanel: true,

	constructor: function(attrs) {
		if (attrs.target) this.queryName = attrs.target; else this.queryName= ""
		if (attrs && attrs.target) this.update = true; else this.update = false
	},

	postCreate: function() {
		var self = this

		if (self.queryName) {
			this.container.client.call({
				action: "GetSavedQuery",
				request: {
					apsdb: {
						queryName: self.queryName
					}
				},
				load: function(operation) {
					self.fldName.attr("value", self.queryName)
					self.txtSavedQuery.attr("value", operation.response.result)

          // Query names can't be updated!
          if (self.update) {
            self.fldName.attr("disabled", true);
          }

					self._initCodeEditor()
				},
				error: function(operation) {
				}
			})
		} else {
			self.fldName.attr("value", "")
			self.txtSavedQuery.attr("value", "")
			self.btnRun.setDisabled(true);

			// TODO: find a more elegant solution, initializing CodeEditor is giving an error,
			//  unless some delay is provided
			setTimeout(dojo.hitch(this,'_initCodeEditor'), 500)
		}

		this.inherited(arguments)
	},

	_initCodeEditor: function() {
		var self = this
		editAreaLoader.init({
			id: self.txtSavedQuery.id // "txtEditor"	// id of the textarea to transform
			,start_highlight: true	  // if start with highlight
			,allow_resize: "both"
			,allow_toggle: false
			,word_wrap: true
			,language: "en"
			,syntax: "xml"
		});
	},

	_save: function() {
		var self = this

		var apsdb = {
      queryName: editAreaLoader.getValue(self.fldName.id),
			query: editAreaLoader.getValue(self.txtSavedQuery.id),
			update: self.update
		};

    console.log(apsdb);

		this.container.client.call({
			action: "SaveQuery",
			request: {
				apsdb: apsdb
			},
			formNode: self.frmScript.domNode,
			load: function(operation) {
				self.btnRun.setDisabled(false);
				if (!self.update) {
					self.getParent().reload();
				}
				self.update = true;
        self.fldName.attr("disabled", true);
			},
			error: function(operation) {
			}
		})
	},

	_run: function() {
		var self = this

console.log(self);
		this.openPanel(apstrata.devConsole.RunSavedQueryPanel, {
			queryName: self.queryName,
		})
	},

	onDeleteItem: function(index, label){
		var self = this

		this.container.client.call({
			action: "DeleteSavedQuery",
			request: {
				apsdb: {
					queryName: label
				}
			},
			load: function(operation){
        console.log(self);
				self.reload()
			},
			error: function(operation){
			}
		})
	}
})

dojo.declare("apstrata.devConsole.RunSavedQueryPanel",
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin],
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/RunSavedQueryPanel.html"),
	maximizePanel: false,

	constructor: function(attrs) {
		if (attrs.queryName) this.queryName = attrs.queryName
	},

	_getParams: function() {
		var frm = this.frmParams.attr('value')
		var params = {}

		if (frm.param1) params[frm.param1] = frm.value1
		if (frm.param2) params[frm.param2] = frm.value2
		if (frm.param3) params[frm.param3] = frm.value3
		if (frm.param4) params[frm.param4] = frm.value4
		if (frm.param5) params[frm.param5] = frm.value5
		if (frm.param6) params[frm.param6] = frm.value6
		if (frm.param7) params[frm.param7] = frm.value7
		if (frm.param8) params[frm.param8] = frm.value8
		if (frm.param9) params[frm.param9] = frm.value9
		if (frm.param10) params[frm.param10] = frm.value10

		return params
	},

	_goNewWindow: function() {
		var self = this
		var runAs = self.fldRunAs.getValue()

		var operation = new apstrata.Operation(this.container.connection)
		operation.apsdbOperation = "Query"
		operation.request = {
			apsdb: {
				queryName: self.queryName,
				runAs: runAs
			}
		}

		dojo.mixin(operation.request, this._getParams())

		var url = operation.buildUrl().url;
		window.open(url, 'Script Output:' + self.scriptName)
	},
/*
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
*/
	postCreate: function() {
		var self = this
		this.storeListFetched = false

    // Get the list of users
		dojo.connect(self.fldRunAs, 'onClick', function () {
			if (self.userListFetched) return
			self.container.client.call({
				action: "ListUsers",
				request: {
					apsdb: {
						query: ""
					}
				},
				load: function(operation) {
					var userData = []
					self.userListFetched = true
					dojo.forEach(operation.response.result.users, function(user) {
						userData.push({name: user['login'], label: user['login'], abbreviation: user['login']})
					})

					var userList = {identifier:'abbreviation',label: 'name',items: userData}
		        	self.fldRunAs.store = new dojo.data.ItemFileReadStore({ data: userList });
				},
				error: function(operation) {
				}
			})
	    });

		this.inherited(arguments)
	}
})
