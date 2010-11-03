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
dojo.require("dojox.charting.Chart2D");
dojo.require("dojox.charting.themes.PlotKit.red");
dojo.require("dojox.charting.action2d.Highlight");
dojo.require("dojox.charting.action2d.Tooltip");
dojo.require("dojo.fx.easing");

dojo.declare("surveyWidget.widgets.SurveyCharting",
	[dijit._Widget, dijit._Templated],
	{
		templatePath: dojo.moduleUrl("surveyWidget.widgets", "templates/SurveyCharting.html"),
		jsonDataModel: {},
		dojoDataModel: null,
		questions: null,
		resultResponse: null,
		apsdbSchema: '',
		surveysTakenCount: 0,
		isNewLine: true,
		/**
		 * 		attrs is a JSON object containing some info about the survey's charts: 
		 * 			storeName: the store used by the SurveyCharting widget
		 * 			schema: Contains the schema of the current survey  
		 */
		attrs: {},
		
		/**
		 * Constructor of the SurveyCharting widget.
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
		 * After creation of this widget: Set the title and call the query
		 */
		postCreate: function() {
			
			var self = this;
			var client = new apstrata.Client({connection: connection});
			
			if (this.surveyID != null) { // Verify that the document key is not null
				var queryRequest = {
					apsdb: {
						store: this.storeName,
						query: "apsdb.documentKey=\"" + this.surveyID + "\"",
						queryFields: "surveySchema"
					}};
	
				var q = client.call({
					action: "Query",
					request: queryRequest,
					load: function(operation) { // on success, set the survey schema and construct the survey
						if (operation.response.result.documents.length > 0) {
							if(operation.response.result.documents[0]["surveySchema"] != undefined){
								self.schema = operation.response.result.documents[0]["surveySchema"];
								self.jsonDataModel = decodeURIComponent(self.schema);
								self.dojoDataModel = dojo.fromJson(self.jsonDataModel);
								self.questions = self.dojoDataModel.questions;
								self.apsdbSchema = self.surveyID; // Look for and set the apstrata survey identifier
								self.title.innerHTML = self.dojoDataModel.title;
								self.query();
							} else // if no schema was found in the metadata document then display a message
								self.title.innerHTML = "The survey's charts are not available";
						} else // if no metadata document corresponds to the survey ID then display a message
							self.title.innerHTML = "The survey's charts are not available";
					},
					error: function(operation) {  //on error, display a message
						self.title.innerHTML = "The survey's charts are not available";
					}
				});
			} else // if no survey key is specified then display a message
				this.title.innerHTML = "The survey's charts are not available";
			
			this.domNode.title = ' ';
		},

		/**
		 * This is the main worker method of this widget:
		 * 1- Queries apstrata database to count the number of survey takers
		 * 2- Queries apstrata database for the count of answers that have been made per field
		 * 3- Generates and displays the charts representing the collected data
		 */
		query: function() {
			var client = new apstrata.Client({connection: connection});
			var charting = this;
			var fieldValueCounts = new Array(); // Holds the counts of every value of every field
			var fieldValueTotalCounts = new Array(); // Holds the total count of answers of every value of every field

			var queryRequest = {
				apsdb: {
					store: charting.storeName,
					query: "apsdb.schema=\"" + charting.apsdbSchema + "\"",
					count: true
				}
			};

			// Query to get the total number of surveys taken
			var surveysTakenCountQuery = client.call({
				action: "Query",
				request: queryRequest,
				load: function(operation) {
					charting.surveysTakenCount = operation.response.result.count;
					charting.totalSubmissions.innerHTML = 'Total submissions: ' + charting.surveysTakenCount;
					if (charting.surveysTakenCount < 1) // Do not proceed with the calculations if no surveys have been submitted
						return;

					var fieldResponses = new Array();

					// Now we can query each field in the survey and aggregate the results
					for (var i=0; i<charting.questions.length; i++) {
						var fieldDataModel = charting.questions[i];
						if (   fieldDataModel.name != 'apsdbSchema'
								&& fieldDataModel.type != 'text') {
							fieldResponses[i] = new Array();

							// Handle each field type separately
							switch (fieldDataModel.type) {
								case 'multiple choice':
									// Count and display the number of people who checked each of these checkboxes
									var choices = fieldDataModel.choices.split(',');
									fieldValueCounts[i] = new Array(choices.length);
									for (var j=0; j<choices.length; j++) {
										fieldValueCounts[i][fieldDataModel.name + '_' + choices[j]] = null;
										fieldValueTotalCounts[fieldDataModel.name] = 0;
										charting.queryAndDisplayDelayedTypes(fieldDataModel.name, choices[j], fieldResponses[i][j], fieldValueCounts[i], fieldValueTotalCounts);
									}
									break;
								case 'radio button':
									// Count and display the number of people who checked this radio button
									var choices = fieldDataModel.choices.split(',');
									fieldValueCounts[i] = new Array(choices.length);
									for (var j=0; j<choices.length; j++) {
										fieldValueCounts[i][fieldDataModel.name + '_' + choices[j]] = null;
										fieldValueTotalCounts[fieldDataModel.name] = 0;
										charting.queryAndDisplayDelayedTypes(fieldDataModel.name, choices[j], fieldResponses[i][j], fieldValueCounts[i], fieldValueTotalCounts);
									}
									break;
								case 'checkbox':
									// Count and display the number of people who checked this checkbox
									fieldValueCounts[i] = new Array();
									fieldValueCounts[i][fieldDataModel.name + '_checked'] = 0;
									fieldValueTotalCounts[fieldDataModel.name] = 0;
									charting.queryAndDisplayCheckbox(fieldDataModel.name, 'checked', fieldResponses[i][0], fieldValueCounts[i], fieldValueTotalCounts);
									break;
								case 'list':
									// Count and display the number of people chose each of these list items
									var choices = fieldDataModel.choices.split(',');
									fieldValueCounts[i] = new Array(choices.length);
									for (var j=0; j<choices.length; j++) {
										fieldValueCounts[i][fieldDataModel.name + '_' + choices[j]] = null;
										fieldValueTotalCounts[fieldDataModel.name] = 0;
										charting.queryAndDisplayDelayedTypes(fieldDataModel.name, choices[j], fieldResponses[i][j], fieldValueCounts[i], fieldValueTotalCounts);
									}
									break;
							}
						}
					}
				},
				error: function(operation) {
					//fail(operation)
				}
			});
		},

		/**
		 * Queries apstrata database for the count of fields that have the passed field name and value.
		 * Call a query to count the survey takers using the ([fieldName] = [the passed value]) value for the query expression.
		 * The (surveysTakenCount - [this count]) is the number of people who did not check this checkbox.
		 *
		 * @param fieldName The name of the field to use in the query expression
		 * @param fieldValue The value of the field to use in the query expression
		 * @param callbackResult The callback result container, it is only used to differentiate the callback of every XHR when it returns
		 * @param fieldValueCounts The array location to store the field value counts
		 * @param fieldValueTotalCounts The array containing the total field value counts for each question
		 */
		queryAndDisplayCheckbox: function (fieldName, fieldValue, callbackResult, fieldValueCounts, fieldValueTotalCounts) {
			var client = new apstrata.Client({connection: connection});
			var charting = this;

			var queryRequest = {
				apsdb: {
					store: charting.storeName,
					query: "apsdb.schema=\"" + charting.apsdbSchema + "\" AND " + fieldName + "=\"" + this.clean(fieldValue) + "\"",
					count: true
				}
			};

			callbackResult = client.call({
				action: "Query",
				request: queryRequest,
				load: function(operation) {
					var countPeopleWhoAnsweredThisQuestion = operation.response.result.count;
					var valueCount = operation.response.result.count;
					fieldValueCounts[fieldName + '_' + fieldValue] = valueCount; // Save the returned value count
					fieldValueTotalCounts[fieldName] = valueCount * 1;

					var chartLine = charting.displayTable.lastChild; // Get the last DIV in the display table
					var chartCell = null;
					// Create a new line if: (1) We couldn't find one, (2) We found a default text node, (3) The caller is asking for a new line
					if (chartLine == null || chartLine.nodeType == 3 || charting.isNewLine) {
						chartLine = document.createElement('DIV');
						chartCell = document.createElement('DIV');
						chartLine.className = 'surveyChartLineSize';
						chartLine.appendChild(chartCell);
						charting.floatElement(chartCell, 'left');

						charting.displayTable.appendChild(chartLine); // Add the new line with the new cell to the display table
					} else {
						var chartCell = document.createElement('DIV');
						charting.floatElement(chartCell, 'left');

						chartLine.appendChild(chartCell); // Just add the new cell to the existing line
					}

					// 1- Add the chart title to the chart cell
					var chartTitle = document.createElement('DIV');
					chartTitle.style.width = '320px';
					chartTitle.style.paddingLeft = '10px';
					chartTitle.style.paddingBottom = '5px';
					var fieldTitle = charting.getTitleOf(fieldName);
					chartTitle.className = 'questionTitle';
					chartTitle.innerHTML = fieldTitle;
					chartCell.appendChild(chartTitle);

					// 2- Add the chart placeholder in the chart cell
					var chartDIV = document.createElement('DIV');
					chartDIV.setAttribute('id', fieldName + '_' + fieldValue);
					chartDIV.className = 'surveyChartSize';
					chartCell.appendChild(chartDIV);

					// 3- Add the count of the people who answered this question to the chart cell
					var chartPeopleWhoAnsweredThisQuestion = document.createElement('DIV');
					chartPeopleWhoAnsweredThisQuestion.style.width = '320px';
					chartPeopleWhoAnsweredThisQuestion.style.paddingLeft = '10px';
					chartPeopleWhoAnsweredThisQuestion.style.paddingTop = '5px';
					pctOfPeopleWhoAnsweredThisQuestion = (countPeopleWhoAnsweredThisQuestion / charting.surveysTakenCount) * 100 + '';
					if (pctOfPeopleWhoAnsweredThisQuestion.lastIndexOf('.') > 1)
						try {
							pctOfPeopleWhoAnsweredThisQuestion = pctOfPeopleWhoAnsweredThisQuestion.substring(0, pctOfPeopleWhoAnsweredThisQuestion.lastIndexOf('.') + 3);
						} catch (err) {}
					chartPeopleWhoAnsweredThisQuestion.innerHTML = 'People who answered this question: <span class="emphasizeNumber">' + countPeopleWhoAnsweredThisQuestion + ' (' + pctOfPeopleWhoAnsweredThisQuestion + '%)</span>';
					chartCell.appendChild(chartPeopleWhoAnsweredThisQuestion);

					// 4- Create and render the chart
					var chart = new dojox.charting.Chart2D(fieldName + '_' + fieldValue);
/*					//TODO: Replace this code with the code below it in order to get pie charts instead of horizontal bar graphs
					chart.setTheme(dojox.charting.themes.PlotKit.red);
					chart.addPlot('default', {
						type: 'Pie',
						font: 'normal normal bold 8pt Tahoma',
						fontColor: 'white',
						labelOffset: 40
					});
					var inverseCount = charting.surveysTakenCount - valueCount;
					chart.addSeries('Series A', [
						{y: valueCount, text: valueCount + ' Yes', color: 'blue'},
						{y: inverseCount, text: inverseCount + ' No', color: 'red'}
					]);*/
					chart.addAxis("x", {
						majorLabels: false,
						includeZero: true, 
						minorTicks: false, 
						microTicks: false, 
						majorTick: { length: 0 }
					});

					// Calculate the percentage of people who answered 'Yes' and 'No' to this question
					var inverseCount = charting.surveysTakenCount - valueCount;
					var percentageOfYesAnswers = ((valueCount / charting.surveysTakenCount) * 100 ) + '';
					var percentageOfNoAnswers = ((inverseCount / charting.surveysTakenCount) * 100 ) + '';
					if (percentageOfYesAnswers.lastIndexOf('.') > 1)
						try {
							percentageOfYesAnswers = percentageOfYesAnswers.substring(0, percentageOfYesAnswers.lastIndexOf('.') + 3);
						} catch (err) {}
					if (percentageOfNoAnswers.lastIndexOf('.') > 1)
						try {
							percentageOfNoAnswers = percentageOfNoAnswers.substring(0, percentageOfNoAnswers.lastIndexOf('.') + 3);
						} catch (err) {}
					var chartlabel = fieldValue.substring(fieldValue.lastIndexOf('_') + 1, fieldValue.length);
					chart.addAxis("y", {
						vertical: true,
						fixLower: "none",
						fixUpper: "none",
						natural: true,
						majorTick: { length: 3 },
						labels: [
							{value: 0, text: ''},
							{value: 1, text: 'Yes (' + percentageOfYesAnswers + '%)'},
							{value: 2, text: 'No (' + percentageOfNoAnswers + '%)'}
						]
					});
					chart.addPlot("default", { type: "Bars", gap: 16 });
					chart.addSeries(
						"Series A", 
						[ valueCount * 1, inverseCount ],
						{ stroke: {width: 0}, fill: '#ff6600' }
					);
					var animA = new dojox.charting.action2d.Highlight(chart, "default", {
						duration: 450,
						easing:   dojo.fx.easing.bounceOut
					});
					var animB = new dojox.charting.action2d.Tooltip(chart, "default");
					chart.render();

					// Alternate the isNewLine variable to show the charts in two columns
					charting.isNewLine = (charting.isNewLine) ? false : true;

					//  Looping over the 'RECT' elements that Dojo has created in the charts in order to set an empty
					// title on each of them since the default title is not user-friendly!
					var chartRectangleCollection = chartDIV.getElementsByTagName('RECT');
					for (var i=0; i<chartRectangleCollection.length; i++) {
							chartRectangleCollection.item(i).setAttribute('title', ' ');
					}
				},
				error: function(operation) {
					//fail(operation)
				}
			});
		},

		/**
		 * Queries apstrata database for the count of fields that have the passed field name and value.
		 * Call a query to count the survey takers using the ([fieldName] = [each of the passed choices]) value for the query expression.
		 * For:
		 * 1- List: The (surveysTakenCount - [this count]) is the number of people who did not choose this list item.
		 * 2- Multiple Choice: The (surveysTakenCount - [this count]) is the number of people who did not check this box.
		 * 3- Radio Buttons: The (surveysTakenCount - [this count]) is the number of people who did not check this radio button.
		 *
		 * @param fieldName The name of the field to use in the query expression
		 * @param fieldValue The value of the field to use in the query expression
		 * @param callbackResult The callback result container, it is only used to differentiate the callback of every XHR when it returns
		 * @param fieldValueCounts The array location to store the field value counts
		 * @param fieldValueTotalCounts The array containing the total field value counts for each question
		 */
		queryAndDisplayDelayedTypes: function (fieldName, fieldValue, callbackResult, fieldValueCounts, fieldValueTotalCounts) {
			var client = new apstrata.Client({connection: connection});
			var charting = this;

			var queryRequest = {
				apsdb: {
					store: charting.storeName,
					query: "apsdb.schema=\"" + charting.apsdbSchema + "\" AND " + fieldName + "=\"" + this.clean(fieldValue) + "\"",
					count: true
				}
			};

			callbackResult = client.call({
				action: "Query",
				request: queryRequest,
				load: function(operation) {
					var valueCount = operation.response.result.count;
					fieldValueCounts[fieldName + '_' + fieldValue] = valueCount; // Save the returned value count

					// Loop over the existing field value counts and if all values have been accounted for, then display the chart
					var areAllValuesPresent = true;
					for (fieldValue in fieldValueCounts) {
						fieldValueTotalCounts[fieldName] += fieldValueCounts[fieldValue] * 1;
						if (fieldValueCounts[fieldValue] == null) {
							areAllValuesPresent = false;
							fieldValueTotalCounts[fieldName] = 0;
							break;
						}
					}

					// If all radio button values have returned their count, then display this field's chart
					if (areAllValuesPresent) {
						var queryFields = '';
						for (constructedNameValueKey in fieldValueCounts) {
							queryFields += fieldName + '=\"' + charting.clean(constructedNameValueKey.substring(constructedNameValueKey.lastIndexOf('_') + 1, constructedNameValueKey.length)) + '\" OR ';
						}
						// This is to remove the last 3 characters from the query fields (which should be:' OR')
						queryFields = ' AND (' + queryFields.substring(0, queryFields.length - 4) + ')';

						var countPeopleQueryRequest = {
							apsdb: {
								store: charting.storeName,
								query: "apsdb.schema=\"" + charting.apsdbSchema + "\"" + queryFields,
								count: true
							}
						};
						
						countPeopleQueryCallbackResult = client.call({
							action: "Query",
							request: countPeopleQueryRequest,
							load: function(countPeopleOperation) {
								var countPeopleWhoAnsweredThisQuestion = countPeopleOperation.response.result.count;

								var chartLine = charting.displayTable.lastChild; // Get the last DIV in the display table
								var chartCell = null;
								// Create a new line if: (1) We couldn't find one, (2) We found a default text node, (3) The caller is asking for a new line
								if (chartLine == null || chartLine.nodeType == 3 || charting.isNewLine) {
									chartLine = document.createElement('DIV');
									chartCell = document.createElement('DIV');
									chartLine.className = 'surveyChartLineSize';
									chartLine.appendChild(chartCell);
									charting.floatElement(chartCell, 'left');
		
									charting.displayTable.appendChild(chartLine); // Add the new line with the new cell to the display table
								} else {
									var chartCell = document.createElement('DIV');
									charting.floatElement(chartCell, 'left');
		
									chartLine.appendChild(chartCell); // Just add the new cell to the existing line
								}

								// 1- Add the chart title to the chart cell
								var chartTitle = document.createElement('DIV');
								chartTitle.style.width = '320px';
								chartTitle.style.paddingLeft = '10px';
								chartTitle.style.paddingBottom = '5px';
								var fieldTitle = charting.getTitleOf(fieldName);
								chartTitle.className = 'questionTitle';
								chartTitle.innerHTML = fieldTitle;
								chartCell.appendChild(chartTitle);
		
								// 2- Add the chart placeholder in the chart cell
								var chartDIV = document.createElement('DIV');
								chartDIV.setAttribute('id', fieldName);
								chartDIV.className = 'surveyChartSize';
								chartCell.appendChild(chartDIV);
		
								// 3- Add the count of the people who answered this question to the chart cell
								var chartPeopleWhoAnsweredThisQuestion = document.createElement('DIV');
								chartPeopleWhoAnsweredThisQuestion.style.width = '320px';
								chartPeopleWhoAnsweredThisQuestion.style.paddingLeft = '10px';
								chartPeopleWhoAnsweredThisQuestion.style.paddingTop = '5px';
								pctOfPeopleWhoAnsweredThisQuestion = (countPeopleWhoAnsweredThisQuestion / charting.surveysTakenCount) * 100 + '';
								if (pctOfPeopleWhoAnsweredThisQuestion.lastIndexOf('.') > 1)
									try {
										pctOfPeopleWhoAnsweredThisQuestion = pctOfPeopleWhoAnsweredThisQuestion.substring(0, pctOfPeopleWhoAnsweredThisQuestion.lastIndexOf('.') + 3);
									} catch (err) {}
								chartPeopleWhoAnsweredThisQuestion.innerHTML = 'People who answered this question: <span class="emphasizeNumber">' + countPeopleWhoAnsweredThisQuestion + ' (' + pctOfPeopleWhoAnsweredThisQuestion + '%)</span>';
								chartCell.appendChild(chartPeopleWhoAnsweredThisQuestion);
		
								// 4- Create and render the chart
								var chart = new dojox.charting.Chart2D(fieldName);
/*								//TODO: Replace this code with the code below it in order to get pie charts instead of horizontal bar graphs
								chart.setTheme(dojox.charting.themes.PlotKit.red);
								chart.addPlot('default', {
									type: 'Pie',
									font: 'normal normal bold 8pt Tahoma',
									fontColor: 'white',
									labelOffset: 40
								});

								var valuesArr = new Array(fieldValueCounts.length);
								var k = 0;
								for (fieldValue in fieldValueCounts) {
									var chartlabel = fieldValue.substring(fieldValue.lastIndexOf('_') + 1, fieldValue.length);
									valuesArr[k] = {y: fieldValueCounts[fieldValue], text: fieldValueCounts[fieldValue] + ' ' + chartlabel};
									k++;
								}
								chart.addSeries('Series A', valuesArr);*/
								chart.addAxis("x", {
									majorLabels: false,
									includeZero: true,
									minorTicks: false,
									microTicks: false,
									majorTick: { length: 0 }
								});

								// Calculate the percentage of people who answered every value of this question, and construct the labels and values arrays
								var lablesArr = new Array(fieldValueCounts.length + 1);
								var valuesArr = new Array(fieldValueCounts.length);
								var k = 0;
								lablesArr[k] = {value: 0, text: ''};
								for (fieldValue in fieldValueCounts) {
									var percentageOfAnswers = ((fieldValueCounts[fieldValue] / fieldValueTotalCounts[fieldName]) * 100 ) + '';
									if (percentageOfAnswers.lastIndexOf('.') > 1)
										try {
											percentageOfAnswers = percentageOfAnswers.substring(0, percentageOfAnswers.lastIndexOf('.') + 3);
										} catch (err) {}
									var chartlabel = fieldValue.substring(fieldValue.lastIndexOf('_') + 1, fieldValue.length) + ' (' + percentageOfAnswers + '%)';
									lablesArr[k + 1] = {value: k + 1, text: chartlabel};
									valuesArr[k] = fieldValueCounts[fieldValue] * 1;
									k++;
								}
								chart.addAxis("y", {
									vertical: true,
									fixLower: "none", 
									fixUpper: "none", 
									natural: true,
									majorTick: { length: 3 },
									labels: lablesArr
								});

								// Set the gap between the bars according to the number of bars, i.e. More bars = Smaller gap
								var gapBetweenBars = 0;
								if (fieldValueCounts.length < 4) gapBetweenBars = 11;
								else if (fieldValueCounts.length < 7) gapBetweenBars = 9;
								else if (fieldValueCounts.length > 6) gapBetweenBars = 3;
								chart.addPlot("default", { type: "Bars", gap: gapBetweenBars });
		
								var inverseCount = charting.surveysTakenCount - valueCount;
								chart.addSeries(
									"Series A", 
									valuesArr,
									{ stroke: {width: 0}, fill: '#ff6600' }
								);
								var animA = new dojox.charting.action2d.Highlight(chart, "default", {
									duration: 450,
									easing:   dojo.fx.easing.bounceOut
								});
								var animB = new dojox.charting.action2d.Tooltip(chart, "default");
								chart.render();
		
								// Alternate the isNewLine variable to show the charts in two columns
								charting.isNewLine = (charting.isNewLine) ? false : true;

								//  Looping over the 'RECT' elements that Dojo has created in the charts in order to set an empty
								// title on each of them since the default title is not user-friendly!
								var chartRectangleCollection = chartDIV.getElementsByTagName('RECT');
								for (var i=0; i<chartRectangleCollection.length; i++) {
								    chartRectangleCollection.item(i).setAttribute('title', ' ');
								}
							},
							error: function(countPeopleOperation) {
								//fail(operation)
							}
						});
					}
				},
				error: function(operation) {
					//fail(operation)
				}
			});
		},

		/**
		 * Get the title of the field whose name is passed by searching for it in the schema.
		 *
		 * @param fieldName in the schema
		 *
		 * @return The title of the field in the schema
		 */
		getTitleOf: function (fieldName) {
			var charting = this;

			for (var k=0; k<charting.questions.length; k++)
				if (charting.questions[k].name == fieldName)
					return charting.questions[k].title;
		},

		/**
		 * Sets the style float attribute of the passed element to the passed direction. Used for cross-browser compatibility
		 *
		 * @param element The element to float
		 * @param direction The direction of the floating
		 */
		floatElement: function (element, direction) {
			if (dojo.isIE)
			  element.style.styleFloat = direction;
			else
			  element.style.cssFloat = direction;
		},

		/**
		 * Escapes the following special characters from the passed String:
		 * "/"
		 *
		 * @param str The String to be cleaned
		 */
		clean: function (str) {
			str = str.replace(/\\/g, '\\\\');
			return str;
		}
	});

