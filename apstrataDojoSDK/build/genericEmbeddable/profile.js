dependencies = {
    layers:  [ 
        {
	        name: "../beebot/beebot-release.js",
	        dependencies: [
				"apstrata.util.logger.BasicLogger",
				"apstrata.genericEmbeddable.GenericEmbeddable"
	        ]
        }
    ],
    prefixes: [
		[ "apstrata", "../../../../apstrata" ],
		[ "apstrata.beebot", "../../../../demos/genericEmbeddable/apstrata/genericEmbeddable" ]
		
    ]
};
