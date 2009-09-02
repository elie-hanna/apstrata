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
//dojo.require("apstrata.dojo.client.apsdb.Connection");

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

		//
		// Replace here with your apsdb account
		//  and target store name
		//
		apsdbKey: "apstrata",
		apsdbSecret: "secret",
		apsdbServiceUrl: "http://apsdb.apstrata.com/apsdb/rest", //"http://localhost/apstratabase/rest",
		storeName: "myStore",
		
		constructor: function() {
			if(schema != null){
				this.jsonDataModel = schema;
				this.dojoDataModel = dojo.fromJson(this.jsonDataModel);
				this.arrFieldsToDisplay = this.dojoDataModel.fields;
				this.arrTitleFieldsToDisplay = this.dojoDataModel.titleFields;
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

			//var connection = new apstrata.dojo.client.apsdb.Connection()
			//connection.serviceUrl = this.apsdbServiceUrl;
			//connection.credentials.key = this.apsdbKey
			//connection.credentials.secret = this.apsdbSecret
			var client = new apstrata.apsdb.client.Client();
			var listing = this;

			var q = client.query(
					function() {
						listing.resultResponse = q;
						listing.display(listing.resultResponse,listing.arrFieldsToDisplay, listing.arrTitleFieldsToDisplay);
					}, function() {
						//fail(operation)
					},
					{
						store: listing.storeName,
						query: "apsdb.documentKey!=\"-1\"",
						queryFields: listing.arrFieldsToDisplay
					}
				)
			
		//	var q = new apstrata.dojo.client.apsdb.Query(connection);
		//	var listing = this;
		    
			//dojo.connect(q, "handleResult", function(){
			//	listing.resultResponse = q.response;
			//	listing.display(listing.resultResponse,listing.arrFieldsToDisplay, listing.arrTitleFieldsToDisplay);
			//})
			
			//q.execute({store: this.storeName, query: "apsdb.documentKey!=\"-1\"", queryFields: listing.arrFieldsToDisplay});
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
						if(columns[ncol] == arrSurvey[doc].fields[fid]["@name"]){
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

