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

dojo.provide("surveyWidget.widgets.SurveyListing");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.LayoutContainer");

dojo.declare("surveyWidget.widgets.SurveyListing",
	[dijit._Widget, dijit._Templated],
	{
		templatePath: dojo.moduleUrl("surveyWidget.widgets", "templates/SurveyListing.html"),
		jsonDataModel: {},
		arrFieldsToDisplay: null,
		arrTitleFieldsToDisplay: null,
		arrData: null,
		resultResponse: null,
		dojoDataModel: null,
		apsdbSchema: null,

		//
		// Replace here with your apsdb account
		//  and target store name
		//
		apsdbKey: "apstrata",
		apsdbSecret: "secret",
		apsdbServiceUrl: "http://localhost:8080/autoforms/rest", //"http://apsdb.apstrata.com/apsdb/rest",
		storeName: "myStore",
		
		constructor: function() {
			if(schema != null){
				this.jsonDataModel = decodeURIComponent(schema);
				this.dojoDataModel = dojo.fromJson(this.jsonDataModel);
				this.arrFieldsToDisplay = this.dojoDataModel.fields;
				this.arrTitleFieldsToDisplay = this.dojoDataModel.titleFields;
				this.apsdbSchema = this.dojoDataModel.apsdbSchema;
			}
		},
		
		postCreate: function(){
			if(schema != null){
				this.title.innerHTML = this.dojoDataModel.title;
				this.query();
			}
			else
				this.title.innerHTML = "The survey schema is missing";
		},
		
		query: function() {

			var client = new apstrata.Client({connection: connection});
			var listing = this;

			var queryRequest = {
				apsdb: {
					store: listing.storeName,
					query: "apsdb.objectName=\"" + listing.apsdbSchema + "\"",
					queryFields: listing.arrFieldsToDisplay
				}
			};

			var q = client.call({
				action: "Query",
				request: queryRequest,
				load: function(operation) {
					listing.resultResponse = operation.response;
					listing.display(listing.resultResponse,listing.arrFieldsToDisplay, listing.arrTitleFieldsToDisplay);
				},
				error: function(operation) {
					//fail(operation)
				}
			});
			
		},
		
		display: function(data, columns, columnsTitle) {
			var found = false;
			var columnClass = 'rounded';
			var bottomCornerClass = '';

			// Add the header row
			var headerTHead = document.createElement('THEAD');
			var headerRow = document.createElement('TR');
			headerTHead.appendChild(headerRow);
			for(var col=0; col<columnsTitle.length; col++) {
				if (col == 0)
					columnClass = "rounded-first";
				else if (col == columnsTitle.length-1)
					columnClass = "rounded-last";
				else
					columnClass = "rounded";

				var headerCell = document.createElement('TH');
				headerCell.setAttribute('scope', 'col');
				headerCell.className = columnClass;
				headerCell.innerHTML = columnsTitle[col];
				headerRow.appendChild(headerCell);
			}
			this.displayTable.appendChild(headerTHead);

			// Add the survey rows
			var arrSurvey = data.result.documents;
			var rowCount = 1;
			for (var doc=0; doc<arrSurvey.length; doc++) {
				if (arrSurvey[doc].fields) {
					var tableRow = this.displayTable.insertRow(rowCount++);
					var cellCount = 0;
					for (var ncol=0; ncol<columns.length; ncol++) {
						found = false;
						for (var fid = 0; fid<arrSurvey[doc].fields.length; fid++) {
							if (columns[ncol] == arrSurvey[doc].fields[fid]["@name"]) {
								found = true;
								break;
							}
						}

						if (doc == arrSurvey.length-1 && ncol == 0)
							bottomCornerClass = 'rounded-foot-left';
						else if (doc == arrSurvey.length-1 && ncol == columns.length-1)
							bottomCornerClass = 'rounded-foot-right';
						else
							bottomCornerClass = '';

						if (found == true) {
							var tableCell = tableRow.insertCell(cellCount++);
							tableCell.className = bottomCornerClass;

							for (var ival=0; ival<arrSurvey[doc].fields[fid].values.length; ival++) {
								tableCell.innerHTML = arrSurvey[doc].fields[fid].values[ival];

								if (ival < arrSurvey[doc].fields[fid].values.length-1)
									tableCell.innerHTML += ',';
							}
						} else {
							var tableCell = tableRow.insertCell(cellCount++);
							tableCell.className = bottomCornerClass;
						}
					}
				}
			}
		}
	});

