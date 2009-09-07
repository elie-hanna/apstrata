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

dojo.provide("surveyWidget.widgets.SurveyField");

dojo.require("dijit._Templated");
dojo.require("dijit.InlineEditBox");

dojo.require("dojo.html");

dojo.declare("surveyWidget.widgets.SurveyField",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templateString: null,
		templatePath: dojo.moduleUrl("surveyWidget.widgets", "templates/SurveyField.html"),
		
		title: "Set a question title here",
		fieldType: "text",
		fieldName: "",
		fieldMandatory: false,
		fieldChoices: "choice1, choice2, choice3",
		defaultFieldValue: "",
		selected: false,
		parentSurvey: null,
		fieldDataModel: null,
		editMode:false,
		dummyField:false,
		
		constructor: function(dataModel,editMode) {
			this.fieldDataModel = dataModel;
			this.editMode = editMode;
			
			if (dataModel != null) {
				if (dataModel.title != null) 
					this.title = dataModel.title;
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
			} else
				this.dummyField = true;

			if(!this.editMode)
				this.templatePath = dojo.moduleUrl("surveyWidget.widgets", "templates/SurveyFieldRun.html");
		},

		setParent: function(parentSurvey) {
			this.parentSurvey = parentSurvey;
			if(this.editMode)
				this.parentSurvey.questionContainer.sync();
		},

		postCreate: function(){
			this.inherited(arguments);
			
			if(this.editMode){
				this.connect(this.btnDelete, "onclick", "deleteField");
				this.connect(this.spnValue, "onclick", "selectedEvent");
				this.connect(this.checkBoxValue, "onclick", "selectedEvent");
				this.connect(this.btnCancel, "onclick",
					function() {
						if (this.title == null)
							this.deleteField();
						else {
							var constructedFieldName = this.constructFieldName();

							this.fldName.value = constructedFieldName;

							this.unselect();
						}
					});
				this.connect(this.lstType, "onchange", "changeType");
				this.connect(this.fldTitle, "onClick", function() {if (this.title != null){ this.fieldModified();}});
				this.connect(this.fldTitle, "onChange", function() {this.title = this.fldTitle.value; this.fieldModified()});
				this.connect(this.fldName, "onchange", function() {this.fieldName = this.fldName.value; this.changeType();});
				this.connect(this.txtChoices, "onchange", function() {this.changeType();});
			}
			
			if(this.fieldDataModel != null){
				// Create the fields using the field schema if it was sent 
				if(this.editMode){
					this.lstType.value = this.fieldType;
					this.chkMandatory.checked = this.fieldMandatory;
					this.txtChoices.value = this.fieldChoices;
					this.fldName.value = this.fieldName;
				}
				this.changeType();
			}
		},
		
		startup: function(){
			this.inherited(arguments);
		},
		 
		deleteField: function() {
			this.destroy();
		},
		
		selectedEvent: function() {
			//this.highlight();	
		},
				
		select: function() {
			if (this.parentSurvey.editMode) {
				
				this.editor.style.position = "absolute";
				this.editor.style.top = (this.surveyField.offsetTop - 20) + "px";
				this.editor.style.left = (this.spnValue.offsetLeft + 255) + "px";
				this.editor.style.left = (this.checkBoxValue.offsetLeft + 255) + "px";
				this.editor.style.display = "";
				//rgba doesn't work in IE
				//this.surveyField.style.backgroundColor = "rgba(255, 255, 130, .9)";
				this.surveyField.style.backgroundColor = "#FFFF8E";
				this.handle.style.display = "none";
				this.selected = true;				
			}
		},
				
		unselect: function() {
			this.editor.style.display = "none";	
			this.surveyField.style.backgroundColor = "";
			this.handle.style.display = "";

			this.selected = false;
		},
		
		changeType: function() {

			if(this.editMode){
				this.fieldModified();
				this.fieldType = this.lstType.value;
				this.fieldMandatory = this.lstType.value;
			}

			var newField = '';

			switch(this.fieldType)
			{	
				case 'checkbox':
					if(this.editMode){
						this.divChoices.style.display = "none";	
						this.spnValue.style.display = "none";
						this.checkBoxValue.style.display = "";			
						this.fieldName = this.fldName.value;
					}
					
					newField = '<input dojoType="dijit.form.CheckBox" value="checked" dojoAttachPoint="fldValue"  name="'+this.fieldName+'" '+ this.defaultFieldValue +'/>';	
					this.checkBoxValue.innerHTML = newField;
					dojo.parser.parse(this.checkBoxValue);
					break;
				case 'list':
					if(this.editMode){
						this.divChoices.style.display = "";
						this.fieldName = this.fldName.value;
					}

					newField = this.createSelectTag();	
					this.spnValue.innerHTML = newField;
					dojo.parser.parse(this.spnValue);
					break;
				case 'radio button':
					if(this.editMode){
						this.divChoices.style.display = "";
						this.fieldName = this.fldName.value;
					}

					newField = this.createRadioButtonsTag();	
					this.spnValue.innerHTML = newField;
					dojo.parser.parse(this.spnValue);
					break;
				case 'multiple choice':
					if(this.editMode){
						this.divChoices.style.display = "";
						this.fieldName = this.fldName.value;
					}

					newField = this.createMultipleChoiceTag();	
					this.spnValue.innerHTML = newField;
					dojo.parser.parse(this.spnValue);
					break;
				default:
					if(this.editMode){
						this.divChoices.style.display = "none";	
						var required = false;
						this.fieldName = this.fldName.value;
					} else
						var required = this.fieldMandatory;						

					newField = '<br/><input dojoType="dijit.form.ValidationTextBox" trim=true required="'+ required +'" invalidMessage="Required." dojoAttachPoint="fldValue"  value="'+this.defaultFieldValue+'" name="'+this.fieldName+'">';	
					this.spnValue.innerHTML = newField;
					dojo.parser.parse(this.spnValue);
					break;
			}
		},
		
		createSelectTag: function() {
			var optionsTags = "";
			var newField = "";
			if(this.editMode)
				var choiceValues = this.txtChoices.value;
			else
				var choiceValues = this.fieldChoices;
			
			dojo.forEach(eval(choiceValues.split(",")),
				function(choice) {
					optionsTags = optionsTags + '<option value="' + choice + '">' + choice + '</option>';
				});
			
			newField = '<br/><select value="' + this.defaultFieldValue + '" required="'+ this.fieldMandatory +'" invalidMessage="Required." dojoType="dijit.form.FilteringSelect" dojoAttachPoint="fldValue" name="'+this.fieldName+'">'+optionsTags+'</select>';
			return newField;
		},
		
		createRadioButtonsTag: function() {
			var newField = "<br/>";
			var checked = "";
			var survey = this;
			if(this.editMode)
				var choiceValues = this.txtChoices.value;
			else
				var choiceValues = this.fieldChoices;
			
			dojo.forEach(eval(choiceValues.split(",")),
				function(choice) {
					if(survey.defaultFieldValue == choice)
						checked = "checked";
					else
						checked = "";
					newField = newField + '<span><input dojoType="dijit.form.RadioButton" dojoAttachPoint="fldValue" name="'+survey.fieldName+'" value="' + choice + '" '+ checked +'>' + choice + '</span>&nbsp';
				});
			
			return newField;
		},

		createMultipleChoiceTag: function() {
			var newField = "<br/>";
			var checked = "";
			var survey = this;
			var i;
			if(this.editMode)
				var choiceValues = this.txtChoices.value;
			else
				var choiceValues = this.fieldChoices;
			
			dojo.forEach(eval(choiceValues.split(",")),
				function(choice) {
					for (i=0; i < survey.defaultFieldValue.length; i++) 
					{
						if (survey.defaultFieldValue[i] == choice){
							checked = "checked";
							break;
						}else
							checked = "";
					}

					newField = newField + '<span><input dojoType="dijit.form.CheckBox" dojoAttachPoint="fldValue" name="'+survey.fieldName+'" value="' + choice + '" '+ checked +'>' + choice + '</span>&nbsp';
				});
			
			return newField;
		},

		fieldModified: function() {
				this.surveyField.style.backgroundColor = "";
				if (this.lstType.value == "checkbox") {
					this.spnValue.style.display = "none";
					this.checkBoxValue.style.display = "";
				}
				else {
					this.checkBoxValue.style.display = "none";
					this.spnValue.style.display = "";
				}
				this.selectedEvent();
		},
		
		getData: function() {
			var survey = this;
			var value = this.fldValue.value;
			
			var data = {
				title: survey.title,
				value: value
			}
			
			return data;
		},
		
		getModel: function() {
			var survey = this;
			var fieldValue = "";
			var type = survey.lstType.value;

			var constructedFieldName = survey.constructFieldName();

			var model = {
				title: survey.title,
				type: survey.lstType.value,
				choices: survey.txtChoices.value,
				mandatory: survey.chkMandatory.checked,
				name: constructedFieldName//survey.fldName.value
			}
			return model;
		},

		/**
		 * Construct the field name from the field title by removing any spaces and using the first 15 characters
		 *
		 * @return The constructed field name
		 */
		constructFieldName: function () {
			var survey = this;

			// Construct the field name from the question title by removing the any spaces and using the first 15 characters
			var constructedFieldName = survey.fldTitle.value;
			constructedFieldName = constructedFieldName.replace(/ /g, '');
			constructedFieldName = constructedFieldName.substring(0, (constructedFieldName.length > 15) ? 15 : constructedFieldName.length);

			return constructedFieldName;
		}
	});
