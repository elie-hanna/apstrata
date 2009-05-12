dojo.provide("surveyWidget.widgets.Survey");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("surveyWidget.widgets.SurveyField");
dojo.require("dojo.dnd.Container");
dojo.require("dojo.dnd.Manager");
dojo.require("dojo.dnd.Source");


dojo.declare("surveyWidget.widgets.Survey",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templateString: null,
		templatePath: dojo.moduleUrl("surveyWidget.widgets", "templates/Survey.html"),
		jsonDataModel: "{}",
		editMode: true,
		questionContainer: null,
		dataModel: null,
		surveyTitle : "Type the survey title here",
		surveyDescription : "You can place the survey description here.",

		constructor: function() {
			if(schema != null)
				this.jsonDataModel = schema;

			dataModel = dojo.fromJson(this.jsonDataModel);
			if (dataModel.title != null) this.surveyTitle = dataModel.title;
			if (dataModel.description != null) this.surveyDescription = dataModel.description;
			
			if(this.getUrlParam("editMode") == "true"){
				this.editMode = true;
			} else{
				this.editMode = false;
				this.templatePath = dojo.moduleUrl("surveyWidget.widgets", "templates/SurveyRun.html");
			}
		},
		
		postCreate: function(){
			this.inherited(arguments);
			// when clicking on "get Data Model" the getModel function is called
			if(this.editMode)
				this.connect(this.btnGetData, "onclick", "getModel");
			else
				this.connect(this.btnSubmit, "onclick", "saveSurvey");

			this.questionContainer = this.initDnd();
			var survey = this;
			
			dojo.forEach(dataModel.questions, function(fieldDataModel) {
				var newField = survey.createField(fieldDataModel);
				});
			
			if(this.editMode)
				var newField = this.createField(null);
		},
		
		initDnd: function() {
			return(new dojo.dnd.Source(dojo.byId("dndContainer")));
		},
		
		deselectFields: function() {
		},
		
		createField: function(dataModel) {
			var newField = new surveyWidget.widgets.SurveyField(dataModel,this.editMode);

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
			
			var jsonObj = this.surveyform.getValues();	
			var data = new Array();
			var childModel = null;
			var i=0;
			var children = this.questions.getChildren();
			dojo.forEach(this.questions.getChildren(), function(child) {
				if (child.title != null && children[children.length - 1] != child) {
					childModel = child.getModel();
					childModel["defaultValue"] = jsonObj[child.fieldName];
					data[i++] = childModel;
				}
			});

			var suveyData = {
				title: this.title.value,
				description: this.description.value,
				questions: data
			};
			
			//console.debug(dojo.toJson(suveyData));
			this.output.innerHTML = '<textarea style="width:400px; height:100px;">'
			+ '<script type="text/javascript" src="../dojo/1.2.3/dojo/dojo.js" djConfig="parseOnLoad: true"></script>\n'
			+ '<script type="text/javascript" src="widgets/SurveyRunner.js" >\n'
			+ '<script>var schema = \'' + dojo.toJson(suveyData) + '\';</script>\n'
			+ '<!-- Move this DIV anywhere in your page to add the widget -->\n'
			+ '<div dojoType="surveyWidget.widgets.Survey" /></div>'
			+ '</textarea>';
			this.output.style.display = "";
			this.output.width = "800px";

			return suveyData;
		},
		
		getUrlParam: function(name) {
		  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		  var regexS = "[\\?&]"+name+"=([^&#]*)";
		  var regex = new RegExp( regexS );
		  var results = regex.exec( window.location.href );
		  if( results == null )
		    return "";
		  else
		    return results[1];
		},
		
		saveSurvey: function() {
		
			if(this.surveyform.validate()){
				var jsonObj = this.surveyform.getValues();
				//var auth = {key: "ECA9A0BCE9", secret: "BF26CB5B40E2E64EDFEE"};
				var auth = {key: "apstrata", secret: "secret"};
	
				  var q = new apstrata.dojo.client.apsdb.Query(auth);
					dojo.connect(q, "handleResult", function(){
					    console.dir(q.response);
					    console.dir("end");
					})
			
				//q.execute("My_Test_Store616186","f1!=\"form1\"", "f1,f2,f3");
				var sd = new apstrata.dojo.client.apsdb.SaveDocument(auth, "My_Test_Store616186", jsonObj);
				dojo.connect(sd, "handleResult", function(){
				    console.dir("handleResult start");
				    console.dir(sd.response);
				  q.execute("My_Test_Store616186","f1!=\"form1\"", "f1,f2,f3");
				});
				sd.execute();
				this.successMessage.innerHTML = "Your survey has been successfully submitted.";
				return true;
			} else{
				this.successMessage.innerHTML = "";
				return false;
			}
		}
		
	});
