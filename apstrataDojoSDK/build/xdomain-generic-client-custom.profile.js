dependencies = {
    layers:  [ 
        {
	        name: "test.js",
	        dependencies: [
				"dijit._Widget",
				"dijit._Templated",
				"dojox.encoding.digests.MD5",
				"test.widgets.BasicWidget"
	        ]
        }
    ],
    prefixes: [
		[ "test", "../../../../test" ]
    ]
};
