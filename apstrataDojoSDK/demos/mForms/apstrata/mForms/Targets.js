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

dojo.provide('apstrata.mForms.Targets')

dojo.require("dijit.form.Button")
dojo.require("dijit.form.Textarea")
dojo.require("dijit.form.Form")

dojo.require("dojox.form.FileInput")

dojo.declare('apstrata.mForms.Targets',
[apstrata.horizon.HStackableList],
{
	data: [],
	storeName: "DefaultStore",
	editable: true,
		
	constructor: function() {
		
	},
	
	postCreate: function() {
		this.refresh()
		this.inherited(arguments)
	},

	refresh: function(){
		var self = this
		
		this.getContainer().client.call({
			action: "Query",
			request: {
				apsdb: {
					store: self.storeName,
					query: "formType=\"targetGroup\"",
					queryFields: "apsdb.documentKey,targetName,description,members"
				}
			},
			load: function(operation){
				// Rearrange the result to suite the template
				
				self.data = []
				dojo.forEach(operation.response.result.documents, function(document){
					self.data.push({
						label: document.fields[1].values[0],
						iconSrc: "",
						attrs: {
							documentKey: document.fields[0].values[0],
							targetName: document.fields[1].values[0],
							document: document
//							description: document.fields[2].values[0],
//							members: document.fields[3].values[0]
						}
					})
				})
				
				// Cause the DTL to rerender with the fresh self.data
				self.render()
			//dojo.style(this.domNode,{width:'400px'})
			},
			error: function(operation){
			}
		});
		
		this.inherited(arguments)
	},

	newItem: function() {
		this.openPanel(apstrata.mForms.TargetEdit)
	
		this.inherited(arguments)
	},

	onClick: function(index, label, attrs) {
		var self = this
		console.debug(index, label)
		console.dir(attrs)
		this.openPanel(apstrata.mForms.TargetEdit, {document: attrs.document, storeName: self.storeName});
	},

	onDeleteItem: function(index, label, attrs) {
		var self = this
		this.getContainer().client.call({
				action: "DeleteDocument",
				request: {
					apsdb: {
						store : self.storeName,
						documentKey : attrs.documentKey
					}
				},
				load: function(operation) {
					self.refresh();
				},
				error: function(operation) {
				}
			});
	}
})

dojo.declare("apstrata.mForms.TargetEdit", 
[apstrata.horizon.HStackableWidget], 
{
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.mForms", "templates/TargetEdit.html"),

	constructor: function(attrs){
		if (attrs) {
			if (attrs.document) {
				this.target = attrs.document.fields[1].values[0]
				this.description = '-'
				this.members = '-'
				this.update = true
			} else {
				this.target = ''
				this.description = ''
				this.members = ''
				this.update = false
			}
		} else {
			this.target = ''
			this.description = ''
			this.members = ''
			this.update = false
		}
	},
	
	_save: function() {
		var self = this
		console.dir(this.targetForm.attr("value"))
		this.getContainer().client.call({
				action: "SaveDocument",
				request: {
					formType: "targetGroup",
					"targetMembers.apsdb.fieldType": "text",
					
					apsdb: {
						store: self.getParent().storeName
					}
				},
				formNode: self.targetForm.domNode,
				load: function(operation) {
					self.getParent().refresh();
				},
				error: function(operation) {
				}
		});
		
	},
	
	_cancel: function() {
	}
})


