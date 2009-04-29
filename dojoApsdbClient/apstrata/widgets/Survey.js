dojo.provide("apstrata.widgets.Survey");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("apstrata.widgets.SurveyField");
dojo.require("dojo.dnd.Container");
dojo.require("dojo.dnd.Manager");
dojo.require("dojo.dnd.Source");


dojo.declare("apstrata.widgets.Survey",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templateString: null,
		templatePath: dojo.moduleUrl("apstrata.widgets", "templates/Survey.html"),
		
		jsonDataModel: "{}",
		editMode: true,

		postCreate: function(){
			this.inherited(arguments);

			this.connect(this.btnGetData, "onclick", "getModel");
			
			this.connect(this.btnEdit, "onclick", function() {
					if (this.btnEdit.textContent == "edit") {
						this.btnEdit.textContent = "run";
						this.editMode = false;
					} else {
						this.btnEdit.textContent = "edit";
						this.editMode = true;
					}
				} );
			
			
			var dataModel = dojo.fromJson(this.jsonDataModel);
			var survey = this;
			
			dojo.forEach(dataModel, function(fieldDataModel) {
					var newField = survey.createField(fieldDataModel);
				});

			var newField = this.createField({});
			//this.initDnd();
		},
		
		initDnd: function() {
			var c1;
			c1 = new dojo.dnd.Source(this.questions); //dojoType="dojo.dnd.Source"
		    
			// example subscribe to events
			dojo.subscribe("/dnd/start", function(source){
			  console.debug("Starting the drop", source);
			});
			
			dojo.subscribe("/dnd/drop/before", function(source, nodes, copy, target){
			  if(target == c1){
			    console.debug(copy ? "Copying from" : "Moving from", source, "to", target, "before", target.before);
			  }
			});
			
			dojo.subscribe("/dnd/drop", function(source, nodes, copy, target){
			  if(target == c1){
			    console.debug(copy ? "Copying from" : "Moving from", source, "to", target, "before", target.before);
			  }
			});
			
			dojo.connect(c4, "onDndDrop", function(source, nodes, copy, target){
			  if(target == c4){
			    console.debug(copy ? "Copying from" : "Moving from", source);
			  }
			});
		},
		
		deselectFields: function() {
		},
		
		createField: function(dataModel) {
			var newField = new apstrata.widgets.SurveyField(dataModel);
			this.questions.addChild(newField);

			newField.setParent(this);

			var survey = this;
						
			this.connect(newField , "fieldModified", function() {
					if (this.editMode) {
						var children = this.questions.getChildren();
						if (children[children.length - 1] == newField) {this.createField(null);}
					}
				});


			this.connect(newField , "selectedEvent", function () {
					if (this.editMode) {
						dojo.forEach(this.questions.getChildren(), function(child) {
							child.unselect();	
						});
						newField.select();
					}
				});

			return newField;
		},
		
		startup: function(){
			this.inherited(arguments);
		},
		
		getData: function() {
			var data = new Array();
			var i=0;
			dojo.forEach(this.questions.getChildren(), function(child) {
				if (!(child.title == null)) data[i++] = child.getData();
			});
			return data;
		},
		
		getModel: function() {
			var data = new Array();
			var i=0;
			dojo.forEach(this.questions.getChildren(), function(child) {
				if (!(child.title == null)) {
					data[i++] = child.getModel();
				}
			});

			var suveyData = {
				title: this.title.value,
				decription: this.description.value,
				questions: data
			};
			
			this.output.innerHTML = dojo.toJson(suveyData);
			this.output.style.display = "";
			this.output.width = "800px";

			return surveyData;
		}
		
	});

// &nbsp;&nbsp;<span dojoAttachPoint="deleteBtn">delete</span>&nbsp;|&nbsp;<span dojoAttachPoint="editorBtn">edit</span>