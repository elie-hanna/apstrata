<?php

	$config = array (
		// 
		// Apstrata backend connection parameters
		//
		"apstrataServiceURL" => "https://varick.apstrata.com/apsdb/rest",
		"apstrataConnectionTimeout" => 30000,
		"apstrataKey" => "E83D22E93F",
		"apstrataSecret" => "",		

		//
		// Apstrata stores used by code
		//
		"contentStore" => "apstrata",

		//
		// Config params useful during development
		//
		"developmentMode" => false,
		"useStub" => false,
		"autoLogin" => false,

		//
		// URLs and other related values used to compose paths by the php CMS code 
		//
		//"baseUrl" => "http://localhost/ApstrataCMS",
		"baseUrl" => "http://www2.apstrata.com",
		"urlPrefix" => "page.php?pageId=",
		"loginUrl" => "dashboard",
		"docroot" => $_SERVER["DOCUMENT_ROOT"]."/ApstrataCMS",
   		"workbenchUrl" => "http://workbench.apstrata.com",
		"targetClusterUrl" => "https://varick.apstrata.com/apsdb/rest",

		//
		// Controls caching parameters in /page.php
		//
		"cachingHeaders" => "false",
		"cachingAge" => 3000,

		//
		// Controls the template folder and CSS root class used by the site
		//
		"template" => "min"
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

