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
dojo.provide("widgets.FormObject");
dojo.declare("widgets.FormObject",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templateString: null,
		templatePath: dojo.moduleUrl("widgets", "templates/FormObject.html"),
		jsonDataModel: "{}",
		dataModel: null,
		
		label: "Label",
		fieldType: "text",
		fieldName: "",
		fieldMandatory: false,
		fieldChoices: "",
		defaultFieldValue: "",
		parentForm: null,
		fieldDataModel: null,
		fieldCounter: 0,

		constructor: function() {
			if(schema != null)
				this.jsonDataModel = schema;

			dataModel = dojo.fromJson(this.jsonDataModel);
			if (dataModel.template != null) 
				this.templatePath = dojo.moduleUrl(dataModel.template.module, dataModel.template.url);
			
		},
		
		postCreate: function(){
			this.inherited(arguments);
			
			var formInst = this;
			
			dojo.forEach(dataModel.fields, function(fieldDataModel) {
				var newField = formInst.createField(fieldDataModel);
			});
			
		},
				
		createButton: function(dataModel) {
			var newField = new widgets.FieldObject(dataModel,this.fieldCounter);

			dojo.place(newField.domNode, "fields", "last");	

			newField.setParent(this);
			this.fieldCounter++;

			return newField;
		},
		
		createField: function(dataModel) {
			var newField = new widgets.FieldObject(dataModel,this.fieldCounter);

			dojo.place(newField.domNode, "fields", "last");	

			newField.setParent(this);
			this.fieldCounter++;

			return newField;
		},

		startup: function(){
			this.inherited(arguments);
		}
						
	});