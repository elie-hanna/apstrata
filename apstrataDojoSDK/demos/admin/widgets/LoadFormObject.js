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

loadjscssfile("../../lib/dojo/1.2.3/dojo/resources/dojo.css", "css");
loadjscssfile("../../lib/dojo/1.2.3/dijit/themes/tundra/tundra.css", "css");

 dojo.addOnLoad(function() {
			
			dojo.require("dijit.dijit");
			dojo.require("dijit.Declaration");
			dojo.require("dijit.form.Form");
			dojo.require("dijit._Templated");
			dojo.require("dijit.layout.LayoutContainer");
			dojo.require("dijit.form.ValidationTextBox");
			dojo.require("dijit.form.FilteringSelect");
			dojo.require("dijit.form.CheckBox");
			dojo.require("dijit.form.Button");
			dojo.require("dojo.html");
			dojo.require("dojo.parser"); ;
			//dojo.registerModuleRelative ("widgets", "widgets");
			dojo.registerModulePath("widgets","../../../../demos/admin/widgets");
			dojo.require("widgets.FieldObject");
			dojo.require ("widgets.FormObject");
			
		})