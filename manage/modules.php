<?php 
	if ($config["developmentMode"]) { 
?>
	dojo.registerModulePath("apstrata", "../../ApstrataSDK/apstrata")
	dojo.registerModulePath("apstrata.cms", "../../../src/cms")
<?php 
	}
?>