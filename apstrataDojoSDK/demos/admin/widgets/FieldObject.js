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
dojo.provide("widgets.FieldObject");
dojo.declare("widgets.FieldObject",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("widgets", "templates/FieldObject.html"),
		
		label: "Label",
		fieldType: "text",
		fieldName: "",
		fieldMandatory: false,
		fieldChoices: "",
		defaultFieldValue: "",
		parentForm: null,
		fieldDataModel: null,
		fieldIndex: 0,
		fieldAction: 0,
		
		constructor: function(dataModel,fieldId) {
			this.fieldDataModel = dataModel;
			
			if (dataModel != null) {
				if (dataModel.label != null) 
					this.label = dataModel.label;
				if (dataModel.type != null) 
					this.fieldType = dataModel.type;
				if (dataModel.mandatory != null) 
					this.fieldMandatory = dataModel.mandatory;
				if (dataModel.choices != null) 
					this.fieldChoices = dataModel.choices;
				if (dataModel.name != null) 
					this.fieldName = dataModel.name;
				if (dataModel.defaultValue != null) 
					this.defaultFieldValue = dataModel.defaultValue;
				if (dataModel.action != null) 
					this.fieldAction = dataModel.action;
				if (dataModel.template != null) 
					this.templatePath = dojo.moduleUrl(dataModel.template.module, dataModel.template.url);
			} 
			
			if (fieldId != null) 
					this.fieldIndex = fieldId;
		},

		setParent: function(parentForm) {
			this.parentForm = parentForm;
		},

		postCreate: function(){
			this.inherited(arguments);
			
			if(this.fieldDataModel != null){
				// Create the fields using the field schema if it was sent 
				this.createField();
			}
		},
		
		startup: function(){
			this.inherited(arguments);
		},
		
		createField: function() {

			var newField = '';
			var placeHolder = document.createElement("div");
			this.spnValue.id = "spnValue" + this.fieldIndex;
		    this.spnValue.appendChild(placeHolder);

			switch(this.fieldType)
			{	
				case 'checkbox':
					newField = new dijit.form.CheckBox({value: 'checked', name: this.fieldName, checked: this.defaultFieldValue},placeHolder);		
					break;
				case 'list':
					newField = new dijit.form.FilteringSelect({value: this.defaultFieldValue, required: this.fieldMandatory, invalidMessage: 'Required.', name: this.fieldName},placeHolder);		
					this.createSelectTag(placeHolder);
					break;
				case 'radio button':
					this.createRadioButtonsTag(placeHolder,"spnValue" + this.fieldIndex);
					break;
				case 'multiple choice':
					this.createMultipleChoiceTag(placeHolder);
					break;
				case 'button':
					newField = new dijit.form.Button({label: this.label}, placeHolder);
					this.connect(dijit.byId(newField.id), "onClick", this.fieldAction);
					break;
				default:
					newField = new dijit.form.ValidationTextBox({trim: true, required: this.fieldMandatory, invalidMessage: 'Required', value: this.defaultFieldValue, name: this.fieldName},placeHolder);		
					break;
			}
			dojo.parser.parse(this.spnValue);
		},
		
		createSelectTag: function(placeHolder) {
			var optionsTags;
			var choiceValues = this.fieldChoices;
			
			dojo.forEach(eval(choiceValues.split(",")),
				function(choice) {
					optionsTags = document.createElement("option");
					optionsTags.setAttribute("value",choice);
					optionsTags.innerText = choice;
					dojo.place(optionsTags, placeHolder, "last");
				});
		},
		
		createRadioButtonsTag: function(placeHolder, spanIndex) {
			var newField = "";
			var checked = "";
			var labelTag;
			var formInst = this;
			var choiceValues = this.fieldChoices;
			
			dojo.forEach(eval(choiceValues.split(",")),
				function(choice) {
					if(formInst.defaultFieldValue == choice)
						checked = true;
					else
						checked = false;
					newField = new dijit.form.RadioButton({value: choice, name: formInst.fieldName, checked: checked},placeHolder);		
					
					labelTag = document.createElement("label");
					labelTag.innerHTML = choice;
					dojo.place(labelTag, formInst.spnValue, "last");
					
					placeHolder = document.createElement("div");
				    formInst.spnValue.appendChild(placeHolder);
				});
			
			return newField;
		},

		createMultipleChoiceTag: function(placeHolder) {
			var newField = "";
			var checked = "";
			var formInst = this;
			var i;
			var labelTag;
			var choiceValues = this.fieldChoices;
			
			dojo.forEach(eval(choiceValues.split(",")),
				function(choice) {
					for (i=0; i < formInst.defaultFieldValue.length; i++) 
					{
						if (formInst.defaultFieldValue[i] == choice){
							checked = true;
							break;
						}else
							checked = false;
					}

					newField = new dijit.form.CheckBox({value: choice, name: formInst.fieldName, checked: checked},placeHolder);		
					
					labelTag = document.createElement("label");
					labelTag.innerHTML = choice;
					dojo.place(labelTag, formInst.spnValue, "last");
					
					placeHolder = document.createElement("div");
				    formInst.spnValue.appendChild(placeHolder);
				});
			
			return newField;
		}
	});
