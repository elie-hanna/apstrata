	<style type="text/css">
	<?php 
			if ($config["developmentMode"]) { 
		?>	
		/* import amc styles which contain amc widgets and panels styles */
		@import "lib/amc/src/ui/css/amcStyles.css";
		/* import fonts as icons */
		@import "lib/amc/src/ui/css/font-style.css";
		/* import horizon styles from amc */
		@import "lib/amc/src/ui/css/horizon/horizon.css";
	<?php 
			} 
		?>
	</style>
	

	<div>

		<script>
		    /*
		     * Global variables defining templates that will overload the default templates of Account.js and Profile.js
		     */
			accountsTemplate =  "../../../templates/touch/widgets/Accounts.html";
			profileTemplate = "../../../../templates/touch/widgets/Profile.html";
			dojo.addOnLoad(function() {
					<?php 
						if ($config["developmentMode"]) { 
					?>
						dojo.registerModulePath("apstrata", "../../ApstrataSDK/apstrata")
						dojo.registerModulePath("apstrata.cms", "../../../src/cms")
						dojo.registerModulePath("amc", "../../../lib/amc/src/ui/amc");
						<?php 
						} 
					?>
					dojo.require("dijit._Widget");
					
					dojo.extend(dijit._Widget, {
						_apstrataRoot: apstrata.baseUrl,
						_horizonRoot: apstrata.baseUrl + "/../horizon"
					});
					
					dojo.require("apstrata.home.dashboard.App");	
					
					//These are visual properties used by the application that can not fit in a CSS file yet 			
					apstrata.horizon.magicUIdimensions = {
							"list.SimpleFilterAndSort.width": 35,
							"panel.finalAlpha": .95
					};
						
					var connection = new apstrata.sdk.TokenConnection({credentials: apstrata.apConfig["apstrata.sdk"].Connection.credentials, isUseParameterToken: true});
					dojo.require("amc.Init");
					amc.globals.sdk.connection=connection;
					amc.globals.sdk.client = new apstrata.sdk.Client(connection);

					
					var mainContainer = new apstrata.home.dashboard.App({
						showToolbar: false,
					    connection: connection,	
						client: new apstrata.sdk.Client(connection),
						margin:{top: 30, left: 0, right:0, bottom: 25}}, "mainContainerId");
		
					mainContainer.startup();
			});
		</script>
		<div id="mainContainerId"></div>
	</div>

