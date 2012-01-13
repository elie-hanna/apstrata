dependencies = {
    layers:  [ 
        {
	        name: "../apstrata/apstrataMinClient.js",
	        
	        dependencies: [
				"dojox.encoding.digests.MD5",
				"apstrata.Client",
				"apstrata.StickyConnection",
				"apstrata.TokenConnection",
				"apstrata.util.logger.BasicLogger"
	        ]
        }
    ],
    prefixes: [
		[ "apstrata", "../../../../apstrata" ]
    ]
};