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
						query: "apsdb.creator=\"" + connection.credentials.username + "@" + connection.credentials.key + "\" and isSurveyMetadata=\"true\"",
						queryFields: "surveyName,apsdb.documentKey"
					}
				},
				load: function(operation) {
					// Rearrange the result to suite the template
					self.data = []
					dojo.forEach(operation.response.result.documents, function(document) {
						self.data.push({label: document.fields[0].values[0], iconSrc: "", id: document.fields[1].values[0]})
					})
		
					// Cause the DTL to rerender with the fresh self.data
					self.render()
				},
				error: function(operation) {
				}
			});
	},
	
	newItem: function() {
		this.openPanel(apstrata.explorer.SurveyEditor)
	},
	
	postCreate: function() {
		this.refresh()
		this.inherited(arguments)
	},
	
	onClick: function(index, label) {
	}
})

dojo.require("surveyWidget.widgets.myWidget")

dojo.require("dijit.Declaration");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.CheckBox");
dojo.require("surveyWidget.widgets.Survey");
dojo.require("apstrata.util.schema.Schema")

var schema = null
var editingMode = true

dojo.declare("apstrata.explorer.SurveyEditor", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.explorer", "templates/SurveyEditorPanel.html"),

	maximizePanel: true,
	
	constructor: function() {
		new apstrata.util.schema.Schema()
		
	}
	
//	postCreate: function() {
//	<div dojoType="surveyWidget.widgets.myWidget"></div>

//		var w = new surveyWidget.widgets.myWidget()

		
//	}
	
})
