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
		
		/**
		 * Constructor of the SurveyObj widget.
		 * 
		 * @param attrs
		 * 		JSON object containing some info about the survey: 
		 * 			nameParam: Title of the survey
		 * 			idParam: documentKey of the metadata document representing the survey 
		 */
		constructor: function(attrs) {
			this.surveyName = attrs.nameParam;
			this.surveyId = attrs.idParam;
		},
		
		/**
		 * Function called after the constructor, used to construct and display the SurveyObj widget.
		 * 
		 */
		postCreate: function(){
			this.inherited(arguments);
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
		
		/**
		 * Constructor of the SurveysList widget.
		 * 
		 */
		constructor: function() {
			if(connection.credentials.username != null && connection.credentials.username != ""){
				this.username = connection.credentials.username;
				this.key = connection.credentials.key;
			}
		},
		
		/**
		 * Function called after the constructor, used to construct and display the SurveysList widget.
		 * 
		 */
		postCreate: function(){
			if(this.username != null){
				this.query();
			}
			else
				this.title.innerHTML = "No user is logged in";
		},
		
		/**
		 * Sends a query request to the store to get the survey's name, schema and documentKey of all the surveys created by the current user
		 * 
		 */
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
				}
			});
			
		},
		
		/**
		 * Displays the list of surveys created by the current user
		 * 
		 */
		display: function(data) {
			
			var newField = null;
			var arrSurvey = data.result.documents;
			
			for (var doc = 0; doc < arrSurvey.length; doc++) {
				newField = new surveyWidget.widgets.SurveyObj({
					nameParam: arrSurvey[doc].surveyName,
					idParam: arrSurvey[doc].key
				});
				this.surveys.addChild(newField);
			}
		}
	});
