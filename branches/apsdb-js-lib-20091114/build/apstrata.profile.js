dependencies = {
    layers:  [ 
        {
	        name: "survey.js",
	        dependencies: [
				"dijit._Widget",
				"dijit._Templated",
				"dijit.Declaration",
				"dijit.form.Form",
				"dijit.form.ValidationTextBox",
				"dijit.form.FilteringSelect",
				"dijit.form.CheckBox",
				"dojox.encoding.digests.MD5",
				"test.widgets.BasicWidget",
				"apstrata.apsdb.client.Connection",
				"apstrata.apsdb.client.Client",
	        ]
        }
    ],
    prefixes: [
		[ "test", "../../../../test" ],
		[ "apstrata", "../../../../apstrata" ]
    ]
};