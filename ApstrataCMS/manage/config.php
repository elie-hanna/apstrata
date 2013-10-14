<?php
	$config = array (
		// 
		// Apstrata backend connection parameters
		// YDEE622D6C//dev account 
		"apstrataServiceURL" => "https://10.0.0.93:8446/apstratabase/rest",
		"apstrataConnectionTimeout" => 30000,
// 		"apstrataKey" => "YDEE622D6C",
		"apstrataKey" => "K380F5E7DF",
		"apstrataSecret" => "",		

		//
		// Apstrata stores used by code
		//
		"contentStore" => "apstrata",

		//
		// Config params useful during development
		//
		"developmentMode" => true,
		"useStub" => false,
		"autoLogin" => false,
		
		//
		// Config params for jsConnect in order to establish SSO with apstrata forum
		//
		"jsConnectClientID" => "953217106",
		"jsConnectSecret" => "9f57204826f2830b8969e1e67f1cb401",
		
		//
		// Secret for JWT token authentication in order to establish SSO with the apstrata support portal, and other support related properties
		//
		"jwtSecret" => "6HxNLjp6KqHZKqNUFyPYpDdKA6jkpZU6FXkwl6d2NISwX4uX",
		"supportUrl" => "http://support.apstrata.com",
		

		//
		// URLs and other related values used to compose paths by the php CMS code 
		//
		"baseUrl" => "http://localhost/apstrataCMS",
		"urlPrefix" => "",
		"cmsBasePath" => "/",
		"loginUrl" => "dashboard",
		"docroot" => $_SERVER["DOCUMENT_ROOT"]."/apstrataCMS",
   		"workbenchUrl" => "http://workbench.apstrata.com",
		"targetClusterUrl" => "https://sandbox.apstrata.com/apsdb/rest",

		//
		// Controls caching parameters in /page.php
		//
		"cachingHeaders" => "false",
		"cachingAge" => 3000,

		//
		// Controls the template folder and CSS root class used by the site
		//
		"template" => "touch"
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