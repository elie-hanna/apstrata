dependencies = {
    layers:  [ 
        {
	        name: "../apstrata/apstrata-lib.js",
	        dependencies: [
				"apstrata.util.logger.BasicLogger",
	            "apstrata.Client",
				"dojox.encoding.digests.MD5"
	        ]
        }
    ],
    prefixes: [
		[ "apstrata", "../../../../apstrata" ]
    ]
};
