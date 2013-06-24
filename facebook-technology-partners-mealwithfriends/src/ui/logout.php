<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
	require_once 'lib/APSDB/APSDBClient.php';
	require_once 'lib/APSDB/APSDBConfig.php';
	require_once 'User.php';
	require_once 'util.php';
	require_once 'LoginManager.php';

	// default value for the redirection URL
	$paramString = "/listMeals.php";
		
	// If a redirection URL is specified in the request parameters, get it
	if (isset($_REQUEST["paramString"])) {
		$paramString = $_REQUEST["paramString"];
	}	
	
	LoginManager::logout();
	
	// Redirect to the next URL
	print "<html><body onload='window.location.href=\"" . Util::$WEB_URL . "/" . $paramString . "\"'></body></html>";
	//header("location", Util::$WEB_URL . "/" . $paramString);
	
?> 