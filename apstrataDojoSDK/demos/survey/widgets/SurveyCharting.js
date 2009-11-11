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

		//
		// Replace here with your apsdb account
		//  and target store name
		//
		storeName: "myStore",
		
		constructor: function() {
			if(schema != null){
				this.jsonDataModel = decodeURIComponent(schema);
				this.dojoDataModel = dojo.fromJson(this.jsonDataModel);
				this.questions = this.dojoDataModel.questions;

				// Look for and set the apstrata survey identifier
				var self = this;
				dojo.forEach(this.questions, function(fieldDataModel) {
					if (fieldDataModel.name == 'apsdbSchema') {
						self.apsdbSchema = fieldDataModel.defaultValue;
					}
				});

				if (this.apsdbSchema == null) {
					// TODO: Throw an error because we use the survey ID to query for the results of the widget
				}
			}
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

			var queryRequest = {
				apsdb: {
					store: charting.storeName,
					query: "apsdb.objectName=\"" + charting.apsdbSchema + "\"",
					queryFields: '*',
					count: true
				}
			};

			// Query to get the total number of surveys taken
			var surveysTakenCountQuery = client.call({
				action: "Query",
				request: queryRequest,
				load: function(operation) {
					charting.surveysTakenCount = operation.response.result.count;
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
										fieldValueCounts[i][fieldDataModel.name + '_' + choices[j]] = 0;
										charting.queryAndDisplayMultipleChoice(fieldDataModel.name, choices[j], fieldResponses[i][j], fieldValueCounts[i]);
									}
									break;
								case 'radio button':
									// Count and display the number of people who checked this radio button
									var choices = fieldDataModel.choices.split(',');
									fieldValueCounts[i] = new Array(choices.length);
									for (var j=0; j<choices.length; j++) {
										fieldValueCounts[i][fieldDataModel.name + '_' + choices[j]] = null;
										charting.queryAndDisplayRadioButton(fieldDataModel.name, choices[j], fieldResponses[i][j], fieldValueCounts[i]);
									}
									break;
								case 'checkbox':
									// Count and display the number of people who checked this checkbox
									fieldValueCounts[i] = new Array();
									fieldValueCounts[i][fieldDataModel.name + '_checked'] = 0;
									charting.queryAndDisplayCheckbox(fieldDataModel.name, 'checked', fieldResponses[i][0], fieldValueCounts[i]);
									break;
								case 'list':
									// Count and display the number of people chose each of these list items
									var choices = fieldDataModel.choices.split(',');
									fieldValueCounts[i] = new Array(choices.length);
									for (var j=0; j<choices.length; j++) {
										fieldValueCounts[i][fieldDataModel.name + '_' + choices[j]] = null;
										charting.queryAndDisplayList(fieldDataModel.name, choices[j], fieldResponses[i][j], fieldValueCounts[i]);
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
		 * Call a query to count the survey takers using the ([fieldName] = [each of the passed choices]) value for the query expression.
		 * The (surveysTakenCount - [this count]) is the number of people who did not check this radio button.
		 *
		 * @param fieldName The name of the field to use in the query expression
		 * @param fieldValue The value of the field to use in the query expression
		 * @param callbackResult The callback result container, it is only used to differentiate the callback of every XHR when it returns
		 * @param fieldValueCounts The array location to store the field value counts
		 */
		queryAndDisplayRadioButton: function (fieldName, fieldValue, callbackResult, fieldValueCounts) {
			var client = new apstrata.Client({connection: connection});
			var charting = this;

			var queryRequest = {
				apsdb: {
					store: charting.storeName,
					query: "apsdb.objectName=\"" + charting.apsdbSchema + "\" AND " + fieldName + "=\"" + fieldValue + "\"",
					queryFields: "*",
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
						if (fieldValueCounts[fieldValue] == null) {
							areAllValuesPresent = false;
							break;
						}
					}

					// If all radio button values have returned their count, then display this field's chart
					if (areAllValuesPresent) {
						var chartLine = charting.displayTable.lastChild; // Get the last DIV in the display table
						var chartCell = null;
						// Create a new line if: (1) We couldn't find one, (2) We found a default text node, (3) The caller is asking for a new line
						if (chartLine == null || chartLine.nodeType == 3 || charting.isNewLine) {
							chartLine = document.createElement('DIV');
							chartCell = document.createElement('DIV');
							chartLine.style.width = '460px';
							chartLine.style.height = '230px';
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
						chartTitle.style.width = '220px';
						chartTitle.style.paddingLeft = '10px';
						var fieldTitle = charting.getTitleOf(fieldName);
						chartTitle.innerHTML = fieldTitle;
						chartCell.appendChild(chartTitle);

						// 2- Add the chart placeholder in the chart cell
						var chartDIV = document.createElement('DIV');
						chartDIV.setAttribute('id', fieldName);
						chartDIV.style.width = '200px';
						chartDIV.style.height = '200px';
						chartCell.appendChild(chartDIV);

						// 3- Create and render the chart
						var chart = new dojox.charting.Chart2D(fieldName);
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

						var inverseCount = charting.surveysTakenCount - valueCount;
						chart.addSeries('Series A', valuesArr);
						chart.render();

						// Alternate the isNewLine variable to show the charts in two columns
						charting.isNewLine = (charting.isNewLine) ? false : true;
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
		 * The (surveysTakenCount - [this count]) is the number of people who did not check this box.
		 *
		 * @param fieldName The name of the field to use in the query expression
		 * @param fieldValue The value of the field to use in the query expression
		 * @param callbackResult The callback result container, it is only used to differentiate the callback of every XHR when it returns
		 * @param fieldValueCounts The array location to store the field value counts
		 */
		queryAndDisplayMultipleChoice: function (fieldName, fieldValue, callbackResult, fieldValueCounts) {
			var client = new apstrata.Client({connection: connection});
			var charting = this;

			var queryRequest = {
				apsdb: {
					store: charting.storeName,
					query: "apsdb.objectName=\"" + charting.apsdbSchema + "\" AND " + fieldName + "=\"" + this.clean(fieldValue) + "\"",
					queryFields: "*",
					count: true
				}
			};

			callbackResult = client.call({
				action: "Query",
				request: queryRequest,
				load: function(operation) {
					var valueCount = operation.response.result.count;
					fieldValueCounts[fieldName + '_' + fieldValue] = valueCount; // Save the returned value count

					var chartLine = charting.displayTable.lastChild; // Get the last DIV in the display table
					var chartCell = null;
					// Create a new line if: (1) We couldn't find one, (2) We found a default text node, (3) The caller is asking for a new line
					if (chartLine == null || chartLine.nodeType == 3 || charting.isNewLine) {
						chartLine = document.createElement('DIV');
						chartCell = document.createElement('DIV');
						chartLine.style.width = '460px';
						chartLine.style.height = '230px';
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
					chartTitle.style.width = '220px';
					chartTitle.style.paddingLeft = '10px';
					var fieldTitle = charting.getTitleOf(fieldName);
					chartTitle.innerHTML = fieldTitle + ' : ' + fieldValue;
					chartCell.appendChild(chartTitle);

					// 2- Add the chart placeholder in the chart cell
					var chartDIV = document.createElement('DIV');
					chartDIV.setAttribute('id', fieldName + '_' + fieldValue);
					chartDIV.style.width = '200px';
					chartDIV.style.height = '200px';
					chartCell.appendChild(chartDIV);

					// 3- Create and render the chart
					var chart = new dojox.charting.Chart2D(fieldName + '_' + fieldValue);
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
					]);
					chart.render();

					// Alternate the isNewLine variable to show the charts in two columns
					charting.isNewLine = (charting.isNewLine) ? false : true;
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
		 */
		queryAndDisplayCheckbox: function (fieldName, fieldValue, callbackResult, fieldValueCounts) {
			var client = new apstrata.Client({connection: connection});
			var charting = this;

			var queryRequest = {
				apsdb: {
					store: charting.storeName,
					query: "apsdb.objectName=\"" + charting.apsdbSchema + "\" AND " + fieldName + "=\"" + this.clean(fieldValue) + "\"",
					queryFields: "*",
					count: true
				}
			};

			callbackResult = client.call({
				action: "Query",
				request: queryRequest,
				load: function(operation) {
					var valueCount = operation.response.result.count;
					fieldValueCounts[fieldName + '_' + fieldValue] = valueCount; // Save the returned value count

					var chartLine = charting.displayTable.lastChild; // Get the last DIV in the display table
					var chartCell = null;
					// Create a new line if: (1) We couldn't find one, (2) We found a default text node, (3) The caller is asking for a new line
					if (chartLine == null || chartLine.nodeType == 3 || charting.isNewLine) {
						chartLine = document.createElement('DIV');
						chartCell = document.createElement('DIV');
						chartLine.style.width = '460px';
						chartLine.style.height = '230px';
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
					chartTitle.style.width = '220px';
					chartTitle.style.paddingLeft = '10px';
					var fieldTitle = charting.getTitleOf(fieldName);
					chartTitle.innerHTML = fieldTitle;
					chartCell.appendChild(chartTitle);

					// 2- Add the chart placeholder in the chart cell
					var chartDIV = document.createElement('DIV');
					chartDIV.setAttribute('id', fieldName + '_' + fieldValue);
					chartDIV.style.width = '200px';
					chartDIV.style.height = '200px';
					chartCell.appendChild(chartDIV);

					// 3- Create and render the chart
					var chart = new dojox.charting.Chart2D(fieldName + '_' + fieldValue);
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
					]);
					chart.render();

					// Alternate the isNewLine variable to show the charts in two columns
					charting.isNewLine = (charting.isNewLine) ? false : true;
				},
				error: function(operation) {
					//fail(operation)
				}
			});
		},

		/**
		 * Queries apstrata database for the count of fields that have the passed field name and value.
		 * Call a query to count the survey takers using the ([fieldName] = [each of the passed choices]) value for the query expression.
		 * The (surveysTakenCount - [this count]) is the number of people who did not choose this list item.
		 *
		 * @param fieldName The name of the field to use in the query expression
		 * @param fieldValue The value of the field to use in the query expression
		 * @param callbackResult The callback result container, it is only used to differentiate the callback of every XHR when it returns
		 * @param fieldValueCounts The array location to store the field value counts
		 */
		queryAndDisplayList: function (fieldName, fieldValue, callbackResult, fieldValueCounts) {
			var client = new apstrata.Client({connection: connection});
			var charting = this;

			var queryRequest = {
				apsdb: {
					store: charting.storeName,
					query: "apsdb.objectName=\"" + charting.apsdbSchema + "\" AND " + fieldName + "=\"" + fieldValue + "\"",
					queryFields: "*",
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
						if (fieldValueCounts[fieldValue] == null) {
							areAllValuesPresent = false;
							break;
						}
					}

					// If all radio button values have returned their count, then display this field's chart
					if (areAllValuesPresent) {
						var chartLine = charting.displayTable.lastChild; // Get the last DIV in the display table
						var chartCell = null;
						// Create a new line if: (1) We couldn't find one, (2) We found a default text node, (3) The caller is asking for a new line
						if (chartLine == null || chartLine.nodeType == 3 || charting.isNewLine) {
							chartLine = document.createElement('DIV');
							chartCell = document.createElement('DIV');
							chartLine.style.width = '460px';
							chartLine.style.height = '230px';
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
						chartTitle.style.width = '220px';
						chartTitle.style.paddingLeft = '10px';
						var fieldTitle = charting.getTitleOf(fieldName);
						chartTitle.innerHTML = fieldTitle;
						chartCell.appendChild(chartTitle);

						// 2- Add the chart placeholder in the chart cell
						var chartDIV = document.createElement('DIV');
						chartDIV.setAttribute('id', fieldName);
						chartDIV.style.width = '200px';
						chartDIV.style.height = '200px';
						chartCell.appendChild(chartDIV);

						// 3- Create and render the chart
						var chart = new dojox.charting.Chart2D(fieldName);
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

						var inverseCount = charting.surveysTakenCount - valueCount;
						chart.addSeries('Series A', valuesArr);
						chart.render();

						// Alternate the isNewLine variable to show the charts in two columns
						charting.isNewLine = (charting.isNewLine) ? false : true;
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
		 * After creation of this widget: Set the title and call the query
		 */
		postCreate: function() {
			if (schema != null) {
				this.title.innerHTML = this.dojoDataModel.title;
				this.query();
			}
			else
				this.title.innerHTML = "The survey charting schema is missing";
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

