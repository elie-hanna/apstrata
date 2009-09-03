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

dojo.provide("surveyWidget.widgets.SurveyCharting");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.LayoutContainer");
//dojo.require("apstrata.dojo.client.apsdb.Connection");

dojo.declare("surveyWidget.widgets.SurveyCharting",
	[dijit._Widget, dijit._Templated],
	{
		templatePath: dojo.moduleUrl("surveyWidget.widgets", "templates/SurveyCharting.html"),
		jsonDataModel: {},
		dojoDataModel: null,
		questions: null,
		resultResponse: null,
		apstrataSurveyID: '',

		//
		// Replace here with your apsdb account
		//  and target store name
		//
		apsdbKey: "7744293024",
		apsdbSecret: "3B45DE19C689EDAFCA47",
		apsdbServiceUrl: "http://apsdb.apstrata.com/apsdb/rest",
		storeName: "myStore",
		
		constructor: function() {
			if(chartingSchema != null){
				this.jsonDataModel = chartingSchema;
				this.dojoDataModel = dojo.fromJson(this.jsonDataModel);
				this.questions = this.dojoDataModel.questions;

				// Look for and set the apstrata survey identifier
				var self = this;
				dojo.forEach(this.questions, function(fieldDataModel) {
					if (fieldDataModel.name == 'apstrataSurveyID') {
						self.apstrataSurveyID = fieldDataModel.defaultValue;
					}
				});

				if (this.apstrataSurveyID == null) {
					// TODO: Throw an error because we use the survey ID to query for the results of the widget
				}
			}
		},

		postCreate: function(){
			if(chartingSchema != null){
				this.title.innerHTML = this.dojoDataModel.title;
				this.query();
			}
			else
				this.title.innerHTML = "The survey charting schema is missing";
		},

		query: function() {
			var client = new apstrata.apsdb.client.Client();
			var charting = this;

			// Query to get the total number of surveys taken
			var surveysTakenCountQuery = client.query(
					function() {
						var surveysTakenCount = surveysTakenCountQuery.result.count;
						var fieldResponses = new Array();

						// Now we can query each field in the survey and aggregate the results
						for (var i=0; i<charting.questions.length; i++) {
							var fieldDataModel = charting.questions[i];//alert(fieldDataModel.name + '||' + fieldDataModel.type);
							if (   fieldDataModel.name != 'apstrataSurveyID'
									&& fieldDataModel.type != 'text') {
								fieldResponses[i] = new Array();
								if (fieldDataModel.type != 'checkbox') { // Handles these types of fields: list, radio button, multiple choice
									var choices = fieldDataModel.choices.split(',');
									for (var j=0; j<choices.length; j++) {
										// call a query to count using the fieldName = this choice
										// surveysTakenCount - [this count] is the number of people who did not check this box
										charting.queryAndSetFieldAggregate(fieldDataModel.name, choices[j], fieldResponses[i][j]);
									}
								} else { // Handles this type of field: checkbox
								  // call a query to count using the fieldName = 'checked'
									// surveysTakenCount - [this count] is the number of people who did not check this box
									charting.queryAndSetFieldAggregate(fieldDataModel.name, 'checked', fieldResponses[i][j]);
								}
							}
						}

						/*dojo.forEach(charting.questions, function(fieldDataModel) {
								if (   fieldDataModel.name != 'apstrataSurveyID'
								    && fieldDataModel.type != 'text') {
									charting.queryField();

									q[i] = client.query (
										function() {
											charting.resultResponse = q[i];
											// TODO: display
											// charting.display(charting.resultResponse, charting.arrFieldsToDisplay, charting.arrTitleFieldsToDisplay);
										}, function() {
											//fail(operation)
										},
										{
											store: charting.storeName,
											query: "apstrataSurveyID=\"" + charting.apstrataSurveyID + "\"",
											queryFields: charting.arrFieldsToDisplay,
											aggregates: 
										})
								}
							});*/
					}, function() {
						//fail(operation)
					},
					{
						store: charting.storeName,
						query: "apstrataSurveyID=\"" + charting.apstrataSurveyID + "\"",
						queryFields: 'apstrataSurveyID',
						count: true
					}
				)
		},

		/**
		 * Queries apstrata database for the count of fields that have the passed field name and value
		 */
		queryAndSetFieldAggregate: function (fieldName, fieldValue, callbackResult) {
			var client = new apstrata.apsdb.client.Client();
			var charting = this;

			callbackResult = client.query (
				function() {
					var valueCount = callbackResult.result.count;
					// TODO: display
					// charting.display(charting.resultResponse, charting.arrFieldsToDisplay, charting.arrTitleFieldsToDisplay);
					alert(fieldName + '/' + fieldValue + ': ' + valueCount);
				}, function() {
					//fail(operation)
				},
				{
					store: charting.storeName,
					query: "apstrataSurveyID=\"" + charting.apstrataSurveyID + "\" AND " + fieldName + "=\"" + fieldValue + "\"",
					queryFields: "apstrataSurveyID",
					count: true
				})
		},

		display: function(data, columns, columnsTitle) {

			var found = false;
			var columnClass="rounded";
			var bottomCornerClass = "";
			var strData = "";
			var heading = "";
			
			heading = "<thead><tr>";
			for(var col = 0; col < columnsTitle.length; col++){
				if(col == 0)
					columnClass = "rounded-first";
				else if(col == columnsTitle.length-1)
					columnClass = "rounded-last";
				else
					columnClass = "rounded";
				
				heading = heading + '<th scope="col" class="'+ columnClass +'" >' + columnsTitle[col] + '</th>';
			}
			heading = heading + "</tr></thead>";

			strData = "<tbody>";

			var arrSurvey = data.result.documents;
 
			for(var doc = 0; doc < arrSurvey.length; doc++){
				if(arrSurvey[doc].fields){
				strData= strData + "<tr>";
				for(var ncol = 0; ncol < columns.length; ncol++){
					found = false;
					for(var fid = 0; fid < arrSurvey[doc].fields.length; fid++){
						if(columns[ncol] == arrSurvey[doc].fields[fid].@name){
							found = true;
							break;
						}
					}
				
					if(doc == arrSurvey.length-1 && ncol == 0)
						bottomCornerClass = ' class="rounded-foot-left"';
					else if(doc == arrSurvey.length-1 && ncol == columns.length-1)
						bottomCornerClass = ' class="rounded-foot-right"';
					else
						bottomCornerClass = "";

					if(found == true){
						strData= strData + '<td'+ bottomCornerClass +'>';
						for(var ival = 0; ival < arrSurvey[doc].fields[fid].values.length; ival++){
							strData= strData + arrSurvey[doc].fields[fid].values[ival];
							if(ival < arrSurvey[doc].fields[fid].values.length-1)
								strData= strData + ',';
						}
						strData= strData + '</td>';
					} else
						strData= strData + '<td'+ bottomCornerClass +'></td>';
				}
				strData= strData + "</tr>";
				}
			}

			strData = strData + "<tbody>";
			
			this.displayTable.innerHTML = heading + strData;
			
		}	
		
	});

