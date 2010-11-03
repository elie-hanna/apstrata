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

dojo.provide("apstrata.devConsole.DocumentsSavePanel");
dojo.provide("apstrata.devConsole.DocumentsSaveField");

dojo.require("dijit.layout.LayoutContainer");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.date.locale");

dojo.declare("apstrata.devConsole.DocumentsSavePanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	fieldSerialNumber: 0,
	templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/DocumentsSavePanel.html"),
	listSchemas: [],
	storeName: null,
	
	constructor: function(attrs) {
		var self = this;
		self.storeName = attrs.target;
		self.docKey = attrs.docKey;
		self.listSchemas = attrs.listSchemas;
	},
	
	postCreate: function() {
		var self = this;	
		this.userListFetched = false
		
		// populating the users list upon opening of the drop down
		dojo.connect(self.runAs, 'onClick', function () {
			if (self.userListFetched) return
			self.container.client.call({
				action: "ListUsers",
				request: {
					apsdb: {
						query: ""
					}
				},			
				load: function(operation) {
					self.data = []
					self.userListFetched = true
					dojo.forEach(operation.response.result.users, function(user) {
						self.data.push({name: user['login'], label: user['login'], abbreviation: user['login']})
					})
					
					self.userList = {identifier:'abbreviation',label: 'name',items: self.data}
		        	self.runAs.store = new dojo.data.ItemFileReadStore({ data: self.userList });
				},
				error: function(operation) {
				}
			})
	    });		
		
		//if document key exists, gets the document information to be edited
		if (this.docKey) {
			var apsdb = {
				store: self.storeName,
				query: 'apsdb.documentKey="' + self.docKey + '"',
				queryFields: '*'
			}
			
			var attrs = {
				action: "Query",
				request: {
					apsdb: apsdb
				},
				load: function(operation) {
					// operation.response.result
					var q = operation.response
					if (q.result.documents[0]) {
						for(var fieldName in q.result.documents[0]) {
							fieldValue = q.result.documents[0][fieldName];
							if(fieldName=='apsdb.documentKey') {
								self.documentKey.attr("value",fieldValue);
								self.update.attr("value","true");
							}
							
							// Operational field will not be passed in the response	
							//if(fieldName=='apsdb.revisionNumber') {
							//	self.revisionNumber.attr("value",fieldValue);
							//}							
							
							// Considering schema for future changes
							if(fieldName=='apsdb.objectName' || fieldName=='apsdb.schema') {
								if(fieldValue != '' && fieldValue != 'templateForm') {
									self.schemaName.attr("value",fieldValue);
								}
							}
							
							// Add a populated field widgit
							if ((fieldName.indexOf('apsdb.') == -1) && (fieldName != '_type') && (fieldName != 'key')) {
								var field = new apstrata.devConsole.DocumentsSaveField({fieldName:fieldName, fieldValue: fieldValue, fieldType:q.result.documents[0]['_type'][fieldName]});
								self.fieldsList.addChild(field);
							}
							
						}
					}
				},
				error: function(operation) {
					if (keywordArgs.onError) keywordArgs.onError({errorCode: operation.response.metadata.errorCode, errorMessage: operation.response.metadata.errorMessage}, request)
				}
			}
			this.container.client.call(attrs)
		}
		
		this.inherited(arguments)
	},

	_save: function() {
		var self = this
		if (this.saveDocumentForm.validate()) {
			
			var attrs
			var apsdb = {
				store: self.target			
			}
			
			if(self.schemaName.attr("value")!='') {
				apsdb.schema = self.schemaName.attr("value");								
			}
			
			if(self.ftsFields.attr("value")!='') {
				apsdb.ftsFields = self.ftsFields.attr("value");								
			}			
			
			if(self.multivalueAppend.attr("value")!='') {
				apsdb.multivalueAppend = self.multivalueAppend.attr("value");								
			}			
	
			if(self.documentKey.attr("value")!='') {
				apsdb.documentKey = self.documentKey.attr("value");								
			}			
			
			if(self.revisionNumber.attr("value")!='') {
				apsdb.revisionNumber = self.revisionNumber.attr("value");								
			}
			
			if(self.runAs.attr("value")!='') {
				apsdb.runAs = self.runAs.attr("value");								
			}	
			
			apsdb.update = (self.update.attr("value")=='true');
			
			attrs = {
				action: "SaveDocument",
				request: {
					apsdb: apsdb
				},
				load: function(operation){
//						self.getParent().reload()
//						self.getParent().closePanel()
				},
				error: function(operation){
				}
			}
			
			var fields = self.fieldsList.getChildren();
			for(var fieldsIndex=0; fieldsIndex < fields.length; fieldsIndex++) {
				var field = fields[fieldsIndex];
				
				sentVal = field.fieldValue.value;
				if (field.fieldType.value=='date')
					sentVal = (field.fieldDateValue.value != null) ? (dojo.date.locale.format(field.fieldDateValue.value, {datePattern:"yyyy-MM-dd", timePattern: "'T'HH:mm:ssZ"})) : null;
				sentVal = sentVal.replace(' ','');
				
				attrs.request[field.fieldName.value] = sentVal;
				attrs.request[field.fieldName.value+".apsdb.fieldType"] = (field.fieldType.value!='')? field.fieldType.value : '';
			}			
			
			this.container.client.call(attrs);
		}
	},	
	
	_addFieldLine: function() {
		// Adds the newField node to the document
		var newField = new apstrata.devConsole.DocumentsSaveField({fieldName:null, fieldValue:null, fieldType:null});
		this.fieldsList.addChild(newField);
	},
	
	_cancel: function() {
		this.panel.destroy();
	}
})


dojo.declare("apstrata.devConsole.DocumentsSaveField", [dijit._Widget, dijit._Templated], 
{
	widgetsInTemplate: true,
	templateString: null,
	templatePath: dojo.moduleUrl("apstrata.devConsole.DocumentsSaveField", "../templates/DocumentsSaveField.html"),
	
	/**
	 * Constructor of the Document Fields widget.
	 */
	constructor: function(attrs) {
		this.fldName = attrs.fieldName;
		this.fldValue = attrs.fieldValue;	
		this.fldType = attrs.fieldType;
	},
	
	postCreate: function() {
		this.fieldName.attr("value", this.fldName);
		if(this.fldType=='date' && this.fldValue!=null && this.fldValue!='') {
			this.fieldDateValue.attr("value", this._parseDate(this.fldValue));
		} else {
			this.fieldValue.attr("value", this.fldValue);
		}
		this.fieldType.attr("value", this.fldType);
		this._typeChanged();
	},
	
	_typeChanged: function() {
		if(this.fieldType.attr("value")=="date") {
			dojo.style(this.dateTypeInput, "display", "inline");
			dojo.style(this.otherTypeInput, "display", "none");
//			if(this.fieldDateValue.attr("value")==null) {
//				this.fieldDateValue.attr("value", new Date());
//			}
		} else {
			dojo.style(this.otherTypeInput, "display", "inline");
			dojo.style(this.dateTypeInput, "display", "none");
		}
	},
	
	_parseDate: function(value) {
		var dateVal = dojo.date.locale.parse(value.split('T')[0], {datePattern:'yyyy-MM-dd', selector: 'date'});
		var timeVal = dojo.date.locale.parse(value.substring(value.indexOf('T')), {timePattern: "'T'HH:mm:ssZ", selector: 'time'});
		dateVal.setUTCHours(timeVal.getUTCHours());
		dateVal.setUTCMinutes(timeVal.getUTCMinutes());
		dateVal.setUTCSeconds(timeVal.getUTCSeconds());
	    return dateVal;
	},	
	
	_removeFieldLine: function() {
		// Remove the field container.
		this.destroy();
		return;	
	}	
})

