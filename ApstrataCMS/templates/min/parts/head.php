<!-- start: head.php -->		
		
	    <link rel="shortcut icon" href="themes/<?php print $config['template'] ?>/resources/favicon.png" type="image/png" />

		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		
		<!-- Generic Metadata -->
		<meta name="description" content="web technology and e-services company" />
		<meta name="author" content="element&circ;n" />
		
		<!-- Dublin Core Metadata -->
		
		<meta name="DC.Version" content="<?php print $config['DC']['Version'] ?>" />
		<meta name="DC.Publisher" content="<?php print $config['DC']['Publisher'] ?>" />
		<meta name="DC.Creator" content="<?php print $config['DC']['Creator'] ?>" />
		<meta name="DC.Creator.Address" content="<?php print $config['DC']['Creator.Address'] ?>" />
		<meta name="DC.Identifier" content="<?php print $config['DC']['Identifier'] ?>" />
		<meta name="DC.Rights" content="<?php print $config['DC']['Rights'] ?>" />
		
		<meta name="DC.Title" content="elementn: <?php print $page["title"]; ?>" />
		<meta name="DC.Type" content="<?php print $config['DC']['Type'] ?>" />
		<meta name="DC.Description" content="<?php print $config['DC']['Description'] ?>" />
		<meta name="DC.Subject.keyword" content="<?php print $config['DC']['Subject.keyword'] ?>" />
		
		<meta name="DC.Date.Created" content="<?php print $page['apsdb.creationTime'] ?>" />
		<meta name="DC.Date.Modified" content="<?php print $page['apsdb.lastModifiedTime'] ?>" />
		<meta name="DC.Language" content="English" />
		
		<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />

		<link rel="shortcut icon" href="workbench/images/favicon.png" type="image/png" />
	

		<?php 
			if ($config["developmentMode"]) { 
		?>
		<script type="text/javascript" src="lib/dojo/dojo/dojo.js" djConfig="parseOnLoad: false, isDebug: true"></script>
		<script type="text/javascript" src="lib/ApstrataSDK/apstrata/sdk/apstrata.js"></script>

		<style type="text/css">
			 @import "lib/dojo/dojo/resources/dojo.css";
		   	 @import "lib/dojo/dijit/themes/claro/claro.css";
		   	 @import "lib/dojo/dojox/widget/Dialog/Dialog.css";

	       		 @import "lib/ApstrataSDK/apstrata/ui/themes/apstrata/apstrata.css";
	       		 @import "themes/<?php print $config['template'] ?>/<?php print $config['template'] ?>.css";
       		 </style>
		
		<?php 
			} else { 
		?>
		<script type="text/javascript" src="lib/dojo/release/dojo/dojo/dojo.js.uncompressed.js" djConfig="parseOnLoad: false"></script>
		<script type="text/javascript" src="lib/dojo/release/dojo/dojo/apstratacms.js.uncompressed.js"></script>
		<script type="text/javascript" src="lib/ApstrataSDK/apstrata/sdk/apstrata.js"></script>
		
		<style type="text/css">
		        @import "lib/dojo/release/dojo/apstrata/ui/themes/apstrata/apstrata.css";
		        @import "lib/dojo/release/dojo/apstrata/themes/<?php print $config['template'] ?>/<?php print $config['template'] ?>-packaged.css";
	        </style>
		<?php 
			}
		?>
		
		<script type="text/javascript">
			if (dojo.isIE <= 8) {
				window.location = "browser.html";				
			}
		</script>
		
		
		<script type="text/javascript">
			dojo.require("dojo.parser")
			
			dojo.ready(function() {
		<?php 
			if ($config["developmentMode"]) { 
		?>
				dojo.registerModulePath("apstrata", "../../../lib/ApstrataSDK/apstrata")
				dojo.registerModulePath("apstrata.home", "../../../src/home")
				dojo.registerModulePath("apstrata.cms", "../../../src/cms")
			<?php 
			} else {
		?>	
			dojo.require("apstrata.sdk.Registry");
		<?php 
			}
		?>
		
//				dojo.require("apstrata.home.ApConfig")

				//
				// Get apstrata configuration from config.php
				//
				dojo.setObject("apstrata.apConfig", {
					"apstrata.cms": {
						baseUrl: '<?php print $GLOBALS["config"]["baseUrl"]; ?>' ,
						urlPrefix: '<?php print $GLOBALS["config"]["urlPrefix"]; ?>'						
					},
					
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


			})
		</script>


<!-- end: head.php -->
