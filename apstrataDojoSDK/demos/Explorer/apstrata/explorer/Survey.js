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
	
	surveyStore: "myStore",
	editable: true,
	
	refresh: function() {
		var self = this
		
		this.getContainer().client.call({
				action: "Query",
				request: {
					apsdb: {
						store: self.surveyStore,
						query: "apsdb.creator=\"" + connection.credentials.username+ "@wikidemo\" and isSurveyMetadata=\"true\"",
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
		this.openPanel(apstrata.explorer.SurveyEditor,{schema:null, editingMode:true})
	},
	
	postCreate: function() {
		this.refresh()
		this.inherited(arguments)
		
		
	},
	
	onClick: function(index, label, attrs) {
		this.openPanel(apstrata.explorer.SurveyActions, {schema: attrs.schema});
//		this.openPanel(apstrata.explorer.SurveyActions, {schema: '%7B%22title%22%3A%22Maher%27s%20Survey%22%2C%22description%22%3A%22Maher%27s%20Survey%20Description%22%2C%22viewResults%22%3Atrue%2C%22successMessage%22%3A%22%22%2C%22questions%22%3A%5B%7B%22title%22%3A%22How%20r%20u%3F%22%2C%22type%22%3A%22radio%20button%22%2C%22choices%22%3A%22good%2Cmaher%22%2C%22mandatory%22%3Afalse%2C%22name%22%3A%22MahersSurvey_1%22%2C%22defaultValue%22%3Anull%7D%2C%7B%22choices%22%3A%22%22%2C%22defaultValue%22%3A%22s_7744293024_MahersSu_CAEB07056D%22%2C%22mandatory%22%3Afalse%2C%22name%22%3A%22apsdbSchema%22%2C%22title%22%3A%22Apstrata%20Survey%20Schema%20Name%22%2C%22type%22%3A%22text%22%7D%2C%7B%22choices%22%3A%22%22%2C%22defaultValue%22%3A%22s_7744293024_MahersSu_CAEB07056D%22%2C%22mandatory%22%3Afalse%2C%22name%22%3A%22apsdbDockey%22%2C%22title%22%3A%22Apstrata%20Survey%20Dockey%22%2C%22type%22%3A%22text%22%7D%5D%7D'});
	}
})

dojo.require("dijit.Declaration");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.CheckBox");
dojo.require("surveyWidget.widgets.Survey");
dojo.require("apstrata.util.schema.Schema");
dojo.require("surveyWidget.widgets.config");


dojo.declare("apstrata.explorer.SurveyEditor", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.explorer", "templates/SurveyEditorPanel.html"),
	schema: null,
	//editingMode: true,

	maximizePanel: true,
	
	constructor: function(attrs) {
		schema = attrs.schema
		editingMode = attrs.editingMode
		usingCookie = false
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
		schema = attrs.schema
	},
	
	onClick: function(index, label) {
		var self = this
		
		this.closePanel()
		
		switch (label)
		{
			case 'Clone':
				this.openPanel(apstrata.explorer.SurveyEditor,{schema:schema, editingMode:true})
				break;
			case 'Submit':
				this.openPanel(apstrata.explorer.SurveyEditor, {schema:schema, editingMode:false})
				break;
			case 'Results':
				this.openPanel(apstrata.explorer.SurveyResults, {schema:schema})
				
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
	schema: null,
	maximizePanel: true,
	
	constructor: function(attrs) {
		schema = attrs.schema
	}
})
