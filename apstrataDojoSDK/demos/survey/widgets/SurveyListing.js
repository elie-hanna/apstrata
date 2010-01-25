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
		// Replace here with your target store name
		//
		//storeName: "surveyStore",
		
		/**
		 * Constructor of the SurveyListing widget.
		 * 
		 */
		constructor: function(attrs) {
			if (attrs) {

				if(typeof(attrs.storeName) != "undefined") 
					this.storeName = attrs.storeName
				else 
					this.storeName = storeName;

				if (attrs.schema) 
					this.schema = attrs.schema	
				else		
					this.schema = schema;	
			} else {
				this.schema = schema;
				this.storeName = storeName;
			}
			
			if(this.schema != null){
				this.jsonDataModel = decodeURIComponent(this.schema);
				this.dojoDataModel = dojo.fromJson(this.jsonDataModel);
				this.arrFieldsToDisplay = this.dojoDataModel.fields;
				this.arrTitleFieldsToDisplay = this.dojoDataModel.titleFields;
				this.apsdbSchema = this.dojoDataModel.apsdbSchema;
			}
		},
		
		/**
		 * Function called after the constructor, used to construct and display the SurveyListing widget.
		 * 
		 */
		postCreate: function(){
			if(this.schema != null){
				this.title.innerHTML = this.dojoDataModel.title;
				this.query();
				this.downloadCsvData();
			}
			else
				this.title.innerHTML = "The survey schema is missing";
		},
		
		/**
		 * Sends a query request to the store to get the data submitted to the current survey
		 * 
		 */
		query: function() {
			var client = new apstrata.Client({connection: connection});
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
			});
			
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
						/*for (var fid = 0; fid<arrSurvey[doc].fields.length; fid++) {
							if (columns[ncol] == arrSurvey[doc].fields[fid]["name"]) {
								found = true;
								break;
							}
						}
						*/
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
		 * Download the survey data in CSV format
		 * 
		 */
		downloadCsvData: function() {
			// Run a script
			var client = new apstrata.Client({connection: connection});
			var self = this;
			
			
			var runScriptletRequest = dojo.mixin({
				storeName: self.storeName,
				arrFields: self.arrFieldsToDisplay,
				arrTitleFields: self.arrTitleFieldsToDisplay,
				apsdbSchema: self.apsdbSchema,
				
			}, {
				apsdb: {
					scriptName: 'downloadCSV'
				}
			});
			var params = "&apsdb.scriptName=downloadCSV&storeName="+self.storeName+"&arrFields="+self.arrFieldsToDisplay+"&arrTitleFields="+ self.arrTitleFieldsToDisplay+"&apsdbSchema="+self.apsdbSchema;
			this.CSV.href=connection.signUrl("RunScript", params,"json").url;// serviceUrl+"/"+;
			/*var sd = client.call({
				action: "RunScriptlet",
				request: runScriptletRequest,
				load: function(operation) {
				},
				error: function(operation) {
					self.errorMessage.innerHTML = operation.response.metadata.errorDetail;
				}
			});*/
		}
	});

