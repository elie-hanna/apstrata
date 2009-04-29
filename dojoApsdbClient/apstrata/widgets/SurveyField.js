dojo.provide("apstrata.widgets.SurveyField");

dojo.require("dijit._Templated");
dojo.require("dijit.InlineEditBox");

dojo.declare("apstrata.widgets.SurveyField",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templateString: null,
		templatePath: dojo.moduleUrl("apstrata.widgets", "templates/SurveyField.html"),
		
		title: "Set a question title here",
		fieldType: "text",
		selected: false,
		parentSurvey: null,
		
		constructor: function(dataModel) {
			console.debug(dojo.toJson(dataModel));
			if (dataModel!=null) {
				if (dataModel.title != null) {
					this.title = dataModel.title;
					this.fieldType = dataModel.type;
				}
			}
		},

		setParent: function(parentSurvey) {
			this.parentSurvey = parentSurvey;
		},

		postCreate: function(){
			this.inherited(arguments);
			
//			this.connect(this.surveyField, "onclick", "selected");
			this.connect(this.btnDelete, "onclick", "delete");
			this.connect(this.spnValue, "onclick", "selectedEvent");
			this.connect(this.btnCancel, "onclick", function() {if (this.title == null) this.delete(); else this.unselect();});
			this.connect(this.lstType, "onchange", "changeType");
			this.connect(this.fldTitle, "onClick", function() {if (this.title != null) this.fieldModified()});
			this.connect(this.fldTitle, "onChange", function() {this.title = this.fldTitle.value; this.fieldModified()});
			
			this.connect(this.txtChoices, "onchange", function() {this.changeType();});
		},
		
		startup: function(){
			this.inherited(arguments);
		},
		 
		delete: function() {
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
				this.editor.style.display = "";
				this.surveyField.style.backgroundColor = "rgba(255, 255, 130, .9)";
				
				this.selected = true;				
			}
		},
				
		unselect: function() {
			this.editor.style.display = "none";	
			this.surveyField.style.backgroundColor = "";

			this.selected = false;
		},
		
		changeType: function() {
			if (this.lstType.value == 'list') {
				this.divChoices.style.display = "";
			} else {
				this.divChoices.style.display = "none";				
			}
			
			this.fieldModified();

			var newField = '';
			this.fieldType = this.lstType.value;

			switch(this.lstType.value)
			{	
				case 'checkbox':
					this.divChoices.style.display = "none";				

					newField = "<input type='checkbox' dojoAttachPoint='fldValue' class='propertyValue' />"
					break;
				case 'list':
					this.divChoices.style.display = "";

					newField = this.createSelectTag();
					break;
				case 'radio button':
					this.divChoices.style.display = "";

					newField = this.createRadioButtonsTag();
					break;
				case 'multiple choice':
					this.divChoices.style.display = "";

					newField = this.createMultipleChoiceTag();
					break;
				default:
					this.divChoices.style.display = "none";				

					newField = "<input type='text' dojoAttachPoint='fldValue' class='propertyValue' value='"+this.value+"'/>"
					break;
			}

			this.spnValue.innerHTML = newField;
		},
		
		createSelectTag: function() {
			var optionsTags = "";
			var newField = "";
			
			dojo.forEach(eval(this.txtChoices.value.split(",")),
				function(choice) {
					optionsTags = optionsTags + "<option>" + choice + "</option>";
				});
			
			newField = "<select dojoAttachPoint='fldValue'>"+optionsTags+"</select>";
			return newField;
		},
		
		createRadioButtonsTag: function() {
			var newField = "";
			
			dojo.forEach(eval(this.txtChoices.value.split(",")),
				function(choice) {
					newField = newField + "<span><input type='radio' dojoAttachPoint='fldValue' name='"+this.id+"' value='" + choice + "'>" + choice + "</span>&nbsp";
				});
			
			return newField;
		},

		createMultipleChoiceTag: function() {
			var newField = "";
			
			dojo.forEach(eval(this.txtChoices.value.split(",")),
				function(choice) {
					newField = newField + "<span><input type='checkbox' dojoAttachPoint='fldValue' name='"+this.id+"' value='" + choice + "'>" + choice + "</span>&nbsp";
				});
			
			return newField;
		},

		fieldModified: function() {
			this.surveyField.style.backgroundColor = "";
			this.spnValue.style.display = "";
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
			var model = {
				title: survey.title,
				type: survey.lstType.value,
				choices: survey.txtChoices.value,
				mandatory: survey.chkMandatory.checked
			}
			return model;
		}
	});

// &nbsp;&nbsp;<span dojoAttachPoint="deleteBtn">delete</span>&nbsp;|&nbsp;<span dojoAttachPoint="editorBtn">edit</span>