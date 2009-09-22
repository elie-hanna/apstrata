dependencies = {
    layers:  [ 
        {
	        name: "../apstrata/apstrata-lib.js",
	        dependencies: [
				"dijit._Widget",
				"dijit._Templated",
				"dojox.encoding.digests.MD5",
				"apstrata.util.logger.BasicLogger",
				"asptrata.BasicWidget",
	            "apstrata.Client"
	        ]
        }
    ],
    prefixes: [
		[ "apstrata", "../../../../apstrata" ]
    ]
}
