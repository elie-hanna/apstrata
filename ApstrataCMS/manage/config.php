<?php

	$config = array (
		"apstrataServiceURL" => "https://test-apps.apstrata.com/apsdb/rest",
		"apstrataKey" => "WC7A01F4C8",
		"apstrataSecret" => "",
		"contentStore" => "DefaultStore",
		"crmStore" => "",
		"developmentMode" => true,
		"useStub" => true,
		"apstrataConnectionTimeout" => 30000,
		"urlPrefix" => "page.php?pageId=",
		"template" => "min",
		"cachingHeaders" => "false",
		"cachingAge" => 3000,
		"targetClusterUrl" => "https://test-apps.apstrata.com/apsdb/rest",
    	"worbenchUrl" => "http://localhost/ApstrataDeveloperWorkbench/src/ui" 
	);
	
	// Dublin Core meta-data site-wide init
	$config["DC"] = array (
		"Title" => "apstrata",
		"Type" => "cloud, back end as a service, BaaS, mobile cloud, HTML5 cloud",
		"Description" => "HTML5 and mobile cloud back-end",
		"Subject.keyword" => "elementn, element&circ;n, apstrata, html5, saas, paas, baas, cloud computing, rich client, RIA",
		"Version" => "1",
		"Publisher" => "apstrata",
		"Creator" => "apstrata",
		"Creator.Address" => "apstrata",
		"Identifier" => "http://www.apstrata.com/",
		"Rights" => "Copyright, Copyright Statement (http://www.apstrata.com/terms)."
	);
?>

