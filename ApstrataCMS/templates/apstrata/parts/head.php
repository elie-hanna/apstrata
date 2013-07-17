<!-- start: head.php -->		
		
	    <link rel="shortcut icon" href="<?php print $GLOBALS["config"]["baseUrl"]; ?>/themes/<?php print $config['template'] ?>/images/favicon.ico" type="image/png" />

		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		
		<!-- Dublin Core Metadata -->
		<?php print $page['searchEngineMetaTags'] ?>
		
		<meta name="DC.Date.Created" content="<?php print $page['apsdb.creationTime'] ?>" />
		<meta name="DC.Date.Modified" content="<?php print $page['apsdb.lastModifiedTime'] ?>" />
		
		<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />

		<!-- start of google analytics -->		
		<script type="text/javascript">

		  var _gaq = _gaq || [];
		  _gaq.push(['_setAccount', 'UA-29923411-1']);
		  _gaq.push(['_setDomainName', 'apstrata.com']);
		  _gaq.push(['_trackPageview']);
		
		  (function() {
		    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		  })();
		
		</script>
		<!-- end of google analytics -->

		<?php 
			if ($config["developmentMode"]) { 
		?>
		<script type="text/javascript" src="<?php print $GLOBALS["config"]["baseUrl"]; ?>/lib/dojo/dojo/dojo.js" djConfig="parseOnLoad: false, isDebug: true"></script>
		<script type="text/javascript" src="<?php print $GLOBALS["config"]["baseUrl"]; ?>/lib/ApstrataSDK/apstrata/sdk/apstrata.js"></script>

		<style type="text/css">

	       		 @import "<?php print $GLOBALS["config"]["baseUrl"]; ?>/lib/ApstrataSDK/apstrata/ui/themes/apstrata/apstrata.css"; 
	       		 @import "<?php print $GLOBALS["config"]["baseUrl"]; ?>/themes/<?php print $config['template'] ?>/<?php print $config['template'] ?>.css";
       		 </style>
		
		<?php 
			} else { 
		?>
		<script type="text/javascript" src="<?php print $GLOBALS["config"]["baseUrl"]; ?>/lib/dojo/release/dojo/dojo/dojo.js" djConfig="parseOnLoad: false"></script>
		<script type="text/javascript" src="<?php print $GLOBALS["config"]["baseUrl"]; ?>/lib/dojo/release/dojo/dojo/apstratacms.js"></script>
		<script type="text/javascript" src="<?php print $GLOBALS["config"]["baseUrl"]; ?>/lib/ApstrataSDK/apstrata/sdk/apstrata.js"></script>
		
		<style type="text/css">
		        @import "<?php print $GLOBALS["config"]["baseUrl"]; ?>/lib/dojo/release/dojo/apstrata/ui/themes/apstrata/apstrata.css";
		        @import "<?php print $GLOBALS["config"]["baseUrl"]; ?>/lib/dojo/release/dojo/apstrata/themes/<?php print $config['template'] ?>/<?php print $config['template'] ?>-packaged.css";
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
				dojo.registerModulePath("apstrata.extend", "../../../widgets/apstrata")
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

				//check if already logged in and display the logout link
			    dojo.require("apstrata.sdk.TokenConnection");
				var theConnectionData = {
						credentials: {
							key: '<?php print $GLOBALS["config"]["apstrataKey"]; ?>'								
						},
						serviceURL: '<?php print $GLOBALS["config"]["apstrataServiceURL"]; ?>',
						defaultStore: '<?php print $GLOBALS["config"]["contentStore"]; ?>',
						timeout: parseInt('<?php print $GLOBALS["config"]["apstrataConnectionTimeout"]; ?>')
					}
					
				var theConnection = new apstrata.sdk.TokenConnection();
					
				if (theConnection.isLoggedIn()) {
					dojo.style(dojo.query(".login")[0], "display", "none");
					dojo.style(dojo.query(".dashboard")[0], "display", "block");
				} else {
					dojo.style(dojo.query(".dashboard")[0], "display", "none");					
					dojo.style(dojo.query(".login")[0], "display", "block");
				}

			})

		</script>


<!-- end: head.php -->
