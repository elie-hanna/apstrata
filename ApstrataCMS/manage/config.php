<?php

	$config = array (
		"apstrataServiceURL" => "https://sandbox.apstrata.com/apsdb/rest",
		"apstrataKey" => "",
		"contentStore" => "",
		"crmStore" => "",
		"developmentMode" => false,
		"useStub" => true,
		"developmentMode" => false,
		"apstrataConnectionTimeout" => 30000,
		"urlPrefix" => "page.php?pageId=",
		"baseUrl" => "http://www.apstrata.com",
		"template" => "min",
		"cachingHeaders" => "false",
		"cachingAge" => 3000,
		"targetClusterUrl" => "",
    		"worbenchUrl" => "",
		"docroot" => $_SERVER["DOCUMENT_ROOT"]."/ApstrataCMS"
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

