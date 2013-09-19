<?php
	include_once ('manage/wikiProxyLib.php');
	$content = fetchContentFromWiki();
?>
	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
	<meta property="og:title" content="<?php echo $_REQUEST['api'] ?>" />
	<meta property="og:description" content="<?php echo extractTextFromWikiNode($content) ?>" />
	<meta property="og:image" content="<?php echo $config["baseUrl"]."/images/icons/".$_REQUEST['type']."/".$_REQUEST['api'].".png" ?>" />
	<title>"Apstrata Website"</title>

	<link rel="shortcut icon" href="<?php print "/themes/".$config['template'] ?>/images/favicon.ico" type="image/png" />
	<?php 
		if ($config["developmentMode"]) { 
	?>
	<style type="text/css">
		@import "../../lib/dojo/dojo/resources/dojo.css";
		@import "../../lib/dojo/dijit/themes/claro/claro.css";
		@import "../../lib/dojo/dojox/widget/Dialog/Dialog.css";

	        @import "../../lib/ApstrataSDK/apstrata/ui/themes/apstrata/apstrata.css";
	        @import "../../themes/<?php print $config['template'] ?>/<?php print $config['template'] ?>.css";
        </style>

	<?php 
		} else { 
	?>
		<style type="text/css">
		        @import "<?php echo $config["baseUrl"]?>/lib/dojo/release/dojo/apstrata/ui/themes/apstrata/apstrata.css";
		        @import "<?php echo $config["baseUrl"]?>/lib/dojo/release/dojo/apstrata/themes/<?php print $config['template'] ?>/<?php print $config['template'] ?>.css";
	        </style>

	<?php 
			}
		?>
