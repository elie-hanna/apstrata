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
dojo.require("dojo.cookie");

dojo.declare("surveyWidget.widgets.Survey",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templateString: null,
		templatePath: dojo.moduleUrl("surveyWidget.widgets", "templates/Survey.html"),
		jsonDataModel: "{}",
		extraParam: {},
		isSurveyTemplate: false,
		editMode: false,
		useCookie: true,
		showEmbedCode: true,
		clone: false,
		displayType: 'none',
		questionContainer: null,
		surveyID: null,
		dataModel: null,
		surveyTitle : "Type the survey title here",
		surveyDockey : "",
		surveyDescription : "You can place the survey description here.",
		fieldSerialNumber: 0,
		sendAnswersInEmailUponSubmission: null,
		smsNotificationNumberValue: null,
		twitterUsernameValue: null,
		apServiceURL : "http://localhost/apstratabase/rest",  // apServiceURL is used to communicate with our REST-ful services
		apSourceURL : "http://localhost:8000/apstrataDojoSDK/", // apSourceURL points to where the survey code is hosted. 

		/**
		 * 		attrs is a JSON object containing some info about the survey: 
		 * 			storeName: the store used by the survey widget
		 * 			editingMode: When set to true, the suvey is in edit mode and it allows user to update the survey. 
		 * 						 When set to false, the survey is in running mode and it allows users to take the survey
		 * 			schema: Contains the schema of the loaded survey or is null when creating a new survey from scratch  
		 * 			surveyID: Contains the survey ID of the loaded survey or is null when creating a new survey from scratch     
		 * 			usingCookie: When set to true, the survey can be taken only once per user (based on the value of a cookie)
		 * 						 When set to false, there is no limit in taking the survey.
		 */
		attrs: {},
		
		/**
		 * Constructor of the survey widget.
		 */
		constructor: function() {
		},
		
		/**
		 * Function called by the constructor, used to set properties that are referenced in the widget
		 */
		postMixInProperties: function( ) {

			if(this.attrs.storeName) //if(typeof(this.attrs.storeName) != "undefined") 
				this.storeName = this.attrs.storeName
			
			if(this.attrs.editingMode) 
				this.editMode = (this.attrs.editingMode == "true")?true:false;
				
			if(this.attrs.usingCookie) 
				this.useCookie = (this.attrs.usingCookie == "true")?true:false;	
				
			if(this.attrs.showEmbedCode) 
				this.showEmbedCode = (this.attrs.showEmbedCode == "true")?true:false;
				
			if(this.attrs.cloningMode) 
				this.clone = (this.attrs.cloningMode == "true")?true:false;	
				
			if (this.attrs.surveyID) {
				this.surveyID = this.attrs.surveyID;
			}
				
			if (this.attrs.extraParam) {
				this.extraParam = this.attrs.extraParam;
				if(this.attrs.extraParam.isSurveyTemplate)
					this.isSurveyTemplate = (this.attrs.extraParam.isSurveyTemplate == "true")?true:false;	
			}		
				
			if (this.editMode && this.surveyID != null && !this.clone) {
				if(this.isSurveyTemplate)
					this.displayType = 'none';
				else
					this.displayType = '';
			}
			
			if(!this.editMode) // If the survey widget is not in editing mode use a different template
				this.templatePath = dojo.moduleUrl("surveyWidget.widgets", "templates/SurveyRun.html");
			
		},
		
		/**
		 * Function called by the constructor, used to construct and display the survey widget.
		 * 
		 */
		postCreate: function(){
			
			var self = this;
			var client = new apstrata.Client({connection: connection});
			
			if (this.surveyID != null) { // Verify that the document key is not null
				var queryRequest = {
					apsdb: {
						store: this.storeName,
						query: "apsdb.documentKey=\"" + this.surveyID + "\"",
						queryFields: "surveySchema,sendEmailUponSubmission,sendAnswersInEmailUponSubmission,sendSMSUponSubmission,smsNotificationNumber,rtl,sendTDMUponSubmission,twitterUsername"
					}};
	
				var q = client.call({
					action: "Query",
					request: queryRequest,
					load: function(operation) { // on success set the survey schema and construct the survey
						if (operation.response.result.documents.length > 0) {
							self.schema = operation.response.result.documents[0]["surveySchema"];
							self.sendEmailUponSubmission = operation.response.result.documents[0]["sendEmailUponSubmission"];
							if(operation.response.result.documents[0]["sendAnswersInEmailUponSubmission"])
								self.sendAnswersInEmailUponSubmission = operation.response.result.documents[0]["sendAnswersInEmailUponSubmission"];
							self.sendSMSUponSubmission = operation.response.result.documents[0]["sendSMSUponSubmission"];
							if(operation.response.result.documents[0]["smsNotificationNumber"])
								self.smsNotificationNumberValue = operation.response.result.documents[0]["smsNotificationNumber"];
							self.sendTDMUponSubmission = operation.response.result.documents[0]["sendTDMUponSubmission"];
							if(operation.response.result.documents[0]["twitterUsername"])
								self.twitterUsernameValue = operation.response.result.documents[0]["twitterUsername"];
							self.rtl = operation.response.result.documents[0]["rtl"];
						}
						self.constructSurvey();
					},
					error: function(operation) { // on error construct an empty survey
						self.constructSurvey();
					}
				});
			} else // if no survey key is specified then construct an empty survey
				this.constructSurvey();
		},
		
		/**
		 * Constructs and display the survey.
		 * 
		 */
		constructSurvey: function() {
			var survey = this;
			if(this.schema != null)
				this.jsonDataModel = decodeURIComponent(this.schema);
			
			dataModel = dojo.fromJson(this.jsonDataModel); // dataModel object contains the dojo representation of the survey schema

			if(this.editMode){
				if(this.clone)
					var sTitle = "Copy of " + dataModel.title
				else
					var sTitle = dataModel.title
					
				if (dataModel.title != null) this.title.setValue(sTitle); // extract the title from the survey schema
				if (dataModel.description != null) this.description.setValue(dataModel.description); // extract the description from the survey schema
				if (this.sendEmailUponSubmission != null && this.sendEmailUponSubmission == 'true') {
					this.sendEmailSubmission.setValue(this.sendEmailUponSubmission);
					this.sendAnswersInEmailSubmissionDivAP.style.display = "";
					if (this.sendAnswersInEmailUponSubmission != null && this.sendAnswersInEmailUponSubmission == 'true') {
						this.sendAnswersInEmailSubmissionAP.setValue(this.sendAnswersInEmailUponSubmission);
					}
				}
				if (this.sendSMSUponSubmission != null && this.sendSMSUponSubmission == 'true') {
					this.sendSMSSubmission.setValue(this.sendSMSUponSubmission);
					this.smsNotificationNumberDiv.style.display = "";
					if (this.smsNotificationNumberValue != null) {
						this.smsNotificationNumber.setValue(this.smsNotificationNumberValue);
					}
				}
				if (this.sendTDMUponSubmission != null && this.sendTDMUponSubmission == 'true') {
					this.sendTDMSubmission.setValue(this.sendTDMUponSubmission);
					this.twitterUsernameDiv.style.display = "";
					if (this.twitterUsernameValue != null) {
						this.twitterUsername.setValue(this.twitterUsernameValue);
						this.twitterUsernameDiv.style.display = "";
					}
				}
				if (dataModel.viewResults != null){
					if (dataModel.viewResults) {
						this.viewResults.setValue(dataModel.viewResults);
						this.successMsgDiv.style.display = "none";
					}
					else {
						this.successMsg.setValue(dataModel.successMessage);
						this.successMsgDiv.style.display = "";
					}
				}
			} else{
				if (dataModel.title != null) this.title.innerHTML = dataModel.title; // extract the title from the survey schema
				if (dataModel.description != null) this.description.innerHTML = dataModel.description; // extract the description from the survey schema
			} 
			if (dataModel.dockey != null) this.surveyDockey = dataModel.dockey; // extract the survey dockey from the survey schema
			
			// Assemble the cookie name based on the survey's document key. This cookie is used to test if the survey has already been taken.
			var cookie = 'ap_' + this.surveyDockey;
			
			// Test if this user has not already taken the survey by checking the existence of the cookie
			if (!this.editMode && this.useCookie && dojo.cookie(cookie) == 'taken') { 
				if (dataModel.viewResults) { // checks the survey's configuration to see what should be loaded after submission
					this.loadAggregatedResults(); // Loads the results charts 
				} else {
					this.surveyDiv.style.display = 'none';
					this.successMessage.innerHTML = dataModel.successMessage; // Shows the success message extracted from the survey's schema
				}
			} else {
				//this.inherited(arguments);
				
				if (this.editMode) {
					if(this.surveyID != null && !this.clone)
						this.connect(this.btnGetData, "onclick", function(){survey.validateSurvey(true)}); // if the survey id is not null then the "Save" button should update the existing survey
					else
						this.connect(this.btnGetData, "onclick", function(){survey.validateSurvey(false)}); // if the survey id is null then the "Save" button should create a new survey
					this.connect(this.viewResults, "onclick", "toggleTextBox"); // Attaching the toggleTextBox function to the onclick event on the "Show results to users" check box
//					this.connect(this.emailCheckbox, "onclick", "toggleEmail"); // Attaching the toggleEmail function to the onclick event on the "Send by email" check box
//					this.connect(this.smsCheckbox, "onclick", "toggleSms"); // Attaching the toggleSms function to the onclick event on the "Send by email" check box
//					this.connect(this.btnEmail, "onclick", "sendEmail"); // Attaching the sendEmail function to the onclick event on the "Send"(email) button
//					this.connect(this.btnSms, "onclick", "sendSms"); // Attaching the sendSms function to the onclick event on the "Send"(sms) button
//					this.connect(this.btnForceSms, "onclick", "forceSendSms"); // Attaching the forceSendSms function to the onclick event on the "forceSendSms"(sms) button
				}
				else {
					this.connect(this.btnSubmit, "onclick", "saveSurvey"); // Attaching the saveSurvey function to the onclick event on the "Submit" button
				}
	
				this.questionContainer = this.initDnd();
	
				dojo.forEach(dataModel.questions, function(fieldDataModel) {
					var isVisible = (fieldDataModel.name != 'apsdbSchema') && (fieldDataModel.name != 'apsdbDockey');// Sets isVisible to false if the current field is either apsdbSchema or apsdbDockey.
					if(isVisible || (!isVisible && !survey.editMode) ) // This variable is used to display only the fields that have isVisible set to true.
						var newField = survey.createField(fieldDataModel, isVisible); // Creates and displays the question corresponding to the current field.
				});
	
				if(this.editMode)
					var newField = this.createField(null, true); // If the survey is in edit mode, create a dummy question used to create new ones.
				
				// Sets the survey text direction	
				this.setDirection();	
			}
		},
		
		/**
		 * Defines the drag and drop area.
		 * 
		 * @return The area in which the survey's questions can be dragged and dropped.
		 */
		initDnd: function() {
			src = new dojo.dnd.Source(this.questions.domNode,{withHandles:true});
			return(src);
		},
		
		/**
		 * Shows or hides the "success message" field depending on the value of the "Show results to users" check box.
		 * 
		 */
		toggleTextBox: function() {
			if(this.viewResults.checked)
				this.successMsgDiv.style.display = "none";
			else
				this.successMsgDiv.style.display = "";
		},
		
		/**
		 * Toggles the text direction from rtl or ltr
		 * 
		 */
		toggleDirection: function() {
			if (this.direction != null) {
				if (this.direction.checked) {
					this.surveyParentDiv.dir = "rtl";
				} else {
					this.surveyParentDiv.dir = "ltr";
				}
			}
		},
		
		setDirection: function(){
			if(this.editMode){
				if(this.rtl != null && this.rtl == "true"){
					if(this.direction != null){
						this.direction.setValue(true);
						this.surveyParentDiv.dir = "rtl";
					}
				}
			}
		},
		
		/**
		 * Shows or hides the "SMS Notification" field depending on the value of the "Send me an SMS for each submission" check box.
		 * 
		 */
		toggleSMSNotificationTextBox: function() {
			if(this.sendSMSSubmission.checked)
				this.smsNotificationNumberDiv.style.display = "";
			else
				this.smsNotificationNumberDiv.style.display = "none";
		},
		
		/**
		 * Shows or hides the "My Twitter username" field depending on the value of the "Send me a Twitter DM notification for each submission" check box.
		 * 
		 */
		toggleTDMNotificationTextBox: function() {
			if(this.sendTDMSubmission.checked)
				this.twitterUsernameDiv.style.display = "";
			else
				this.twitterUsernameDiv.style.display = "none";
		},

		/**
		 * Shows or hides the Email input and button
		 * 
		 */
/*
		toggleEmail: function() {
			if(this.emailCheckbox.checked)
				if(this.email.style.display == "none")
						this.email.style.display = "";
					else
						this.email.style.display = "none";
			else
				if(this.email.style.display == "none")
						this.email.style.display = "";
					else
						this.email.style.display = "none";
		},
*/	
		/**
		 * Shows or hides the sms input and button
		 * 
		 */
/*
		toggleSms: function() {
			if(this.smsCheckbox.checked)
				if(this.phone.style.display == "none")
						this.phone.style.display = "";
					else
						this.phone.style.display = "none";
			else
				if(this.phone.style.display == "none")
						this.phone.style.display = "";
					else
						this.phone.style.display = "none";
		},

*/			
		/**
		 * Creates an object of type surveyWidget.widgets.SurveyField that represent one question.
		 * 
		 * @param dataModel
		 * 		dojo object containing the details of the question to create
		 * 
		 * @param isVisible
		 * 		 If isVisisble is false then the question will be hidden else it will appear in the survey.
		 *  
		 * @return The created question object.
		 */
		createField: function(dataModel, isVisible) {
			
			var newField = new surveyWidget.widgets.SurveyField({attrs : {dataModel:dataModel, editMode:this.editMode, serialNumber:++this.fieldSerialNumber}});

			// Do not display the field that should be invisible
			if (!isVisible) {
				newField.surveyField.style.display = 'none';
			}

			// Adds the newField node to the document
			this.questions.addChild(newField);

			newField.setParent(this);

			var survey = this;

			if (this.editMode) {
				
				// If the survey is in editMode and the user clicks on the dummy question then  
				// it will become the current question and a new dummy question will be created
				this.connect(newField, "fieldModified", function(){
					if (newField.dummyField) {	
						this.createField(null, true);
						newField.dummyField = false;
					}
				});
				
				// On event fieldModified, select the new question and unselect the previous one
				this.connect(newField, "selectedEvent", function(){
					dojo.forEach(this.questions.getChildren(), function(child){
						if (child.selected) 
							child.restoreInitialState();
						child.unselect();
					});
					newField.select();
				});
				
				// Saves the initial state of the currently edited question, to be able to roll back if the user chooses to cancel his changes
				this.connect(newField, "saveInitialState", function(){
					this.setInitialState(newField);
				});
				
			}
	
	
			// On event fieldModified, select the new question and unselect the previous one
			this.connect(newField , "selectedEvent", function () {
					if (this.editMode) { //this condition should be moved outside the connect
						dojo.forEach(this.questions.getChildren(), function(child) {
							if(child.selected)
								child.restoreInitialState();
							child.unselect();	
						});
						newField.select();
					}
				});
				
			// Saves the initial state of the currently edited question, to be able to roll back if the user chooses to cancel his changes
			this.connect(newField , "saveInitialState", function () {
					if (this.editMode) { //this condition should be moved outside the connect
						this.setInitialState(newField);
					}
				});

			return newField;
		},
		
		/**
		 * Saves the initial state of the currently edited question
		 * 
		 * @param newField
		 * 		SurveyField object representing the currently edited question
		 */
		setInitialState: function(newField) {
			if (!newField.selected) {
				var jsonObj = this.surveyform.getValues();
				
				newField.initialState = {
					title: newField.title,
					type: newField.lstType.value,
					choices: newField.txtChoices.value,
					mandatory: newField.chkMandatory.checked,
					fieldValue: jsonObj[newField.fldName.value]
				}
			}
		},
		
		/**
		 *	Called after a widget's children, and other widgets on the page, have been created.
		 *	Provides an opportunity to manipulate any children before they are displayed.
		 *	This is useful for composite widgets that need to control or layout sub-widgets.
		 *	Many layout widgets can use this as a wiring phase.
		 */
		startup: function(){
			this.inherited(arguments);
		},
		
		/**
		 * Send Email to recipient
		 * 
		 */
/*
		sendEmail: function() {
			var client = new apstrata.Client({connection: connection});
			var self = this;
			var sendEmailRequest = dojo.mixin({
				surveyName: self.schemaName,
				serviceURL: self.apServiceURL
			}, {
				apsdb: {
					scriptName: "sendEmail",
					storeName: self.storeName,
					debugLevel: 4
				}
			}, {
				apsma: {
					to: self.emailaddress.value,
					subject: "Apstrata Survey",
				}
			});
			var sd = client.call({
					action: "RunScript",
					useHttpMethod : "GET",
					request: sendEmailRequest,
					load: function(operation) {
						self.warningMessage.style.display = 'none'; // On success hide the warning message
					},
					error: function(operation) {
						self.warningMessage.style.display = ''; // Display the warning message
						self.warningMessage.innerHTML = operation.response.metadata.errorDetail;
					}
				});
		},
*/		
		/*
		 * Force send sms
		 */
/*
		forceSendSms: function(){
			var client = new apstrata.Client({connection: connection});
			var self = this;
			var runScriptRequest = dojo.mixin({
				surveyName: self.schemaName,
				phoneNumber: self.phoneNumber.value,
				killSurvey: "true"
			}, {
				apsdb: {
					scriptName: "sendSms"
				}
			});
			var sd = client.call({
					action: "RunScript",
					useHttpMethod : "GET",
					request: runScriptRequest,
					load: function(operation) {
						self.warningMessage.style.display = 'none'; // On success hide the warning message
						self.btnSms.style.display = '';
						self.btnForceSms.style.display = 'none';
					},
					error: function(operation) {
						self.warningMessage.style.display = ''; // Display the warning message
						//TODO: change this once custom error codes are added
						switch (operation.response.metadata.errorDetail.substring(7,12)) {
							case 'RETRY':
								warningMsg = 'Sms server currently busy.Please try again later';
								self.btnSms.style.display = '';
								self.btnForceSms.style.display = 'none';
								break;
							case 'FORCE':
								warningMsg = 'Survey already in progress.Click on force send to abort and send a new survey.';
								break;
							default:
								warningMsg = "Error while sending the sms";
								self.btnSms.style.display = '';
								self.btnForceSms.style.display = 'none';
						}
								self.warningMessage.style.display = ''; // Display the warning message
								self.warningMessage.innerHTML = warningMsg;
					}
				});
		},
*/		
		/**
		 * Send Sms to recipient
		 * 
		 */
/*		
		sendSms: function(){
			var client = new apstrata.Client({connection: connection});
			var self = this;
			var runScriptRequest = dojo.mixin({
				surveyName: self.schemaName,
				phoneNumber: self.phoneNumber.value
			}, {
				apsdb: {
					scriptName: "sendSms"
				}
			});
			var sd = client.call({
					action: "RunScript",
					useHttpMethod : "GET",
					request: runScriptRequest,
					load: function(operation) {
						self.warningMessage.style.display = 'none'; // On success hide the warning message
					},
					error: function(operation) {
						self.warningMessage.style.display = ''; // Display the warning message
						//TODO: change this once custom error codes are added
						switch (operation.response.metadata.errorDetail.substring(7,12)) {
							case 'RETRY':
								warningMsg = 'Sms server currently busy.Please try again later';
								break;
							case 'FORCE':
								warningMsg = 'Survey already in progress.Click on force send to abort and send a new survey.';
								self.btnSms.style.display = 'none';
								self.btnForceSms.style.display = '';
								break;
							default:
								warningMsg = "Error while sending the sms";
						}
								self.warningMessage.style.display = ''; // Display the warning message
								self.warningMessage.innerHTML = warningMsg;
					}
				});
		},
*/		
		
		validateSurvey: function(update) {
			var self = this
			if(this.title.value!=""){
				if (!update && connection.credentials.username != "") {
					var client = new apstrata.Client({connection: connection});
					var q = client.call({
						action: "Query",
						request: {
							apsdb: {
								store: self.storeName,
								query: "apsdb.creator=\"" + connection.credentials.username + "\" and isSurveyMetadata=\"true\" and isSurveyTemplate=\"true\" and surveyName=\""+this.title.value+"\"",
								count: true
							}
						},
						load: function(operation){
							if (operation.response.result.count == '0') {
								self.warningMessage.style.display = 'none'; // Hide the warning message
								self.getModel(self, update)
							}
							else {
								self.warningMessage.style.display = ''; // Display the warning message
								self.warningMessage.innerHTML = "The survey's name should be unique";
							}
						},
						error: function(operation){
							self.warningMessage.style.display = 'none'; // Hide the warning message
							self.getModel(self, update)
						}
					});
				}
				else {
					self.warningMessage.style.display = 'none'; // Hide the warning message
					self.getModel(self, update)
				}
			} else {
				self.warningMessage.style.display = ''; // Display the warning message
				self.warningMessage.innerHTML = "The campaign's name is required";
			}
		},
		
		/**
		 * Constructs and displays the embed codes used to run a survey, list the results of the survey in a table or list the results as charts
		 * 
		 * @param update
		 * 		The boolean 'update' defines if the survey should be updated of if a new survey should be created
		 */
		getModel: function(context,update) {
			var self = context;
			var jsonObj = self.surveyform.getValues();	// JSON object containing the default values of the created survey's questions
			var data = new Array();
			var arrFields = new Array();
			var arrTitleFields = new Array();
			var childModel = null;
			var i=0;
			var j=0;
			var k=0;
			var schemaFieldArr = new Array();
			var surveyQuestions = new Object();

			var children = self.questions.getChildren();
			var breakProcessing = false;
			dojo.forEach(self.questions.getChildren(), function(child) {
				if (breakProcessing) {
					// Do nothing
				} else if (child.title != null && child.title != '' && !child.dummyField) {
					childModel = child.getModel();
					if(childModel['type'] == "checkbox" || childModel['type'] == "text area"){
						childModel['choices'] = "[]";
					} 
					childModel["defaultValue"] = jsonObj[child.fieldName];
					data[i] = childModel;

					// Create an XML schema field object
					if (childModel['type'] == 'text area')
						schemaFieldArr[i] = new SchemaField(childModel.name, "text", false);
					else
						schemaFieldArr[i] = new SchemaField(childModel.name, "string", false);
					var minCardinality = 0;
					var maxCardinality = null;
					var regex = null;
					// Make the field mandatory by setting its minimum cardinality to 1
					if (childModel.mandatory) minCardinality = 1;
					// Make the field multiple-choice by setting its maximum cardinality to the number of allowed options
					if (childModel['type'] == 'multiple choice' || childModel['type'] == 'list' || childModel['type'] == 'radio button') {
						maxCardinality = childModel['choices'].split(',').length;
						regex = childModel['choices'].replace(/\s*,\s*/g,'|'); 
					}
					else
						maxCardinality = 1;

					schemaFieldArr[i].setCardinalities(minCardinality, maxCardinality); // Set the calculated cardinalities
					schemaFieldArr[i].setRegex(regex); // Set the validation regex

					i++;

					surveyQuestions["q"+i] = child.title;
					surveyQuestions["q"+i+"Type"] = childModel['type'];
					if (childModel['type'] == 'multiple choice' || childModel['type'] == 'list' || childModel['type'] == 'radio button')
						surveyQuestions["q"+i+"Answers"] = childModel['choices'];
					surveyQuestions["q"+i+"Mandatory"] = childModel.mandatory;
					surveyQuestions["q"+i+"Default"] = childModel["defaultValue"];
					surveyQuestions["q"+i+"Name"] = childModel.name;
					
				} else if ((child.title == null || child.title == '') && !child.dummyField) { // check if any question doens't have a title and if true display an error message
					child.select(); // Select the empty question
					self.warningMessage.style.display = ''; // Display the warning message
					self.warningMessage.innerHTML = 'All questions must have a title!';
					breakProcessing = true;
				}
			});
			
			var questionCount = i;
			
			// Stop processing the embed codes if a warning message was displayed
			if (breakProcessing)
				return;

			self.warningMessage.style.display = 'none'; // Hide the warning message in case it was displayed before

			// Create two new objects, one for the schema name and one for the survey docKey, and insert them as survey fields
			// The schema name must be between 3-32 characters long: s_[user key]_[survey title]_[random hash]
			var strTitleForSchema = self.cleanTitleForSchemaName(self.title.value);
			
			if(update)
				var schemaName = self.surveyID;
			else
				var schemaName = 's_' + apstrata.apConfig.key + '_' + strTitleForSchema + '_' + dojox.encoding.digests.MD5('' + new Date().getTime() + data, dojox.encoding.digests.outputTypes.Hex).toUpperCase().substring(0, 10);
			
			var dockey = schemaName; // The document key of the survey's metadata document is the name of the survey's schema
			self.schemaName = schemaName;

			var apstrataSurveySchemaName = new Object();
			apstrataSurveySchemaName.choices = '';
			apstrataSurveySchemaName.defaultValue = dockey;
			apstrataSurveySchemaName.mandatory = false;
			apstrataSurveySchemaName.name = 'apsdbSchema';
			apstrataSurveySchemaName.title = 'Apstrata Survey Schema Name';
			apstrataSurveySchemaName.type = 'text';
			data[i++] = apstrataSurveySchemaName;

			var apstrataSurveyDockey = new Object();
			apstrataSurveyDockey.choices = '';
			apstrataSurveyDockey.defaultValue = schemaName;
			apstrataSurveyDockey.mandatory = false;
			apstrataSurveyDockey.name = 'apsdbDockey';
			apstrataSurveyDockey.title = 'Apstrata Survey Dockey';
			apstrataSurveyDockey.type = 'text';
			data[i++] = apstrataSurveyDockey;

			dojo.forEach(self.questions.getChildren(), function(child) {
				if (child.title != null && !child.dummyField) {
					arrFields[j++] = child.fldName.value;
					arrTitleFields[k++] = child.fldTitle.value;
				}
			});

			// Building the survey schema
			var xmlSchema = new Schema(schemaName);
			xmlSchema.setSchemaACL("creator", "creator", "creator");
			xmlSchema.setDefaultACL("creator", "creator", "creator");
			var aclGroup = new SchemaACLGroup("aclG1", "all", "all", schemaFieldArr);
			xmlSchema.addACLGroup(aclGroup);

			var client = new apstrata.Client({connection: connection});
			var surveySchema = self.generateSurveySchema(data, dockey); // json object containing the survey's info needed to diplay the survey in running mode and the results as charts
			var listResultSchema = self.generateListResultSchema(arrFields, arrTitleFields, xmlSchema.name, dockey); // json object containing the survey's info needed to diplay the results in a table
				
			if(update)
				var apsdbRequest = {apsdb: {store: self.storeName,documentKey: dockey, update:true}};
			else
				var apsdbRequest = {apsdb: {store: self.storeName,documentKey: dockey}};
			
			var rtl = "false";
			if(self.direction != null){
				rtl = self.direction.checked;
			}
			var saveDocumentRequest = dojo.mixin({
							surveyName: self.title.value,
							surveyDescription: self.description.value,
							surveySchema: surveySchema,
							"surveySchema.apsdb.fieldType": "text",
							listResultSchema: listResultSchema,
							"listResultSchema.apsdb.fieldType": "text",
							isSurveyMetadata: "true",
							viewResults: self.viewResults.checked,
							sendEmailUponSubmission: self.sendEmailSubmission.checked,
							sendAnswersInEmailUponSubmission: self.sendAnswersInEmailSubmissionAP.checked,
							sendSMSUponSubmission: self.sendSMSSubmission.checked,
							rtl: rtl,
							smsNotificationNumber: self.smsNotificationNumber.value,
							sendTDMUponSubmission: self.sendTDMSubmission.checked,
							twitterUsername: self.twitterUsername.value,
							successMessage: self.successMsg.value,
							qCount: questionCount
			}, apsdbRequest, surveyQuestions, self.extraParam);
			
			if(update) 
				var setSchemaRequest = {apsdb: {schema: xmlSchema.toString(), schemaName: xmlSchema.name, update:true}};
			else
				var setSchemaRequest = {apsdb: {schema: xmlSchema.toString(), schemaName: xmlSchema.name}};

			
			
			// Creates a schema for the survey
			var ss = client.call({
				action: "SaveSchema",
				useHttpMethod : "POST",
				formNode: self.schemaform.domNode,
				request: setSchemaRequest,
				load: function(operation) {
					self.warningMessage.style.display = 'none'; // On success hide the warning message
					// Saves the metadata info of the survey in a document where the documentKey is equal to the schema name of the survey
					var sd = client.call({
						action: "SaveDocument",
						useHttpMethod : "POST",
						request: saveDocumentRequest,
						formNode: self.surveyform.domNode,
						load: function(operation) {
							self.warningMessage.style.display = 'none'; // On success hide the warning message
							var documentKey = operation.response.result.document.key;
							if (self.showEmbedCode == true) {
								self.generateAndDisplayEmbedCodes(dockey, update);
							}
							// self.emailSurvey.style.display = ""; // On success show the Send by Email
							// self.smsSurvey.style.display = ""; // On success show the Send by Sms
							// Used to refresh the list of forms later,publishing here, subscribing in the mforms
							if(self.clone)									
								dojo.publish("/CLONE/FORM", [{}]);
							else
								dojo.publish("/SAVE/FORM", [{ documentKey: documentKey, surveyName: self.title.value }]);
							
						},
						error: function(operation) {
							self.warningMessage.style.display = ''; // Display the warning message
							self.warningMessage.innerHTML = operation.response.metadata.errorDetail;
							if(!update){
								var ds = client.call({
									action: "DeleteSchema",
									request: {
										apsdb: {
											schemaName : xmlSchema.name
										}
									},
									load: function(operation) {
										//deleting the form metadata schema if the document couldn't be created
									},
									error: function(operation) {
										// something happened
									}
								});
							}
						}
					});
				},
				error: function(operation) {
					var warningMsg = '';
					switch (operation.response.metadata.errorCode) {
						case 'DUPLICATE_SCHEMA_NAME':
							warningMsg = 'Survey already exists! Please change its name';
							break;
						case 'INVALID_SCHEMA_NAME':
							warningMsg = 'The survey title must not contain any special characters! Please change its name';
							break;
						default:
							warningMsg = operation.response.metadata.errorDetail;
					}
					self.warningMessage.style.display = ''; // Display the warning message
					self.warningMessage.innerHTML = warningMsg;
				}
			});
		},

		/**
		 * Excludes the following characters:
		 * ', ,~,!,%
		 * Then truncates the string to the first 8 characters
		 *
		 * @param title The survey title to use for the schema name
		 */
		cleanTitleForSchemaName: function (title) {
			var strTitleForSchema = this.title.value.replace(/ /g, '');
			strTitleForSchema = strTitleForSchema.replace(/'/g, '');
			strTitleForSchema = encodeURIComponent(strTitleForSchema);
			strTitleForSchema = strTitleForSchema.replace(/~/g, '');
			strTitleForSchema = strTitleForSchema.replace(/!/g, '');
			strTitleForSchema = strTitleForSchema.replace(/%/g, '');
			strTitleForSchema = (strTitleForSchema.length > 8) ? strTitleForSchema.substring(0, 8) : strTitleForSchema;

			return strTitleForSchema;
		},
		
		/**
		 * Creates a JSON object containing the information needed by the embed code to display the survey and its results in charts.
		 * 
		 * @param data
		 * 		JSON object containing the question objects of the survey
		 * 
		 * @param dockey
		 * 		String representing the documentKey of the metadata document created for the survey
		 * 
		 * @return The JSON object containing the information needed by the embed code.
		 */
		generateSurveySchema: function (data, dockey) {
			var surveyData = {
				title: this.title.value,
				description: this.description.value,
				viewResults: this.viewResults.checked,
				successMessage: this.successMsg.value,
				questions: data,
				dockey: dockey,
				rtl: (this.direction.checked != null && this.direction.checked == true)? "true": "false"
			};

			var surveyDataSchema = encodeURIComponent(dojo.toJson(surveyData)).replace(/'/g, '%27'); // Replace single quotes with their HEX
			
			return surveyDataSchema;
		},
		
		/**
		 * Creates a JSON object containing the information needed by the embed code to display the results of the survey in a table.
		 * 
		 * @param arrFields
		 * 		Array containing the field's names of the survey's questions
		 * 
		 * @param arrTitleFields
		 * 		Array containing the titles of the survey's questions
		 * 
		 * @param schemaName
		 * 		String representing the name of the apstrata schema created for the survey
		 * 
		 * @param dockey
		 * 		String representing the documentKey of the metadata document created for the survey
		 * 		
		 * @return The JSON object containing the information needed by the embed code.
		 */
		generateListResultSchema: function (arrFields, arrTitleFields, schemaName, dockey) {
			var listSurveyData = {
				title: this.title.value,
				fields: arrFields,
				titleFields: arrTitleFields,
				apsdbSchema: schemaName,
				dockey: dockey
			};
			// Adding the takenBy field that should be displayed in the table of taken surveys to show who took the survey (phone number, email address or anonymous)
			listSurveyData.fields[listSurveyData.fields.length] = "takenBy";
			listSurveyData.titleFields[listSurveyData.titleFields.length] = "Taken By";

			// Adding the Ip field that should be displayed in the table of taken surveys to show who took the survey (phone number, email address or anonymous)
			listSurveyData.fields[listSurveyData.fields.length] = "ip";
			listSurveyData.titleFields[listSurveyData.titleFields.length] = "Ip";

			// Adding the Time field that should be displayed in the table of taken surveys to show who took the survey (phone number, email address or anonymous)
			listSurveyData.fields[listSurveyData.fields.length] = "time";
			listSurveyData.titleFields[listSurveyData.titleFields.length] = "Time";
			
			var listSurveyDataSchema = encodeURIComponent(dojo.toJson(listSurveyData)).replace(/'/g, '%27'); // Replace single quotes with their HEX
			
			return listSurveyDataSchema;
		},

		/**
		 * Displays the embed codes used to run a survey, list the results of the survey in a table or list the results as charts
		 * 
		 * @param surveyDataSchema
		 * 		JSON object containing the information needed by the embed code to display the survey and its results in charts.
		 * 
		 * @param listSurveyDataSchema
		 * 		JSON object containing the information needed by the embed code to display the results of the survey in a table.
		 * 		
		 */
		generateAndDisplayEmbedCodes: function (surveyID, update) {

			// Embed code to run the survey
			var generatedCode = '<div>Copy and paste the following embed code in your html page to run the survey.</div><textarea style="width:400px; height:100px;">'
			+ '<!-- You can move the script tag to the head of your html page -->\n'
			+ '<script type="text/javascript" src="http://o.aolcdn.com/dojo/1.3/dojo/dojo.xd.js"\n' 
			+ 'djConfig="debugAtAllCosts: false, xdWaitSeconds: 10, parseOnLoad: true, useXDomain: true, isDebug: false,\n'
          	+ 'modulePaths: { surveyWidget: \''+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/surveyWidget\',\n'
		  	+ '			 apstrata: \''+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/apstrata\',\n'
		  	+ '			 dojo: \'http://o.aolcdn.com/dojo/1.3/dojo/\' }"></script>\n'
			+ '<script type="text/javascript" src="'+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/apstrata/apstrata-lib.js.uncompressed.js" apConfig="key:\'' + apstrata.apConfig.key + '\', serviceURL: \'' + this.apServiceURL + '\'"></script>\n'
			+ '<link rel=stylesheet href="'+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/surveyWidget/widgets/css/survey.css" type="text/css">\n'
			+ '<!-- Place this DIV where you want the widget to appear in your page -->\n'
			+ '<div dojoType="surveyWidget.widgets.Survey" attrs="{storeName:\'' + this.storeName + '\',surveyID:\'' + surveyID + '\'}" /></div>'
			+ '</textarea>';
			
			if (!update) {
				this.output.innerHTML = generatedCode;
				this.output.style.display = "";
				this.output.width = "800px";
			}
			
			// Embed code to see the results of your survey
			this.listingEmbed.innerHTML = '<div>Copy and paste the following embed code in your html page to see the results of your survey.</div><textarea style="width:400px; height:100px;">'
			+ '<!-- You can move the script tag to the head of your html page -->\n'
			+ '<script type="text/javascript" src="http://o.aolcdn.com/dojo/1.3/dojo/dojo.xd.js"' 
			+ 'djConfig="debugAtAllCosts: false, xdWaitSeconds: 10, parseOnLoad: true, useXDomain: true, isDebug: false,'
          	+ 'modulePaths: { surveyWidget: \''+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/surveyWidget\','
		  	+ '			 apstrata: \''+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/apstrata\','
		  	+ '			 dojo: \'http://o.aolcdn.com/dojo/1.3/dojo/\' }"></script>'
			+ '<script type="text/javascript" src="'+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/apstrata/list-apstrata-lib.js.uncompressed.js" apConfig="key:\'' + apstrata.apConfig.key + '\', serviceURL: \'' + this.apServiceURL + '\'"></script>\n'
			+ '<link rel=stylesheet href="'+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/surveyWidget/widgets/css/survey.css" type="text/css">\n'
			+ '<!-- Place this DIV where you want the widget to appear in your page -->\n'
			+ '<div>'
			+ '<div dojoType="surveyWidget.widgets.SurveyListing" attrs="{storeName:\'' + this.storeName + '\',surveyID:\'' + surveyID + '\'}" /></div>'
			+ '</div>'
			+ '</textarea>';

			if (!update) {
				this.listingEmbed.style.display = "";
				this.listingEmbed.width = "800px";
			}

			// Embed code to see the results of your survey in charts
			this.chartingEmbed.innerHTML = '<div>Copy and paste the following embed code in your html page to see charts of results of your survey.</div><textarea style="width:400px; height:100px;">'
			+ '<!-- You can move the script tag to the head of your html page -->\n'
			+ '<script type="text/javascript" src="http://o.aolcdn.com/dojo/1.3/dojo/dojo.xd.js"' 
			+ 'djConfig="debugAtAllCosts: false, xdWaitSeconds: 10, parseOnLoad: true, useXDomain: true, isDebug: false,'
          	+ 'modulePaths: { surveyWidget: \''+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/surveyWidget\','
		  	+ '			 apstrata: \''+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/apstrata\','
		  	+ '			 dojo: \'http://o.aolcdn.com/dojo/1.3/dojo/\' }"></SCRIPT>'
			+ '<script type="text/javascript" src="'+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/apstrata/chart-apstrata-lib.js.uncompressed.js" apConfig="key:\'' + apstrata.apConfig.key + '\', serviceURL: \'' + this.apServiceURL + '\'"></script>\n'
			+ '<link rel=stylesheet href="'+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/surveyWidget/widgets/css/survey.css" type="text/css">\n'
			+ '<!-- Place this DIV where you want the widget to appear in your page -->\n'
			+ '<div>'
			+ '<div dojoType="surveyWidget.widgets.SurveyCharting" attrs="{storeName:\'' + this.storeName + '\',surveyID:\'' + surveyID + '\'}"  /></div>'
			+ '</div>'
			+ '</textarea>';
			
			if (!update) {
				this.chartingEmbed.style.display = "";
				this.chartingEmbed.width = "800px";
			}
		},
		
		/**
		 * Saves the values of the submitted survey.
		 * 		
		 */
		saveSurvey: function() {

			if(this.surveyform.validate()){
				
				var jsonObj = this.surveyform.getValues();
				var self = this;
				
				// Assemble the cookie name. The cookie will be used to ensure that a user doesn't take the survey more than once.
				var cookie = 'ap_' + jsonObj.apsdbSchema;

				// Change the name of the attribute 'apsdbSchema' to 'apsdb.schema', then delete the 'apsdbSchema' attribute
				jsonObj['apsdb.schema'] = jsonObj.apsdbSchema;
				delete jsonObj.apsdbSchema;

				var client = new apstrata.Client({connection: connection});
				
				jsonObj['storeName'] = self.storeName;
				jsonObj['surveyID'] = self.surveyID;
				var runScriptRequest = dojo.mixin(jsonObj, {
					apsdb: {
							store: self.storeName,
							scriptName: "saveSurveyUserResult"
					}
				});

				// Save a document of the data gathered from the user
				var sd = client.call({
					action: "RunScript",
					useHttpMethod : "GET",
					request: runScriptRequest,
					load: function(operation) {
						if(operation.response.metadata.status == "success")
						{
							if(operation.response.result.status == "success")
							{
								dojo.cookie(cookie, 'taken', {expires: 30 * 256}); // Set the cookie to expire after 30 years.

								// TODO : Removed the call to tweet the submitting of a survey since we do not need it now.
								//self.tweetTheSubmitting(jsonObj.apsdbDockey);
								if (self.sendEmailUponSubmission == 'true') {
									self.emailTheSubmitting();
								}
								
								if (self.sendSMSUponSubmission == 'true') {
									self.smsTheSubmitting();
								}
								
								if (self.sendTDMUponSubmission == 'true') {
									self.twitterDMTheSubmitting();
								}
								
								//  According to the survey creators choice, either display the result charts or a message (either
								// from the script or the success message set by the creator).
								if (dataModel.viewResults) {
									self.loadAggregatedResults();
									// TODO : Removed the call to tweet the submitting of a survey since we do not need it now.
									//self.tweetTheSubmitting(jsonObj.apsdbDockey);
								}
								else {
									self.surveyDiv.style.display = 'none';
									self.successMessage.innerHTML = dataModel.successMessage;
								}
							}
							else
							{
								self.surveyDiv.style.display = 'none';
								self.successMessage.innerHTML = operation.response.result.message;
							}
						}
					},
					error: function(operation) {
						self.errorMessage.innerHTML = operation.response.metadata.errorDetail;
					}
				});
			} else{
				this.successMessage.innerHTML = '';
			}
		},
		
		/**
		 * Runs the tweeting script
		 * 
		 * @param apsdbDockey
		 * 		DocumentKey (String) of the document containing the metadata information of the survey
		 * 
		 */
		tweetTheSubmitting: function(apsdbDockey) {
			// Run a script
			var client = new apstrata.Client({connection: connection});
			var self = this;
			var runScriptletRequest = dojo.mixin({
				store: self.storeName,
				dockey: apsdbDockey,
				title: self.title.innerHTML
			}, {
				apsdb: {
					scriptName: 'tweetSurveyTaken'
				}
			});

			var sd = client.call({
				action: "RunScript",
				request: runScriptletRequest,
				load: function(operation) {
				},
				error: function(operation) {
					self.errorMessage.innerHTML = operation.response.metadata.errorDetail;
				}
			});
		},
		
		/**
		 * Runs the emailing script
		 */
		emailTheSubmitting: function() {
			// Run a script
			var client = new apstrata.Client({connection: connection});
			var self = this;
			var runScriptletRequest = dojo.mixin({
				title: self.title.innerHTML,
				store: self.storeName,
				surveyName: self.surveyID
			}, {
				apsdb: {
					scriptName: 'emailSurveyTaken'
				}
			});

			var sd = client.call({
				action: "RunScript",
				request: runScriptletRequest,
				load: function(operation) {
				},
				error: function(operation) {
					self.errorMessage.innerHTML = operation.response.metadata.errorDetail;
				}
			});
		},

		/**
		 * Runs the SMSing script
		 */
		smsTheSubmitting: function() {
			// Run a script
			var client = new apstrata.Client({connection: connection});
			var self = this;

			var runScriptletRequest = dojo.mixin({
				title: self.title.innerHTML,
				smsNotificationNumber: self.smsNotificationNumber.value
			}, {
				apsdb: {
					scriptName: 'smsSurveyTaken'
				}
			});

			var sd = client.call({
				action: "RunScript",
				request: runScriptletRequest,
				load: function(operation) {
				},
				error: function(operation) {
					self.errorMessage.innerHTML = operation.response.metadata.errorDetail;
				}
			});
		},

		/**
		 * Runs the Twitter Direct Message script
		 */
		twitterDMTheSubmitting: function() {
			// Run a script
			var client = new apstrata.Client({connection: connection});
			var self = this;
			
			var runScriptletRequest = dojo.mixin({
				surveyID: self.surveyID,
				store: self.storeName,
				title: self.title.innerHTML
			}, {
				apsdb: {
					store: self.storeName,
					scriptName: 'twitterDMSurveyTaken',
								debugLevel: 4
				}
			});

			var sd = client.call({
				action: "RunScript",
				request: runScriptletRequest,
				load: function(operation) {
				},
				error: function(operation) {
					self.errorMessage.innerHTML = operation.response.metadata.errorDetail;
				}
			});
		},
		
		/**
		 * Replace the survey by its results in charts
		 * 
		 */
		loadAggregatedResults: function() {
			if(this.attrs != null && this.attrs.surveyID)
				var charts = new surveyWidget.widgets.SurveyCharting({attrs : this.attrs});
			else
				var charts = new surveyWidget.widgets.SurveyCharting();
			dojo._destroyElement(this.survey);
			this.aggregatedResults.addChild(charts);
		},
		showIncludeAnswersCheckBox: function()
		{
			if(this.sendEmailSubmission.checked)
			{
				this.sendAnswersInEmailSubmissionDivAP.style.display = "";
			}
			else{
				this.sendAnswersInEmailSubmissionAP.setValue(false);
				this.sendAnswersInEmailSubmissionDivAP.style.display = "none";
			}
			
		}
	});