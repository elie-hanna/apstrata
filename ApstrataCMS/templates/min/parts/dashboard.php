<style type="text/css">
	@import "lib/dojo/dojo/resources/dojo.css";
    @import "lib/dojo/dijit/themes/claro/claro.css";
    @import "lib/dojo/dojox/grid/resources/Grid.css";
    @import "lib/dojo/dojox/grid/resources/claroGrid.css";
	@import "lib/dojo/dojox/grid/enhanced/resources/claro/EnhancedGrid.css";
	@import "lib/dojo/dojox/form/resources/FileInput.css";
	@import "lib/dojo/dojox/highlight/resources/highlight.css";
	@import "lib/dojo/dojox/highlight/resources/pygments/colorful.css";

    @import "lib/ApstrataSDK/apstrata/ui/themes/apstrata/FormGenerator.css";
    @import "lib/ApstrataSDK/apstrata/ui/themes/apstrata/Curtain.css";
    @import "lib/ApstrataSDK/apstrata/ui/themes/apstrata/FlashAlert.css";
    @import "lib/ApstrataSDK/apstrata/ui/themes/apstrata/ApstrataAnimation.css";

    @import "lib/ApstrataSDK/apstrata/horizon/themes/horizon.css";

	.blueHorizon {
		font-family: sans-serif;
		font-size: 1.2em;

		top: 44px;
		left: 70px;
		width: 700px;
		height: 400px;
	}
</style>

<script>
	dojo.addOnLoad(function() {
		dojo.registerModulePath("apstrata", "../../ApstrataSDK/apstrata")
		dojo.registerModulePath("apstrata.cms", "../../../src/cms")
		
		dojo.require("dijit._Widget");
		dojo.extend(dijit._Widget, {
			_apstrataRoot: apstrata.baseUrl,
			_horizonRoot: apstrata.baseUrl + "/../horizon"
		})
						
		dojo.require("apstrata.sdk.Connection");
		dojo.require("apstrata.sdk.Client");
		dojo.require("apstrata.home.dashboard.Dashboard");
		dojo.require("dojo.parser");
		dojo.require("apstrata.ui.widgets.LoginWidget")
													 
		// These are visual properties used by the application that can not fit in a CSS file yet 			
		apstrata.horizon.magicUIdimensions = {
			"panel.finalAlpha": .95
		}

		loginWidget = new apstrata.ui.widgets.LoginWidget({type: "user"})

		dojo.parser.parse();
	})
	
</script>
<div 
	dojoType="apstrata.home.dashboard.Dashboard"
	loginWidget='loginWidget'
	class= "dashboard">
</div>				
