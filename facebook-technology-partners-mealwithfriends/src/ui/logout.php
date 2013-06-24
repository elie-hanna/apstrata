<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
	require_once 'lib/APSDB/APSDBClient.php';
	require_once 'lib/APSDB/APSDBConfig.php';
	require_once 'User.php';
	require_once 'util.php';

	// default value for the redirection URL
	$paramString = "/listMeals.php";
	
	// If a user is logged in, get its information from the cookie
	// invalidate the Apstrata token, then remove the user data from teh cookie
	if (isset($_COOKIE["user"])) {
		
		$user = unserialize($_COOKIE["user"]);
			
		// invalidate the Apstrata token by invoking the Apstrata "DeleteToken" API for the current user
		$params = array();
		$client = new APSDBClient(APSDBConfig :: $ACCOUNT_KEY, null, $user->getUserName(), false, $user->getApstrataToken());
		$resp = $client->callApi("DeleteToken", $params); 
		
		// Remove the user from cookies
		setcookie("user", "", time()-3600, "/", Util::$WEB_DOMAIN);
		
		// If a redirection URL is specified in the request parameters, get it
		if (isset($_REQUEST["paramString"])) {
			$paramString = $_REQUEST["paramString"];
		}	
	}
	
	// Redirect to the next URL
	print "<html><body onload='window.location.href=\"" . Util::$WEB_URL . "/" . $paramString . "\"'></body></html>";
	//header("location", Util::$WEB_URL . "/" . $paramString);
	
?> 