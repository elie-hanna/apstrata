<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
		<title>ap((strata CMS</title>

	    <link rel="shortcut icon" href="<?php print $GLOBALS["config"]["baseUrl"]?>/themes/<?php print $GLOBALS["config"]["template"]?>/images/favicon.png" type="image/png" />
	
		<?php 
			if ($config["developmentMode"]) { 
		?>
		<script type="text/javascript" src="<?php print $GLOBALS["config"]["baseUrl"]?>/lib/dojo/dojo/dojo.js" djConfig="parseOnLoad: false, isDebug: true"></script>
		<script type="text/javascript" src="<?php print $GLOBALS["config"]["baseUrl"]?>/lib/ApstrataSDK/apstrata/sdk/apstrata.js"></script>
		
		<style type="text/css">
			@import "<?php print $GLOBALS["config"]["baseUrl"]?>/themes/cms/cms.css";
        </style>

		<?php 
			} else { 
		?>

		<script type="text/javascript" src="<?php print $GLOBALS["config"]["baseUrl"]?>/lib/dojo/release/dojo/dojo/dojo.js" djConfig="parseOnLoad: false"></script>
		<script type="text/javascript" src="<?php print $GLOBALS["config"]["baseUrl"]?>/lib/dojo/release/dojo/dojo/<?php print $GLOBALS["config"]["jsPackageName"]?>.js"></script>
		<script type="text/javascript" src="<?php print $GLOBALS["config"]["baseUrl"]?>/lib/ApstrataSDK/apstrata/sdk/apstrata.js"></script>
		
		<style type="text/css">
			@import "<?php print $GLOBALS["config"]["baseUrl"]?>/lib/dojo/release/dojo/<?php print $GLOBALS["config"]["template"]?>/themes/cms/cms-packaged.css";
        </style>

		<?php 
			}
		?>
		
		<script>			
			dojo.ready(function() {
				<?php
					include($GLOBALS["config"]["docroot"] . "/manage/modules.php"); 
				?>

				dojo.require("dijit._Widget")
				dojo.extend(dijit._Widget, {
					_apstrataRoot: "<?php print $GLOBALS["config"]["baseUrl"]?>/lib/ApstrataSDK/apstrata",
					_horizonRoot: "<?php print $GLOBALS["config"]["baseUrl"]?>/lib/ApstrataSDK/apstrata/horizon"
				})

				dojo.require("apstrata.horizon.Container")
				dojo.require("apstrata.cms.CMS")
				dojo.require("apstrata.ui.widgets.LoginWidget")


				//
				// Get apstrata configuration from config.php
				//
				dojo.setObject("apstrata.apConfig", {
				    // apstrata.ui related
				    "apstrata.ui": {
				        "widgets.Login" : {
				            autoLogin: false
				        }
				    },
				 
				    // apstrata.sdk related
				    "apstrata.sdk": {
				        "Connection" : {
							credentials: {
								key: '<?php print $GLOBALS["config"]["apstrataKey"]; ?>'								
							},
							serviceURL: '<?php print $GLOBALS["config"]["apstrataServiceURL"]; ?>',
							defaultStore: '<?php print $GLOBALS["config"]["contentStore"]; ?>',
							timeout: parseInt('<?php print $GLOBALS["config"]["apstrataConnectionTimeout"]; ?>')
				        }
				    },
				    
				    // dashboard specific
				    "apstrata.services" : {
				    	targetClusterUrl: '<?php print $GLOBALS["config"]["targetClusterUrl"]; ?>',
    					workbenchUrl: '<?php print $GLOBALS["config"]["workbenchUrl"]; ?>' 
				    }
				})
				//
				//
				//

								
				try {
					// try to load additional credentials for autologin if the source file is there
					dojo.require("apstrata.cms.ApConfigSDK")
				} catch (e) {
				}

				// These are visual properties used by the application that can not fit in a CSS file yet 			
				apstrata.horizon.magicUIdimensions = {
					"list.SimpleFilterAndSort.width": 35,
					"panel.finalAlpha": .95
				}

				loginWidget = new apstrata.ui.widgets.LoginWidget({type: "user"})
				
				dojo.parser.parse()
			})
		</script>
	</head>
	<body class='claro apstrataCms'>
		<div class='apstrataLogo'></div>
		<div class='appTitle'>Apstrata CMS</div>		
		<div style='clear:both'></div>

		<div>
			<div dojoType="apstrata.cms.CMS"
				margin="{top: 70, left: 10, right:10, bottom: 10}"
				loginWidget='loginWidget'
				class="apstrataCms"></div>
		</div>
	</body>
</html>
