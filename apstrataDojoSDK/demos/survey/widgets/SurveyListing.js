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
dojo.require('apstrata.ItemApsdbReadStore');
dojo.require('apstrata.widgets.QueryWidget');

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
		
		/**
		 * 		attrs is a JSON object containing some info about the survey's list: 
		 * 			storeName: the store used by the SurveyCharting widget
		 * 			schema: Contains the schema of the current survey  
		 */
		attrs: {},
		
		/**
		 * Constructor of the SurveyListing widget.
		 * 
		 */
		constructor: function() {
		},
		
		/**
		 * Function called by the constructor, used to set properties that are referenced in the widget
		 */
		postMixInProperties: function() {
			
			if(this.attrs.storeName) 
				this.storeName = this.attrs.storeName
				
			if(this.attrs.surveyID)
				this.surveyID = this.attrs.surveyID;
		},
		
		/**
		 * Function called after the constructor, used to construct and display the SurveyListing widget.
		 * 
		 */
		postCreate: function(){
			
			var self = this;
			var client = new apstrata.Client({connection: connection});
			
			if (this.surveyID != null) { // Verify that the document key is not null
				var queryRequest = {
					apsdb: {
						store: this.storeName,
						query: "apsdb.documentKey=\"" + this.surveyID + "\"",
						queryFields: "listResultSchema"
					}};
	
				var q = client.call({
					action: "Query",
					request: queryRequest,
					load: function(operation) { // on success, set the survey schema and construct the table of data
						if (operation.response.result.documents.length > 0) {
							if(operation.response.result.documents[0]["listResultSchema"] != undefined){
								self.schema = operation.response.result.documents[0]["listResultSchema"];
								self.jsonDataModel = decodeURIComponent(self.schema);
								self.dojoDataModel = dojo.fromJson(self.jsonDataModel);
								self.arrFieldsToDisplay = self.dojoDataModel.fields;
								self.arrTitleFieldsToDisplay = self.dojoDataModel.titleFields;
								self.apsdbSchema = self.dojoDataModel.apsdbSchema;
								self.title.innerHTML = self.dojoDataModel.title;
								self.query();
								self.downloadCsvData();
							} else // if no schema was found in the metadata document then display a message
								self.title.innerHTML = "The survey's data are not available";
						} else // if no metadata document corresponds to the survey ID then display a message
							self.title.innerHTML = "The survey's data are not available";
					},
					error: function(operation) {  //on error, display a message
						self.title.innerHTML = "The survey's data are not available";
					}
				});
			} else // if no survey key is specified then display a message
				this.title.innerHTML = "The survey's data are not available";
		},
		
		/**
		 * Sends a query request to the store to get the data submitted to the current survey
		 * 
		 */
		query: function() {
			
			var client = new apstrata.Client({connection: connection});
			var self = this;
			var layout = []	
			
			var strArrFieldsToDisplay = '';
			for (var i = 0; i < self.arrFieldsToDisplay.length; i++) {
				strArrFieldsToDisplay += self.arrFieldsToDisplay[i] + ',';
				layout.push({ field: self.arrFieldsToDisplay[i], name: self.arrTitleFieldsToDisplay[i], width: 'auto' })
			}
			strArrFieldsToDisplay = strArrFieldsToDisplay.substring(0, strArrFieldsToDisplay.length - 1);
			
			var store = new apstrata.ItemApsdbReadStore({
					client: client,
					resultsPerPage: 10,
					apsdbStoreName: self.storeName,
					fields: strArrFieldsToDisplay,
					label: "name"
				})
				
			var attrs = {
				store: store,
				query: "apsdb.objectName=\"" + self.apsdbSchema + "\"",
				columns: strArrFieldsToDisplay,
				layout: layout,
				page: 1
			}
			
			this.grid = new apstrata.widgets.QueryWidget(attrs);
			dojo.place(this.grid.domNode, this.dvGrid, "first")		
			
			
			/*
			
			var listing = this;
			var strArrFieldsToDisplay = '';
			for(var i=0; i<listing.arrFieldsToDisplay.length; i++)
				strArrFieldsToDisplay += listing.arrFieldsToDisplay[i] + ',';
			strArrFieldsToDisplay = strArrFieldsToDisplay.substring(0, strArrFieldsToDisplay.length - 1);

			var queryRequest = {
				apsdb: {
					store: listing.storeName,
					query: "apsdb.objectName=\"" + listing.apsdbSchema + "\"",
					queryFields: strArrFieldsToDisplay
				}
			};

			var q = client.call({
				action: "Query",
				request: queryRequest,
				load: function(operation) { // on success call the display function to display the results in a table
					listing.resultResponse = operation.response;
					listing.display(listing.resultResponse,listing.arrFieldsToDisplay, listing.arrTitleFieldsToDisplay);
				},
				error: function(operation) {
				}
			});*/
			
		},
		
		/**
		 * Displays all the data submitted to the current survey in a table
		 * 
		 * @param data
		 * 		JSON object containing all the documents belonging to the current survey
		 * 
		 * @param columns
		 * 		 Array containing the name of the fields to display
		 *  
		 * @param columnsTitle
		 * 		 Array containing the column's title to use when displaying the table
		 */
		display: function(data, columns, columnsTitle) {
			var found = false;
			var columnClass = 'rounded';
			var bottomCornerClass = '';
			var cellValue = "";

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
					columnClass = "";

				var headerCell = document.createElement('TH');
				headerCell.setAttribute('scope', 'col');
				headerCell.className = columnClass;
				headerCell.innerHTML = columnsTitle[col];
				headerRow.appendChild(headerCell);
			}
			this.displayTable.appendChild(headerTHead);

			// Add the document rows
			var arrSurvey = data.result.documents;
			var rowCount = 1;
			for (var doc=0; doc<arrSurvey.length; doc++) {
					var tableRow = this.displayTable.insertRow(rowCount++);
					var cellCount = 0;
					for (var ncol=0; ncol<columns.length; ncol++) {
						found = false;
						if(arrSurvey[doc][columns[ncol]])
						{
							found = true;
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

							if(arrSurvey[doc][columns[ncol]] instanceof Array)
							{
								cellValue = "";
								for (var ival=0; ival<arrSurvey[doc][columns[ncol]].length; ival++) {
									cellValue += arrSurvey[doc][columns[ncol]][ival];
	
									if (ival < arrSurvey[doc][columns[ncol]].length-1)
										cellValue += ',';
								}
								tableCell.innerHTML = cellValue;
							}
							else{
								tableCell.innerHTML = arrSurvey[doc][columns[ncol]];
							}

							
						} else {
							var tableCell = tableRow.insertCell(cellCount++);
							tableCell.className = bottomCornerClass;
						}
					}
			}
		},
		
		/**
		 * Construct and add a link to download the survey data in CSV format
		 * 
		 */
		downloadCsvData: function() {
			var params = "&apsdb.scriptName=downloadCSV&storeName="+this.storeName+"&arrFields="+this.arrFieldsToDisplay+"&arrTitleFields="+ this.arrTitleFieldsToDisplay+"&apsdbSchema="+this.apsdbSchema;
			this.CSV.href=connection.signUrl("RunScript", params,"json").url;
		}
	});

