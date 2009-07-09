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

if (typeof apstrata == "undefined") {
	apstrata = {}
	apstrata.baseUrl = ""
		
	apstrata.version = {
		major: 0,
		minor: 1,
		patch: 0,
		flag: "",
		revision: "$revision$",
		version: "$version$-$tag$",
		toString: function(){
			with (apstrata.version) {
				return major + "." + minor + "." + patch + flag + " (" + revision + ")"; // String
			}
		}
	}
	
	
	// Find out where apstrata.js is, this is the root folder for the apstrata core package
	//  Extract apConfig also
	if ((this["document"]) && (this["document"]["getElementsByTagName"])) {
		var scripts = document.getElementsByTagName("script");
		var rePkg = /apstrata\.js([\?\.]|$)/i;
		for (var i = 0; i < scripts.length; i++) {
			// var src = scripts[i].getAttribute("src");
			var src = scripts[i].src; // TODO: is this portable?
			if (!src) {
				continue;
			}
			var m = src.match(rePkg);
			if (m) {
				apstrata.baseUrl = src.substring(0, m.index-1);
				
				if (scripts[i].getAttribute("apConfig")) {
					var s = "{" + scripts[i].getAttribute("apConfig") + "}"
					var o = dojo.fromJson(s)
					if (typeof o != undefined) 
						apstrata["apConfig"] = o
				}
				break;
			}
		}
	}

	// Find out where dojo.js and calculate the relative path from dojo to the current location
	if ((this["document"]) && (this["document"]["getElementsByTagName"])) {
		var scripts = document.getElementsByTagName("script");
		var rePkg = /dojo\.js([\?\.]|$)/i;
		for (var i = 0; i < scripts.length; i++) {
			// var src = scripts[i].getAttribute("src");
			var src = scripts[i].src; // TODO: is this portable?
			if (!src) {
				continue;
			}
			var m = src.match(rePkg);
			if (m) {
				// split the path into an array  
				var p1 = src.split('/')
				var p2 = (this.location+"").split('/')

				// find out at what index the 2 arrays are not identical
				var j=0
				for (; j<p1.length; j++) {
					if (p1[j] != p2[j]) break;
				}

				// reconstruct the relative path from dojo of the current location 
				//  the page has loaded from
				var s = ""
				// find out the common root
				for (var k=0; k<(p1.length-j-1); k++) {
					s += "../"
				}
				
				// add the path to the location
				for (k=j; k<(p2.length-1); k++) {
					s += p2[k] + "/"
				}
				
				apstrata.pathFromDojo = s
				
				break;
			}
		}
	}

    apstrata.logConfig = {
		buffer:  new Array(),	// global array to contain the log
		level: 0, 		// severity of log messages to display
		verbose: true, 		// show log messages on console
		logGarbageCollection: 10 	// minutes to clear the log messages buffer		
    }
    
    apstrata.log = function(origin, attr1, attr2, attr3) {
		if (this.logger == undefined) this.logger = new apstrata.util.logger.Logger()
		
		if (attr1 == undefined) {
			this.logger._LOGGER.className = ""
			this.logger.log(origin)			
		} else {
			this.logger._LOGGER.className = origin
			this.logger.log(attr1, attr2, attr3)			
		}
    }

	dojo.addOnLoad(function() {
			dojo.registerModulePath("apstrata", apstrata.baseUrl)
			dojo.require ("apstrata.util.logger.Logger");
			
			dojo.require("dijit._Widget")
			
			dojo.extend(dijit._Widget, {
				_apstrataRoot: apstrata.baseUrl
			})

			dojo.registerModuleRelative = function(module, string) {
				dojo.registerModulePath (module, apstrata.pathFromDojo + string)
			}
	})
}