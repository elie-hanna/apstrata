//This profile is used just to illustrate the layout of a layered build.
//All layers have an implicit dependency on dojo.js.

//Normally you should not specify a layer object for dojo.js. It is normally
//implicitly built containing the dojo "base" functionality (dojo._base).
//However, if you prefer the Dojo 0.4.x build behavior, you can specify a
//"dojo.js" layer to get that behavior. It is shown below, but the normal
//0.9 approach is to *not* specify it.

//

dependencies = {
	layers: [
		{
			name: "apstratacms.js",
			//resourceName: "dijit.dijit",
			dependencies: [
<!--INSERTDEPENDENCIESHERE-->
			]
		}
	],

	prefixes: [
		["apstrata", "../../../lib/ApstrataSDK/apstrata"],
		["apstrata.cms", "../../../src/cms"],
		["apstrata.home", "../../../src/home"],
		["apstrata.themes", "../../../themes"]//fake entry to get the css copied
	]
}

