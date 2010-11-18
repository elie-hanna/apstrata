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
dojo.provide("apstrata.devConsole.DocumentsSaveFieldValue");

dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.form.ToggleButton");
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
		self.update = (attrs.docKey && attrs.docKey!='') ? true : false;
		self.currentPage = attrs.currentPage;
		self.ftsFields = '';
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
						self.schemaName.attr("disabled",true);
						for(var fieldName in q.result.documents[0]) {
							fieldValue = q.result.documents[0][fieldName];
							if(fieldName=='apsdb.documentKey') {
								self.documentKey.attr("value",fieldValue);
							}						
							
							// Considering schema for future changes
							if(fieldName=='apsdb.objectName' || fieldName=='apsdb.schema') {
								if(fieldValue != '' && fieldValue != 'templateForm') {
									self.schemaName.attr("value",fieldValue);
								}
							}
							
							// Add a populated field widget
							if ((fieldName.indexOf('apsdb.') == -1) && (fieldName != '_type') && (fieldName != 'key')) {
								//when having one single value for the field
								if(typeof fieldValue == "string") {
									fieldValue = [fieldValue];
								}
								
								var field = new apstrata.devConsole.DocumentsSaveField({fieldName:fieldName, fieldValues: fieldValue, fieldType: q.result.documents[0]['_type'][fieldName], update: true});
								self.fieldsList.addChild(field);
							}
						}						
					}
				},
				error: function(operation) {
					if (keywordArgs.onError) keywordArgs.onError({errorCode: operation.response.metadata.errorCode, errorMessage: operation.response.metadata.errorMessage}, request)
				}
			}
			
			this.container.client.call(attrs);
		} else {
			//adding one single field by default
			this._addFieldLine();
		}
		
		this.inherited(arguments);
	},

	_save: function() {
		var docSavePanel = this;
		if (this.saveDocumentForm.validate()) {
			
			var attrs
			var apsdb = {
				store: docSavePanel.target			
			}
			
			if(docSavePanel.schemaName.attr("value")!='') {
				apsdb.schema = docSavePanel.schemaName.attr("value");								
			}
	
			if(docSavePanel.documentKey.attr("value")!='') {
				apsdb.documentKey = docSavePanel.documentKey.attr("value");								
			}
			
			if(docSavePanel.runAs.attr("value")!='') {
				apsdb.runAs = docSavePanel.runAs.attr("value");								
			}	
			
			apsdb.update = docSavePanel.update;
			
			attrs = {
				action: "SaveDocument",
				request: {
					apsdb: apsdb
				},
				load: function(operation){
					if(docSavePanel.update == true) {
						docSavePanel.getParent()._query(null, docSavePanel.currentPage);
					}
				},
				error: function(operation){
				}
			}
			
			var fields = docSavePanel.fieldsList.getChildren();
			for(var fieldsIndex=0; fieldsIndex < fields.length; fieldsIndex++) {
				var field = fields[fieldsIndex];
				
				if(field.fieldValuesList.hasChildren()) {
					var fieldValues = field.fieldValuesList.getChildren();
					attrs.request[field.fieldName.value] = new Array();
					for(var i=0; i<fieldValues.length; i++) {
						sentVal = fieldValues[i].fieldValue.value;
						if (field.fieldType.value=='date') {
							sentVal = (fieldValues[i].fieldDateValue.value != null && fieldValues[i].fieldDateValue.value != '') ? (dojo.date.locale.format(fieldValues[i].fieldDateValue.value, {datePattern:"yyyy-MM-dd", timePattern: "'T'HH:mm:ssZ"})) : '';
							sentVal = sentVal.replace(' ','');
						}

						attrs.request[field.fieldName.value].push(sentVal);
					}
				}
				
				if (field.ftsFields.attr("checked")) {
					apsdb.ftsFields = (apsdb.ftsFields) ? field.fieldName.value+","+apsdb.ftsFields : field.fieldName.value;
				}
				
				attrs.request[field.fieldName.value+".apsdb.fieldType"] = (field.fieldType.value!='')? field.fieldType.value : '';
			}
			this.container.client.call(attrs);
		}
	},	
	
	_addFieldLine: function() {
		// Adds the newField node to the document
		var newField = new apstrata.devConsole.DocumentsSaveField({fieldName:null, fieldValues:null, fieldType:null});
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
	templatePath: dojo.moduleUrl("apstrata.devConsole.DocumentsSaveField", "templates/DocumentsSaveField.html"),
	
	/**
	 * Constructor of the Document Fields widget.
	 */
	constructor: function(attrs) {
		this.fldName = attrs.fieldName;
		this.fldValues = attrs.fieldValues;	
		this.fldType = attrs.fieldType;
		this.update = attrs.update;
	},
	
	postCreate: function() {
		this.fieldName.attr("value", this.fldName);
		this.fieldType.attr("value", this.fldType);
		if (this.update) {
			this.fieldType.attr("disabled",true);
		}
		if(this.fldValues) {
			for(var i=0; i<this.fldValues.length; i++) {
				this.fieldValuesList.addChild(new apstrata.devConsole.DocumentsSaveFieldValue({fieldValue: this.fldValues[i], referencedField: this}));
			}	
		} else {
			this._addFieldValue();
		}
	},
	
	_typeChanged: function() {
		if(this.fieldValuesList.hasChildren()) {
			for(var i=0; i<this.fieldValuesList.getChildren().length; i++) {
				this.fieldValuesList.getChildren()[i]._typeChanged();
			}
		}
		console.dir(this.fieldValuesList);
	},
	
	_addFieldValue: function() {
		// Adds the newField node to the document
		var newFieldValue = new apstrata.devConsole.DocumentsSaveFieldValue({fieldValue:null, referencedField: this});
		this.fieldValuesList.addChild(newFieldValue);		
	},	
	
	_removeFieldLine: function() {
		// Remove the field container.
		this.destroy();
		return;	
	}	
})

dojo.declare("apstrata.devConsole.DocumentsSaveFieldValue", [dijit._Widget, dijit._Templated], 
{
	widgetsInTemplate: true,
	templateString: "<div dojoAttachPoint=\"valuesDiv\">"+
					"<button dojoAttachEvent='onClick: _removeFieldValue' dojoType='dijit.form.Button'>-</button>"+
	                "<div dojoAttachPoint=\"otherTypeInput\" style=\"display:none;\"><input dojoAttachPoint=\"fieldValue\" type=\"text\" dojoType=\"dijit.form.ValidationTextBox\" required=\"false\" class=\"rounded-xsml\"/></div>"+
		            "<div dojoAttachPoint=\"dateTypeInput\" style=\"display:none;\"><input dojoAttachPoint=\"fieldDateValue\" constraints=\"{datePattern:'dd/MM/yyyy HH:mm:ss'}\" type=\"text\" dojoType=\"dijit.form.DateTextBox\" required=\"false\" class=\"rounded-xsml\"/></div>"+
		            "</div>",
	
	/**
	 * Constructor of the Document Field value widget.
	 */
	constructor: function(attrs) {
		this.referencedField = attrs.referencedField;
		this.fldValue = attrs.fieldValue;
	},
	
	postCreate: function() {
		if (this.fldValue!=null && this.fldValue!='') {
			if(this.referencedField.fieldType.attr("value")=='date') {
				this.fieldDateValue.attr("value", this._parseDate(this.fldValue));
			} else {
				this.fieldValue.attr("value", this.fldValue);
			}
		}
		this._typeChanged();
	},	
	
	_typeChanged: function() {
		if(this.referencedField.fieldType.attr("value")=="date") {
			dojo.style(this.dateTypeInput, "display", "inline");
			dojo.style(this.otherTypeInput, "display", "none");
			if(this.fieldDateValue.attr("value")==null) {
				this.fieldDateValue.attr("value", new Date());
			}
		} else {
			dojo.style(this.otherTypeInput, "display", "inline");
			dojo.style(this.dateTypeInput, "display", "none");
		}
	},	
	
	_removeFieldValue: function() {
		// Remove the field value container.
		this.destroy();
		return;			
	},
	
	_parseDate: function(value) {
		var dateVal = dojo.date.locale.parse(value.split('T')[0], {datePattern:'yyyy-MM-dd', selector: 'date'});
		var timeVal = dojo.date.locale.parse(value.substring(value.indexOf('T')), {timePattern: "'T'HH:mm:ssZ", selector: 'time'});
		dateVal.setUTCHours(timeVal.getUTCHours());
		dateVal.setUTCMinutes(timeVal.getUTCMinutes());
		dateVal.setUTCSeconds(timeVal.getUTCSeconds());
	    return dateVal;
	}
})