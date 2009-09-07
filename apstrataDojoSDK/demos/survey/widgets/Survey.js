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

		//
		// Replace here with your store name
		//
		storeName: "myStore",

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
			if (this.editMode) {
				this.connect(this.btnGetData, "onclick", "getModel");
				this.connect(dojo.byId("viewResultsId"), "onclick", "toggleTextBox");
			}
			else {
				this.connect(this.btnSubmit, "onclick", "saveSurvey");
			}

			this.questionContainer = this.initDnd();
			var survey = this;

			dojo.forEach(dataModel.questions, function(fieldDataModel) {
				var isVisible = (fieldDataModel.name != 'apstrataSurveyID'); // Do not show the 'apstrataSurveyID' field
				var newField = survey.createField(fieldDataModel, isVisible);
			});

			if(this.editMode)
				var newField = this.createField(null, true);
		},
		
		initDnd: function() {
			src = new dojo.dnd.Source(dojo.byId("dndContainer"),{withHandles:true});
			return(src);
		},
		
		deselectFields: function() {
		},
		
		toggleTextBox: function() {
			if(this.viewResults.checked){
				this.successMsgDiv.style.display = "none";
				this.resultsUrlDiv.style.display = "";
			}
			else{
				this.successMsgDiv.style.display = "";
				this.resultsUrlDiv.style.display = "none";
			}
		},
		
		createField: function(dataModel, isVisible) {
			var newField = new surveyWidget.widgets.SurveyField(dataModel,this.editMode);

			// Do not display the field that should be invisible
			if (!isVisible) {
				newField.surveyField.style.display = 'none';
			}

			this.questions.addChild(newField);

			newField.setParent(this);

			var survey = this;
			
			this.connect(newField , "fieldModified", function() {
					if (this.editMode) {
						var children = this.questions.getChildren();
						if (newField.dummyField) {
							this.createField(null, true);
							newField.dummyField = false;
						}
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
			var arrFields = new Array();
			var arrTitleFields = new Array();
			var childModel = null;
			var i=0;
			var j=0;
			var k=0;
			var children = this.questions.getChildren();
			dojo.forEach(this.questions.getChildren(), function(child) {
				if (child.title != null && !child.dummyField) {
					childModel = child.getModel();
					childModel["defaultValue"] = jsonObj[child.fieldName];
					data[i++] = childModel;
				}
			});

			// Create a new object to act as the randomly generated survey identifier (named 'apstrataSurveyID') and insert it as a survey field
			var strApstrataSurveyID = dojox.encoding.digests.MD5('' + new Date().getTime() + data, dojox.encoding.digests.outputTypes.Hex).toUpperCase();
			var apstrataSurveyID = new Object();
			apstrataSurveyID.choices = '';
			apstrataSurveyID.defaultValue = strApstrataSurveyID;
			apstrataSurveyID.mandatory = false;
			apstrataSurveyID.name = 'apstrataSurveyID';
			apstrataSurveyID.title = 'Apstrata Survey ID';
			apstrataSurveyID.type = 'text';
			data[i++] = apstrataSurveyID;

			dojo.forEach(this.questions.getChildren(), function(child) {
				if (child.title != null && !child.dummyField) {
					arrFields[j++] = child.fldName.value;
					arrTitleFields[k++] = child.fldTitle.value;
				}
			});

			var surveyData = {
				title: this.title.value,
				description: this.description.value,
				viewResults: this.viewResults.checked,
				successMessage: this.successMsg.value,
				resultsUrl: this.resultsUrl.value,
				questions: data
			};
			
			var listSurveyData = {
				title: this.title.value,
				fields: arrFields,
				titleFields: arrTitleFields,
				apstrataSurveyID: strApstrataSurveyID
			};
			
			var viewUrl = this.getViewUrl();
			/* 
			//console.debug(dojo.toJson(surveyData));
			this.output.innerHTML = '<div>Copy and paste the following embed code in your html page to run the survey.</div><textarea style="width:400px; height:100px;">'
			+ '<!-- You can move the script tag to the head of your html page -->\n'
			+ '<script type="text/javascript" src="../../lib/dojo/1.3.0-src/dojo/dojo.js" djConfig="parseOnLoad: true"></script>\n'
			+ '<script type="text/javascript" src="../../apstrata/apstrata.js" apConfig="key:\'7744293024\', secret:\'3B45DE19C689EDAFCA47\', serviceURL: \'http://apsdb.apstrata.com/sandbox-apsdb/rest\'"></script>'
			+ '<script type="text/javascript" src="widgets/SurveyRunner.js" ></script>\n'
			+ '<script>var schema = \'' + dojo.toJson(surveyData) + '\';</script>\n'
			+ '<!-- Place this DIV where you want the widget to appear in your page -->\n'
			+ '<div dojoType="surveyWidget.widgets.Survey" /></div>'
			+ '</textarea>';*/
			this.output.innerHTML = '<div>Copy and paste the following embed code in your html page to run the survey.</div><textarea style="width:400px; height:100px;">'
			+ '<iframe src="'+ viewUrl +'/view/generateEmbed?key=7744293024&secret=3B45DE19C689EDAFCA47&serviceURL=http://apsdb.apstrata.com/sandbox-apsdb/rest&schema=' + escape(dojo.toJson(surveyData)) + '" ></iframe>'
			+ '</textarea>';
			this.output.style.display = "";
			this.output.width = "800px";

			/*this.listingEmbed.innerHTML = '<div>Copy and paste the following embed code in your html page to see the results of your survey.</div><textarea style="width:400px; height:100px;">'
			+ '<!-- You can move the script tag to the head of your html page -->\n'
			+ '<script type="text/javascript" src="../../lib/dojo/1.3.0-src/dojo/dojo.js" djConfig="parseOnLoad: true"></script>\n'
			+ '<script type="text/javascript" src="../../apstrata/apstrata.js" apConfig="key:\'7744293024\', secret:\'3B45DE19C689EDAFCA47\', serviceURL: \'http://apsdb.apstrata.com/sandbox-apsdb/rest\'"></script>'
			+ '<script type="text/javascript" src="widgets/SurveyListingLoader.js" ></script>\n'
			+ '<script>var schema = \'' + dojo.toJson(listSurveyData) + '\';</script>\n'
			+ '<!-- Place this DIV where you want the widget to appear in your page -->\n'
			+ '<div>'
			+ '<div dojoType="surveyWidget.widgets.SurveyListing" /></div>'
			+ '</div>'
			+ '</textarea>';*/
			this.listingEmbed.innerHTML = '<div>Copy and paste the following embed code in your html page to run the survey.</div><textarea style="width:400px; height:100px;">'
			+ '<iframe src="'+ viewUrl +'/view/generateEmbed?AF_deliveryChannel=listing&key=7744293024&secret=3B45DE19C689EDAFCA47&serviceURL=http://apsdb.apstrata.com/sandbox-apsdb/rest&schema=' + escape(dojo.toJson(listSurveyData)) + '" ></iframe>'
			+ '</textarea>';
			this.listingEmbed.style.display = "";
			this.listingEmbed.width = "800px";

			/*this.chartingEmbed.innerHTML = '<div>Copy and paste the following embed code in your html page to see charts of results of your survey.</div><textarea style="width:400px; height:100px;">'
			+ '<!-- You can move the script tag to the head of your html page -->\n'
			+ '<script type="text/javascript" src="../../lib/dojo/1.3.0-src/dojo/dojo.js" djConfig="parseOnLoad: true"></script>\n'
			+ '<script type="text/javascript" src="../../apstrata/apstrata.js" apConfig="key:\'7744293024\', secret:\'3B45DE19C689EDAFCA47\', serviceURL: \'http://apsdb.apstrata.com/sandbox-apsdb/rest\'"></script>'
			+ '<script type="text/javascript" src="widgets/SurveyChartingLoader.js" ></script>\n'
			+ '<script>var schema = \'' + dojo.toJson(surveyData) + '\';</script>\n'
			+ '<!-- Place this DIV where you want the widget to appear in your page -->\n'
			+ '<div>'
			+ '<div dojoType="surveyWidget.widgets.SurveyCharting" /></div>'
			+ '</div>'
			+ '</textarea>';*/
			this.chartingEmbed.innerHTML = '<div>Copy and paste the following embed code in your html page to run the survey.</div><textarea style="width:400px; height:100px;">'
			+ '<iframe src="'+ viewUrl +'/view/generateEmbed?AF_deliveryChannel=aggregates&key=7744293024&secret=3B45DE19C689EDAFCA47&serviceURL=http://apsdb.apstrata.com/sandbox-apsdb/rest&schema=' + escape(dojo.toJson(surveyData)) + '" ></iframe>';
			+ '</textarea>';
			this.chartingEmbed.style.display = "";
			this.chartingEmbed.width = "800px";

			return surveyData;
		},
		
		addslashes: function(str) {
			str=str.replace(/\\/g,'\\\\');
			str=str.replace(/\'/g,'\\\'');
			str=str.replace(/\"/g,'\\"');
			return str;
		},
		
		getViewUrl: function() {
			pathName = window.location.pathname.split("/");
			viewUrl = window.location.protocol + "//" + window.location.host + "/" + pathName[1];
			return viewUrl;
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
				this.successMessage.innerHTML = "Your survey is being processed...";
				var jsonObj = this.surveyform.getValues();
				var survey = this;

				var client = new apstrata.apsdb.client.Client();
				var sd = client.saveDocument(
					function() {
						if (dataModel.viewResults) 
							window.location = dataModel.resultsUrl;
						else {
							survey.surveyDiv.style.display="none";
							survey.successMessage.innerHTML = dataModel.successMessage;
						}
						
					}, function() {
						survey.successMessage.innerHTML = "A problem occured while submitting your survey, please try again later.";
					},
					{
						store: survey.storeName,
						fields: jsonObj
					}
				)
				
				return true;
			} else{
				this.successMessage.innerHTML = "";
				return false;
			}
		}
		
	});
