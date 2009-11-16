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
						self.data.push({label: document.fields[0].values[0], iconSrc: "", attrs:{schema: document.fields[2].values[0]}})
					})
	
					// Cause the DTL to rerender with the fresh self.data
					self.render()
					//dojo.style(this.domNode,{width:'400px'})
				},
				error: function(operation) {
				}
			});
	},
	
	newItem: function() {
		var self = this
		this.openPanel(apstrata.explorer.SurveyEditor,{schema:null, editingMode:true, storeName: self.storeName, usingCookie: false})
	},
	
	postCreate: function() {
		this.refresh()
		this.inherited(arguments)
		dojo.publish("/apstrata/documentation/topic", [{
			topic: "Survey Code Snippet",
			id: "Survey"
		}])
		
	},
	
	onClick: function(index, label, attrs) {
		var self = this
		this.openPanel(apstrata.explorer.SurveyActions, {schema: attrs.schema, storeName: self.storeName});
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
dojo.require("surveyWidget.widgets.config");


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
		var survey = new surveyWidget.widgets.Survey(this.attrs)
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
			case 'Clone':
				this.openPanel(apstrata.explorer.SurveyEditor,{schema:self.schema, editingMode:true, storeName: self.storeName, usingCookie: false})
			break;
			case 'Submit':
				this.openPanel(apstrata.explorer.SurveyEditor,{schema:self.schema, editingMode:false, storeName: self.storeName, usingCookie: false})
			break;
			case 'Results':
				this.openPanel(apstrata.explorer.SurveyResults, {schema:self.schema, storeName: self.storeName})
				
				dojo.publish("/apstrata/documentation/topic", [{
					topic: "Survey Code Snippet",
					id: "Survey"
				}])
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
		var surveyResults = new surveyWidget.widgets.SurveyCharting(this.attrs)
		dojo.place(surveyResults.domNode, this.dvSurveyResults, 'only')
		this.inherited(arguments)
	}
})
