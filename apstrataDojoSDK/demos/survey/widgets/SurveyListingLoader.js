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

var schema = null

function loadjscssfile(filename, filetype){
	 if (filetype=="js"){ //if filename is a external JavaScript file
	  var fileref=document.createElement('script')
	  fileref.setAttribute("type","text/javascript")
	  fileref.setAttribute("src", filename)
	 }
	 else if (filetype=="css"){ //if filename is an external CSS file
	  var fileref=document.createElement("link")
	  fileref.setAttribute("rel", "stylesheet")
	  fileref.setAttribute("type", "text/css")
	  fileref.setAttribute("href", filename)
	 }
	 if (typeof fileref!="undefined")
	  document.getElementsByTagName("head")[0].appendChild(fileref)
}

loadjscssfile("../dojo/1.2.3-src/dojo/resources/dojo.css", "css");
loadjscssfile("widgets/css/survey.css", "css");
//loadjscssfile("../dojo/1.2.3-src/dojo/dojo.js", "js");

dojo.require("dijit.Declaration");
dojo.registerModulePath("surveyWidget","../../../../demos/survey");
//dojo.registerModuleRelative ("surveyWidget", "../../survey");
dojo.registerModulePath("apstrata","../../../../apstrata");
//dojo.registerModuleRelative ("apstrata", "../../../apstrata");
dojo.require("surveyWidget.widgets.SurveyListing");
dojo.require("apstrata.apsdb.client.Connection")
dojo.require("apstrata.apsdb.client.Client")

