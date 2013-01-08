<?php
	include("../../../manage/config.php");
?>


<script type="text/javascript" src="../../../lib/dojo/dojo/dojo.js" djConfig="parseOnLoad: false, isDebug: true"></script>
<script type="text/javascript" src="../../../lib/ApstrataSDK/apstrata/sdk/apstrata.js"></script>

<link rel="stylesheet" href="./reset.css">
<link rel="stylesheet" href="./styles.css">

<script type="text/javascript">
	dojo.ready(function() {
		dojo.registerModulePath("apstrata", "../../ApstrataSDK/apstrata");
		dojo.registerModulePath("apstrata.home", "../../../src/home");
		
		dojo.require("apstrata.home.Carousel");
		
		var items = [
			{section1: '<div class="control control1"><div class="arrow"></div><h5>11111 what is touch cloud?</h5><div class="">11111 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', section2: '<div class="control control1"><div class="arrow"></div><h5>11111 what is touch cloud?</h5><div class="">11111 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', title: "Title 1", regularIcon: "<?php print $config['baseUrl'] ?>" + "/themes/cms/resources/bin-full.png"},
			{section1: '<div class="control control1"><div class="arrow"></div><h5>22222 what is touch cloud?</h5><div class="">22222 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', section2: '<div class="control control1"><div class="arrow"></div><h5>22222 what is touch cloud?</h5><div class="">22222 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', title: "Title 2", regularIcon: "<?php print $config['baseUrl'] ?>" + "/themes/cms/resources/bin-full.png"},
			{section1: '<div class="control control1"><div class="arrow"></div><h5>33333 what is touch cloud?</h5><div class="">33333 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', section2: '<div class="control control1"><div class="arrow"></div><h5>33333 what is touch cloud?</h5><div class="">33333 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', title: "Title 3", regularIcon: "<?php print $config['baseUrl'] ?>" + "/themes/cms/resources/bin-full.png"},
			{section1: '<div class="control control1"><div class="arrow"></div><h5>44444 what is touch cloud?</h5><div class="">44444 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', section2: '<div class="control control1"><div class="arrow"></div><h5>44444 what is touch cloud?</h5><div class="">44444 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', title: "Title 4", regularIcon: "<?php print $config['baseUrl'] ?>" + "/themes/cms/resources/bin-full.png"},
		];

		var carousel = new apstrata.home.Carousel({
			items: items
		}, dojo.byId("carouselContainer") );
		
		dojo.parser.parse();
	})
</script>

<div id="carouselContainer">
</div>