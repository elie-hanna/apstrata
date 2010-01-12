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
dojo.provide("apstrata.mForms.Forms")

dojo.declare("apstrata.mForms.Forms",
[apstrata.horizon.HStackableList], 
{
	data: [],
	
	storeName: "DefaultStore",
	editable: true,
	
	refresh: function() {
		var self = this
		
		this.getContainer().client.call({
				action: "Query",
				request: {
					apsdb: {
						store: self.storeName,
						query: "apsdb.creator=\"" + connection.credentials.username+ "\" and isSurveyMetadata=\"true\"",
						queryFields: "surveyName,apsdb.documentKey,surveySchema"
					}
				},
				load: function(operation) {
					// Rearrange the result to suite the template

					self.data = []
					dojo.forEach(operation.response.result.documents, function(document) {
						self.data.push({label: document.fields[0].values[0], iconSrc: "", attrs:{schema: document.fields[2].values[0], documentKey: document.fields[1].values[0]}})
					})
	
					// Cause the DTL to rerender with the fresh self.data
					self.render()
					//dojo.style(this.domNode,{width:'400px'})
				},
				error: function(operation) {
				}
			});
			
			this.inherited(arguments)
	},
	
	newItem: function() {
		var self = this
		this.openPanel(apstrata.mForms.SurveyEditor,{schema:null, editingMode:true, storeName: self.storeName, usingCookie: false})
	},
	
	postCreate: function() {
		this.refresh()
		this.inherited(arguments)
	},
	
	onClick: function(index, label, attrs) {
		var self = this
		this.openPanel(apstrata.mForms.FormActions, {schema: attrs.schema, storeName: self.storeName});
	},
	
	onDeleteItem: function(index, label, attrs) {
		var self = this
		this.getContainer().client.call({
				action: "DeleteSchema",
				request: {
					apsdb: {
						schemaName : attrs.documentKey
					}
				},
				load: function(operation) {
					self.getContainer().client.call({
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
							// something happened
						}
					});
				},
				error: function(operation) {
				}
			});
	}
})

dojo.declare("apstrata.mForms.FormActions", 
[apstrata.horizon.HStackableList], 
{
	data: [
		{label: "schedule", iconSrc: "../../apstrata/resources/images/pencil-icons/calendar.png"},
		{label: "try", iconSrc: "../../apstrata/resources/images/pencil-icons/survey.png"},
		{label: "results", iconSrc: "../../apstrata/resources/images/pencil-icons/statistic.png"},
		{label: "edit", iconSrc: "../../apstrata/resources/images/pencil-icons/edit.png"}
	],
	
	schema: null,
	
	constructor: function(attrs) {
		this.schema = attrs.schema
		this.storeName = attrs.storeName
	},
	
	onClick: function(index, label) {
		var self = this
		
		this.closePanel()
		
		switch (label)
		{
			case 'schedule':
				this.openPanel(apstrata.mForms.CampaignForm, {schema:self.schema, editingMode:false, storeName: self.storeName});
			break;
			case 'try':
				this.openPanel(apstrata.mForms.SurveyEditor,{schema:self.schema, editingMode:false, storeName: self.storeName, usingCookie: false})
			break;
			case 'results':
				this.openPanel(apstrata.mForms.SurveyResults, {schema:self.schema, storeName: self.storeName})
			break;
			case 'edit':
				this.openPanel(apstrata.mForms.SurveyEditor,{schema:self.schema, editingMode:true, storeName: self.storeName, usingCookie: false})
			break;
			default:
		}
	}
})

dojo.require("dijit.Declaration");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.SimpleTextarea");
dojo.require("surveyWidget.widgets.Survey");
dojo.require("apstrata.util.schema.Schema");


dojo.declare("apstrata.mForms.SurveyEditor", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.mForms", "templates/SurveyEditorPanel.html"),

	maximizePanel: true,
	
	constructor: function(attrs) {
		this.attrs = attrs
	},
	
	postCreate: function() {
		var survey = new surveyWidget.widgets.Survey(this.attrs)
		dojo.place(survey.domNode, this.dvSurvey, 'only')
		this.inherited(arguments)
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
		var surveyResults = new surveyWidget.widgets.SurveyCharting(this.attrs)
		dojo.place(surveyResults.domNode, this.dvSurveyResults, 'only')
		this.inherited(arguments)
	}
})
