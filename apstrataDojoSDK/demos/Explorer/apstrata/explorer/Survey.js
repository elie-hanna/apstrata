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

dojo.provide("apstrata.explorer.Survey")
dojo.provide("apstrata.explorer.SurveyEditor")
dojo.provide("apstrata.explorer.SurveyActions")
dojo.provide("apstrata.explorer.SurveyResults")

dojo.declare("apstrata.explorer.Survey",
[apstrata.horizon.HStackableList], 
{
	data: [
//		{label: "create", iconSrc: "../../apstrata/resources/images/pencil-icons/notepad.png"},
//		{label: "view results", iconSrc: "../../apstrata/resources/images/pencil-icons/statistic.png"},	
//		{label: "search", iconSrc: "../../apstrata/resources/images/pencil-icons/search.png"},	
	],
	
	storeName: "surveyStore",
	editable: true,
	
	refresh: function() {
		var self = this
		this.surveyCreator = "";
		
		if (connection.credentials.username && connection.credentials.username!="")
			this.surveyCreator =  connection.credentials.username;
		else if (connection.credentials.key && connection.credentials.key!="")
			this.surveyCreator =  connection.credentials.key;
		
		this.getContainer().client.call({
				action: "Query",
				request: {
					apsdb: {
						store: self.storeName,
						query: "apsdb.creator=\"" + self.surveyCreator+ "\" and isSurveyMetadata=\"true\"",
						queryFields: "surveyName"
					}
				},
				load: function(operation) {
					// Rearrange the result to suite the template

					self.data = []
					dojo.forEach(operation.response.result.documents, function(document) {
						self.data.push({label: document.surveyName, iconSrc: "", attrs:{documentKey: document.key}})
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
		this.openPanel(apstrata.explorer.SurveyEditor,{surveyID:null, editingMode:'true', storeName: self.storeName, usingCookie: 'false'})
	},
	
	postCreate: function() {
		this.refresh()
		this.inherited(arguments)
	},
	
	onClick: function(index, label, attrs) {
		var self = this
		this.openPanel(apstrata.explorer.SurveyActions, {surveyID: attrs.documentKey, storeName: self.storeName});
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

dojo.require("dijit.Declaration");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.SimpleTextarea");
dojo.require("surveyWidget.widgets.Survey");
dojo.require("apstrata.util.schema.Schema");


dojo.declare("apstrata.explorer.SurveyEditor", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.explorer", "templates/SurveyEditorPanel.html"),

	maximizePanel: true,
	
	constructor: function(attrs) {
		this.attrs = attrs
	},
	
	postCreate: function() {
		var survey = new surveyWidget.widgets.Survey({attrs : this.attrs})
		dojo.place(survey.domNode, this.dvSurvey, 'only')
		this.inherited(arguments)
	}
})

dojo.declare("apstrata.explorer.SurveyActions",
[apstrata.horizon.HStackableList], 
{
	data: [
		{label: "Clone", iconSrc: "../../apstrata/resources/images/pencil-icons/users.png"},
		{label: "Submit", iconSrc: "../../apstrata/resources/images/pencil-icons/right.png"},
		{label: "Results", iconSrc: "../../apstrata/resources/images/pencil-icons/statistic.png"}
	],
	
	constructor: function(attrs) {
		this.surveyID = attrs.surveyID
		this.storeName = attrs.storeName
	},
	
	onClick: function(index, label) {
		var self = this
		
		this.closePanel()
		
		switch (label)
		{
			case 'Clone':
				this.openPanel(apstrata.explorer.SurveyEditor,{surveyID:self.surveyID, editingMode:'true', storeName: self.storeName, usingCookie: 'false'})
			break;
			case 'Submit':
				this.openPanel(apstrata.explorer.SurveyEditor,{surveyID:self.surveyID, editingMode:'false', storeName: self.storeName, usingCookie: 'false'})
			break;
			case 'Results':
				this.openPanel(apstrata.explorer.SurveyResults, {surveyID:self.surveyID, storeName: self.storeName})
			break;
			default:
		}
	}
})

dojo.require("surveyWidget.widgets.SurveyCharting");

dojo.declare("apstrata.explorer.SurveyResults", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.explorer", "templates/SurveyResultsPanel.html"),
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
