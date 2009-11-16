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

dojo.provide("surveyWidget.widgets.SurveysList");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.LayoutContainer");
	
dojo.declare("surveyWidget.widgets.SurveyObj",
	[dijit._Widget, dijit._Templated],
	{
		templateString: "<div><a title='' dojoAttachPoint='surveyObject' dojoAttachEvent='onclick: cloneSurvey'>${surveyName}</a></div>",
		
		surveyName: "",
		surveyId: "",
		
		constructor: function(attrs) {
			this.surveyName = attrs.nameParam;
			this.surveyId = attrs.idParam;
		},
		
		postCreate: function(){
			this.inherited(arguments);
		},
		
		cloneSurvey: function() {
			
			var editingMode = true;
			//var surveyToClone = new surveyWidget.widgets.Survey();
			//dojo._destroyElement(this.surveysList);
			//this.surveyEdit.addChild(surveyToClone);
		}
	});

dojo.declare("surveyWidget.widgets.SurveysList",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("surveyWidget.widgets", "templates/SurveysList.html"),
		username: null,
		key: null,
		
		storeName: "surveyStore",
		
		constructor: function() {
			if(connection.credentials.username != null && connection.credentials.username != ""){
				this.username = connection.credentials.username;
				this.key = connection.credentials.key;
			}
		},
		
		postCreate: function(){
			if(this.username != null){
				//this.title.innerHTML = this.dojoDataModel.title;
				this.query();
			}
			else
				this.title.innerHTML = "No user is logged in";
		},
		
		query: function() {

			var client = new apstrata.Client({connection: connection});
			var listing = this;

			var q = client.call({
				action: "Query",
				request: {
					apsdb: {
						store: listing.storeName,
						query: "apsdb.creator=\"" + listing.username+ "\" and isSurveyMetadata=\"true\"",
						queryFields: "surveyName,surveySchema,apsdb.documentKey"
					}
				},
				load: function(operation) {
					listing.display(operation.response);
				},
				error: function(operation) {
					//fail(operation)
				}
			});
			
		},
		
		display: function(data) {
			
			var newField = null;
			var arrSurvey = data.result.documents;
			
			for (var doc = 0; doc < arrSurvey.length; doc++) {
				//newField += "<div><a title=\"Powered by apstrata\" href=# onClick=\"javascript:cloneSurvey('"+arrSurvey[doc].fields[2].values[0]+"')\">"+arrSurvey[doc].fields[0].values[0]+" </a></div>";
				newField = new surveyWidget.widgets.SurveyObj({
					nameParam: arrSurvey[doc].fields[0].values[0],
					idParam: arrSurvey[doc].fields[2].values[0]
				});
				this.surveys.addChild(newField);
			}
		}
	});
