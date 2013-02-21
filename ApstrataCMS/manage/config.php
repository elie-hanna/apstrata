<?php

	$config = array (
		// 
		// Apstrata backend connection parameters
		//
		"apstrataServiceURL" => "https://test-sandbox.apstrata.com/apsdb/rest",
		"apstrataConnectionTimeout" => 30000,
		"apstrataKey" => "YDEE622D6C",
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
		// Config params for jsConnect in order to establish SSO with apstrata forum
		//
		"jsConnectClientID" => "953217106",
		"jsConnectSecret" => "9f57204826f2830b8969e1e67f1cb401",

		//
		// URLs and other related values used to compose paths by the php CMS code 
		//
		"baseUrl" => "http://10.0.0.147/ApstrataCMS",
		//"baseUrl" => "http://www.apstrata.com",
		"urlPrefix" => "page.php?pageId=",
		"loginUrl" => "dashboard",
		"docroot" => $_SERVER["DOCUMENT_ROOT"]."/ApstrataCMS",
   		"workbenchUrl" => "http://workbench.apstrata.com",
		"targetClusterUrl" => "https://test-sandbox.apstrata.com/apsdb/rest",

		//
		// Controls caching parameters in /page.php
		//
		"cachingHeaders" => "false",
		"cachingAge" => 3000,

		//
		// Controls the template folder and CSS root class used by the site
		//
		"template" => "apstrata"
	);
	
	// Dublin Core meta-data site-wide init
	$config["DC"] = array (
		"Title" => "apstrata",
		"Type" => "cloud, back end as a service, BaaS, mobile cloud, HTML5 cloud",
		"Description" => "HTML5 and mobile cloud Back-end as a Service",
		"Subject" => "BAAS, back-end-as-a-service, backend-as-a-service, backend as a service, identity management, orchestration, custom workflow, database, security, facebook integration, twitter integration, open API, web services, fast development, ready-made, html5, SaaS, PaaS, cloud computing, rich client, RIA, iOS development, android development, mobile development, push notification",
		"Version" => "1",
		"Publisher" => "apstrata",
		"Creator" => "apstrata",
		"Creator.Address" => "apstrata",
		"Identifier" => "http://www.apstrata.com/",
		"Rights" => "Copyright, Copyright Statement (http://www.apstrata.com/pages/terms)."
	);
?>

