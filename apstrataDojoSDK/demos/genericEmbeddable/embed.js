/**
 * @author rabih
 */

if (typeof apstrata == "undefined") apstrata = {}

// TODO: autodetect
apstrata.baseUrl = "http://localhost/~rabih/apstrataDojoSDK/apstrata/" 

apstrata.loadjscssfile = function(filename, filetype){
	if (filetype=="js"){ //if filename is a external JavaScript file
		var fileref=document.createElement('script')
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", filename)
	} else if (filetype=="css") { //if filename is an external CSS file
		var fileref=document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", filename)
	}
	if (typeof fileref!="undefined")
	document.getElementsByTagName("head")[0].appendChild(fileref)
}			

apstrata.load = function(url, filetype) {
	apstrata.loadjscssfile(apstrata.baseUrl + '../' + url, filetype)
}

var djConfig = { 
	isDebug:false, 
	parseOnLoad:true,
	xdWaitSeconds: 10, 
	useXDomain: true, 

	modulePaths: {
		apstrata: "http://localhost/~rabih/apstrataDojoSDK/lib/dojo/1.3.0-src/release/beebot/apstrata",
		'apstrata.genericEmbeddable': 'http://localhost/~rabih/apstrataDojoSDK/lib/dojo/1.3.0-src/release/genericEmbeddable/genericEmbeddable',

		dojo: 'http://o.aolcdn.com/dojo/1.3/dojo',
		dijit: 'http://o.aolcdn.com/dojo/1.3/dijit',
		dojox: 'http://o.aolcdn.com/dojo/1.3/dojox' 
	}
};

apstrata.loadjscssfile('http://o.aolcdn.com/dojo/1.3/dojo/dojo.xd.js.uncompressed.js', 'js')


var initPage = function() {
	apstrata.loadjscssfile('http://localhost/~rabih/apstrataDojoSDK/lib/dojo/1.3.0-src/release/beebot/beebot/genericEmbeddable-release.xd.js.uncompressed.js', 'js')
				
	apstrata.configured = true;
		
	dojo.require ("apstrata.util.logger.BasicLogger")
	
	dojo.registerModuleRelative = function(module, string) {
		dojo.registerModulePath (module, "../../../../" + string)
	}
	
	dojo.require("dijit._Widget")
	
	dojo.addOnLoad(function() {
		dojo.extend(dijit._Widget, {
			_apstrataRoot: apstrata.baseUrl
		})
	})

	var embeddable = new apstrata.genericEmbeddable.GenericEmbeddable()
	dojo.place(embeddable.domNode, dojo.body())
}

function doit() {
	console.debug('dojo loaded')
	initPage()
}

// TODO: figure out how to detect that x domain dojo has loaded
setTimeout('doit()', 5000)

// Bookmarklet code
//javascript:(function(){beebot_script=document.createElement('SCRIPT');beebot_script.type='text/javascript';beebot_script.src='http://localhost/~rabih/apstrataDojoSDK/demos/beebot/apstrata/beebot/embed.js?x='+(Math.random());document.getElementsByTagName('head')[0].appendChild(beebot_script);})();
