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

dojo.provide("apstrata.mForms.Campaigns")
dojo.provide("apstrata.mForms.CampaignForm")

dojo.require("dijit.form.ValidationTextBox")
dojo.require("dijit.form.Button")
dojo.require("dojox.widget.Calendar")
dojo.require("dijit.form.TimeTextBox")
dojo.require("dijit.form.DateTextBox")
dojo.require("dijit.form.SimpleTextarea")
dojo.require('dijit.form.FilteringSelect')

dojo.require('dijit.Editor')
dojo.require("dojo.data.ItemFileReadStore")
dojo.require("dijit.form.ComboBox")

dojo.require("apstrata.util.DocumentUtils")

dojo.declare('apstrata.mForms.Campaigns',
[apstrata.horizon.HStackableList],
{
	data: [],
	storeName: "DefaultStore",
	editable: true,
		
	constructor: function() {
	},
	
	postCreate: function() {
		this.refresh()
		this.inherited(arguments)
	},
	
	refresh: function(){
		var self = this
		
		this.getContainer().client.call({
			action: "Query",
			request: {
				apsdb: {
					store: self.storeName,
					query: "formType=\"campaign\"",
					queryFields: "apsdb.documentKey,campaignName,target,formId,sms,email,distributionMode,startDate,startTime,endDate,endTime"
				}
			},
			load: function(operation){
				// Rearrange the result to suite the template
				
				self.data = []
				dojo.forEach(operation.response.result.documents, function(document) {
					var o = {
						'apsdb.documentKey': '',
						campaignName: '',
						formId: '',
						target: '',
						sms: '',
						email: '',
						distributionMode: ''
/*
						startDate: '',
						startTime: '',
						endDate: '',
						endTime: ''
*/
					}
					
					//var ohoh = apstrata.documentUtils.copyToObject(o, document)

					self.data.push({
						label: document.campaignName,
						iconSrc: "",
						attrs: {
							documentKey: document.key,
							targetName: document.campaignName,
							document: document,
							surveyID: document.formId
						}
					})
				})
				
				// Cause the DTL to rerender with the fresh self.data
				self.render()
			},
			error: function(operation){
			}
		});
		
		this.inherited(arguments)
	},

	newItem: function() {
		this.openPanel(apstrata.mForms.CampaignForm)
	
		this.inherited(arguments)
	},

	onClick: function(index, label, attrs) {
		var self = this
		this.openPanel(apstrata.mForms.CampaignActions, {surveyID: attrs.document.formId, document: attrs.document, storeName: self.storeName});
	},

	onDeleteItem: function(index, label, attrs) {
		var self = this
		this.getContainer().client.call({
				action: "DeleteDocument",
				request: {
					apsdb: {
						store : self.storeName,
						documentKey : attrs.documentKey
					}
				},
				load: function(operation) {
					self.refresh();
				},
				error: function(operation) {
				}
			});
	}
	
})

dojo.declare("apstrata.mForms.CampaignActions", 
[apstrata.horizon.HStackableList], 
{
	data: [
		{label: "edit", iconSrc: "../../apstrata/resources/images/pencil-icons/edit.png"},
		{label: "list", iconSrc: "../../apstrata/resources/images/pencil-icons/notepad.png"},
		{label: "results", iconSrc: "../../apstrata/resources/images/pencil-icons/statistic.png"},
		{label: "embed code", iconSrc: "../../apstrata/resources/images/pencil-icons/clasp.png"}
	],
	
	constructor: function(attrs) {
		this.surveyID = attrs.surveyID;
		this.document = attrs.document;
		this.storeName = attrs.storeName;
	},
	
	onClick: function(index, label) {
		var self = this
		
		this.closePanel()
		
		switch (label)
		{
			case 'edit':
				this.openPanel(apstrata.mForms.CampaignForm,{document: self.document, storeName: self.storeName})
			break;
			case 'list':
				this.openPanel(apstrata.mForms.SurveyData,{surveyID:self.surveyID, storeName: self.storeName})
			break;
			case 'results':
				this.openPanel(apstrata.mForms.SurveyResults, {surveyID:self.surveyID, storeName: self.storeName})
			break;
			case 'embed code':
				this.openPanel(apstrata.mForms.EmbedCode, {surveyID:self.surveyID, storeName: self.storeName})
			break;
			default:
		}
	}
})

dojo.declare("apstrata.mForms.CampaignForm", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.mForms", "templates/ScheduleForm.html"),
	maximizePanel: true,
	
	update: false,
	
	storeName: "DefaultStore",
	phoneNumbers: "",
	surveyName: "",
	
	constructor: function(attrs) {
		if (attrs) this.attrs = attrs
	},
	
	_getTargetsStore: function(onLoad) {
		var self = this

		this.getContainer().client.call({
			action: "Query",
			request: {
				apsdb: {
					store: self.storeName,
					query: "formType=\"targetGroup\"",
					queryFields: "apsdb.documentKey,targetName"
				}
			},
			load: function(operation){
				// Rearrange the result to suite the template
				
				var data = {label: "targetName", identifier: "documentKey"}
				data.items = []
				
				dojo.forEach(operation.response.result.documents, function(document){
					data.items.push({
						documentKey: document.key,
						targetName: document.targetName
					})
				})

		        var store = new dojo.data.ItemFileReadStore({
					data: data
		        });
				
				onLoad(store)
			},
			error: function(operation){
			}
		});
	},

	_getFormsStore: function(onLoad) {
		var self = this
		this.getContainer().client.call({
				action: "Query",
				request: {
					apsdb: {
						store: self.storeName,
						query: "apsdb.creator=\"" + connection.credentials.username+ "\" and isSurveyMetadata=\"true\"",
						queryFields: "surveyName,apsdb.documentKey"
					}
				},
				load: function(operation) {
					// Rearrange the result to suite the template

					self.data = []
					dojo.forEach(operation.response.result.documents, function(document) {
						self.data.push({label: document.surveyName, iconSrc: "", attrs:{documentKey: document.key}})
					})

					var data = {label: "formId", identifier: "documentKey"}
					data.items = []
					
					dojo.forEach(operation.response.result.documents, function(document){
						data.items.push({
							documentKey: document.key,
							formId: document.surveyName
						})
					})
	
			        var store = new dojo.data.ItemFileReadStore({
						data: data
			        });
					
					onLoad(store)
				},
				error: function(operation) {
				}
			});
	},
	
	postCreate: function() {
		var self = this
		this.update = false
		var targets

		self._getTargetsStore(function(t) {
			targetsStore = t
			self._getFormsStore(function(formsStore) {
				if (self.attrs) {
					console.dir(self.attrs)
					if (self.attrs.document) {
						self.update = true
						self.render()
						self.schedule.setValues(self.attrs.document)
					}
				}
				
				var targetName = ""
				if (self.attrs.document) targetName = self.attrs.document.target

				var formId = ""
				if (self.attrs.document) formId = self.attrs.document.formId

		        new dijit.form.FilteringSelect({
		            name: "target",
		            value: targetName,
		            store: targetsStore,
		            searchAttr: "targetName",
					required: "true"
		        },
		        self.dvSelectTarget);

		        new dijit.form.FilteringSelect({
		            name: "formId",
		            value: formId,
		            store: formsStore,
		            searchAttr: "formId",
					required: "true"
		        },
		        self.dvSelectForm);
			})
		})
		
//		this.refreshTargetsList(function() {})
		this.inherited(arguments)
	},
	
	activate: function() {
		var self = this
		
		console.dir(this.schedule.attr("value"))
		
		var endDate = "";
		if(this.schedule.attr("value").endDate && this.schedule.attr("value").endDate != "")
		{
			endDate = Date.parse(this.schedule.attr("value").endDate);
			endDate +=  Date.parse(this.schedule.attr("value").endTime);
		}
		
		var startDate = "";
		if(this.schedule.attr("value").startDate && this.schedule.attr("value").startDate != "")
		{
			startDate = Date.parse(this.schedule.attr("value").startDate);
			startDate +=  Date.parse(this.schedule.attr("value").startTime);
		}
		
		if (this.schedule.validate()) {
			request = dojo.mixin(this.schedule.attr("value"), {
				formType: "campaign",
				"email.apsdb.fieldType": "text",
				"campaignEndDate": endDate,
				"campaignStartDate": startDate,
				apsdb: {
					store: self.getParent().storeName
				}
			})
			
			if (this.update) 
				request.apsdb.documentKey = this.attrs.document['apsdb.documentKey']
			
			this.getContainer().client.call({
				action: "SaveDocument",
				request: request,
				//				formNode: self.schedule.domNode,
				load: function(operation){
					self.getContainer().client.call({
						action: "Query",
						request: {
							apsdb: {
								store: self.getParent().storeName,
								query: "apsdb.documentKey=\"" + self.schedule.attr("value").target + "\"",
								queryFields: "targetMembers"
							}
						},
						load: function(operation){
                            switch (self.schedule.attr("value").distributionMode) {
								case "sms":
                                    var runScriptletRequest = dojo.mixin({
                                        phoneNumbers: operation.response.result.documents[0].targetMembers,
                                        surveyName: self.schedule.attr("value").formId,
                                        smsText: self.schedule.attr("value").sms
                                    }, {
                                        apsdb: {
                                            scriptName: 'sendSms'
                                        }
                                    });
                                    break;
                                case "email":
	                                var runScriptletRequest = dojo.mixin({
	                                    surveyName:  self.schedule.attr("value").formId,
										emailHeader: self.schedule.attr("value").email
	                                }, {
	                                    apsdb: {
	                                        scriptName: "sendEmail",
	                                        storeName: self.getParent().storeName,
	                                        debugLevel: 4
	                                    }
	                                }, {
	                                    apsma: {
	                                        to: operation.response.result.documents[0].targetMembers,
	                                        subject: "Apstrata Survey",
	                                    }
	                                });
                                    break;
                                case "online":
                                    break;
                            }
							// Run the script 
							self.getContainer().client.call({
								action: "RunScript",
								request: runScriptletRequest,
								load: function(operation){
								},
								error: function(operation){
								}
							})
						},
						error: function(operation){
						}
					});
					self.getParent().refresh()
				},
				error: function(operation){
				}
			});
		}
	},
	
	save: function(){
		var self = this


		var endDate = "";
		if(this.schedule.attr("value").endDate && this.schedule.attr("value").endDate != "")
		{
			endDate = Date.parse(this.schedule.attr("value").endDate);
			endDate +=  Date.parse(this.schedule.attr("value").endTime);
		}
		
		var startDate = "";
		if(this.schedule.attr("value").startDate && this.schedule.attr("value").startDate != "")
		{
			startDate = Date.parse(this.schedule.attr("value").startDate);
			startDate +=  Date.parse(this.schedule.attr("value").startTime);
		}
		
		if (this.update || (!this.update && this.dvCampaignName.isValid())) {
			request = dojo.mixin(this.schedule.attr("value"), {
				formType: "campaign",
				"email.apsdb.fieldType": "text",
				"campaignEndDate": endDate,
				"campaignStartDate": startDate,
				apsdb: {
					store: self.getParent().storeName
				}
			})
			
			if (this.update) 
				request.apsdb.documentKey = this.attrs.document['apsdb.documentKey']
			
			this.getContainer().client.call({
				action: "SaveDocument",
				request: request,
				load: function(operation){
					self.getParent().refresh()
				},
				error: function(operation){
				}
			});
		} else {
			this.dvCampaignName.focus()
			this.dvCampaignName.displayMessage("The campaign's name is required")
		}
	}
})

dojo.require("surveyWidget.widgets.SurveyCharting");

dojo.declare("apstrata.mForms.SurveyResults", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.mForms", "templates/SurveyResultsPanel.html"),
	maximizePanel: true,

	constructor: function(attrs) {
		this.attrs = attrs
	},
	
	postCreate: function() {
		var surveyResults = new surveyWidget.widgets.SurveyCharting({attrs : this.attrs})
		dojo.place(surveyResults.domNode, this.dvSurveyResults, 'only')
		this.inherited(arguments)
	}
})

dojo.require("surveyWidget.widgets.SurveyListing");

dojo.declare("apstrata.mForms.SurveyData", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.mForms", "templates/SurveyDataPanel.html"),
	maximizePanel: true,

	constructor: function(attrs) {
		this.attrs = attrs
	},
	
	postCreate: function() {
		var surveyData = new surveyWidget.widgets.SurveyListing({attrs : this.attrs})
		dojo.place(surveyData.domNode, this.dvSurveyData, 'only')
		this.inherited(arguments)
	}
})

dojo.declare("apstrata.mForms.EmbedCode", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.mForms", "templates/EmbedCode.html"),
	maximizePanel: true,
	apServiceURL : "http://apsdb.apstrata.com/sandbox-apsdb/rest",
	apSourceURL : "http://developer.apstrata.com/apstrataSDK/",

	constructor: function(attrs) {
		this.surveyID = attrs.surveyID;
		this.storeName = attrs.storeName;
	},
	
	postCreate: function() {
		//var surveyResults = new surveyWidget.widgets.SurveyCharting({attrs : this.attrs})
		//dojo.place(surveyResults.domNode, this.dvSurveyResults, 'only')
		this.generateAndDisplayEmbedCodes(this.surveyID);
		this.inherited(arguments);
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
	generateAndDisplayEmbedCodes: function (surveyID) {
		
		// Embed code to run the survey
		this.output.innerHTML = '<div>Copy and paste the following embed code in your html page to run the survey.</div><textarea style="width:500px; height:150px;">'
		+ '<!-- You can move the script tag to the head of your html page -->\n'
		+ '<script type="text/javascript" src="http://o.aolcdn.com/dojo/1.3/dojo/dojo.xd.js"\n' 
		+ 'djConfig="debugAtAllCosts: false, xdWaitSeconds: 10, parseOnLoad: true, useXDomain: true, isDebug: false,\n'
      	+ 'modulePaths: { surveyWidget: \''+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/surveyWidget\',\n'
	  	+ '			 apstrata: \''+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/apstrata\',\n'
	  	+ '			 dojo: \'http://o.aolcdn.com/dojo/1.3/dojo/\' }"></script>\n'
		+ '<script type="text/javascript" src="'+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/apstrata/apstrata-lib.js.uncompressed.js" apConfig="key:\'' + apstrata.apConfig.key + '\', serviceURL: \'' + this.apServiceURL + '\'"></script>\n'
		+ '<link rel=stylesheet href="'+this.apSourceURL+'lib/dojo/1.3.0-src/release/apstrata/surveyWidget/widgets/css/survey.css" type="text/css">\n'
		+ '<!-- Place this DIV where you want the widget to appear in your page -->\n'
		+ '<div dojoType="surveyWidget.widgets.Survey" attrs="{storeName:\'' + this.storeName + '\',surveyID:\'' + this.surveyID + '\'}" /></div>'
		+ '</textarea>';
		
		this.output.style.display = "";
		this.output.width = "800px";
		
		// Embed code to see the results of your survey
		this.listingEmbed.innerHTML = '<div>Copy and paste the following embed code in your html page to see the results of your survey.</div><textarea style="width:500px; height:150px;">'
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
		+ '<div dojoType="surveyWidget.widgets.SurveyListing" attrs="{storeName:\'' + this.storeName + '\',surveyID:\'' + this.surveyID + '\'}" /></div>'
		+ '</div>'
		+ '</textarea>';

		this.listingEmbed.style.display = "";
		this.listingEmbed.width = "800px";

		// Embed code to see the results of your survey in charts
		this.chartingEmbed.innerHTML = '<div>Copy and paste the following embed code in your html page to see charts of results of your survey.</div><textarea style="width:500px; height:150px;">'
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
		+ '<div dojoType="surveyWidget.widgets.SurveyCharting" attrs="{storeName:\'' + this.storeName + '\',surveyID:\'' + this.surveyID + '\'}"  /></div>'
		+ '</div>'
		+ '</textarea>';
		
		this.chartingEmbed.style.display = "";
		this.chartingEmbed.width = "800px";
	}
})