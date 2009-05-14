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

loadjscssfile("../dojo/1.2.3/dojo/resources/dojo.css", "css");
loadjscssfile("widgets/css/survey.css", "css");
//loadjscssfile("../dojo/1.2.3/dojo/dojo.js", "js");

dojo.require("dijit.Declaration");
dojo.registerModulePath("surveyWidget","../../../survey");
dojo.registerModulePath("apstrata","../../../apstrata");
dojo.require("surveyWidget.widgets.SurveyListing");
dojo.require("apstrata.dojo.client.apsdb.Query");
