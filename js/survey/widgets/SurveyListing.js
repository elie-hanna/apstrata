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
		jsonDataModel: "{}",
		arrFieldsToDisplay: null,
		arrData: null,
		resultResponse: null,
		dojoDataModel: null,
		
		constructor: function() {
			if(schema != null){
				this.jsonDataModel = schema;
				this.dojoDataModel = dojo.fromJson(this.jsonDataModel);
				this.arrFieldsToDisplay = this.dojoDataModel.fields;
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

			var auth = {key: "apstrata", secret: "secret"};
			var q = new apstrata.dojo.client.apsdb.Query(auth);
			var listing = this;
		    
			dojo.connect(q, "handleResult", function(){
				listing.resultResponse = q.response;
				listing.display(listing.resultResponse,listing.arrFieldsToDisplay);
			})
			
			q.execute("My_Test_Store616186","apsdb.documentKey!=\"-1\"", listing.arrFieldsToDisplay);
		},
		
		display: function(data, columns) {

			var found = false;
			var columnClass="rounded";
			var bottomCornerClass = "";
			var strData = "";
			var heading = "";
			
			heading = "<thead><tr>";
			for(var col = 0; col < columns.length; col++){
				if(col == 0)
					columnClass = "rounded-first";
				else if(col == columns.length-1)
					columnClass = "rounded-last";
				else
					columnClass = "rounded";
				
				heading = heading + '<th scope="col" class="'+ columnClass +'" >' + columns[col] + '</th>';
			}
			heading = heading + "</tr></thead>";

			strData = "<tbody>";
			var arrSurvey = data.result.documents.document;
			for(var doc = 0; doc < arrSurvey.length; doc++){
				if(arrSurvey[doc].field){
				strData= strData + "<tr>";
				for(var ncol = 0; ncol < columns.length; ncol++){
					found = false;
					for(var fid = 0; fid < arrSurvey[doc].field.length; fid++){
						if(columns[ncol] == arrSurvey[doc].field[fid].@name){
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
					
					if(found == true)
						strData= strData + '<td'+ bottomCornerClass +'>' + arrSurvey[doc].field[fid].value + '</td>';
					else
						strData= strData + '<td'+ bottomCornerClass +'></td>';
				}
				strData= strData + "</tr>";
				}
			}

			strData = strData + "<tbody>";
			
			this.displayTable.innerHTML = heading + strData;
			
		}	
		
	});

