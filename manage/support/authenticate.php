<?php
	include_once "./JWT.php";
	include_once "../config.php";
	
	
	// Check if a user is already signed in
	$login = '';
	$signedIn = false;
	if (isset($_COOKIE['apstrata_token_connection'])) {
		
		$cookie = json_decode($_COOKIE['apstrata_token_connection'], true);
		$login = $cookie['credentials']['user'];  
		
		//check if token has expired
		$time = time() * 1000;
		$tokenExpiryTime = $cookie['token']['creationTime'] + ($cookie['token']['expires'] * 1000);
		if ($tokenExpiryTime > $time) {
			$signedIn = true;
		} 
		
	} 
	
	// Fill in the user information 
	$user = array();
	if ($signedIn) {
		$user['name'] = $login;
		$user['email'] = $login;

		$key       = $config['jwtSecret'];
		$supportUrl = $config['supportUrl'];
		$now       = time();

		// Generate the JSON Web Token
		$token = array(
		  "jti"   => md5($now . rand()),
		  "iat"   => $now,
		  "name"  => $user['name'],
		  "email" => $user['email']
		);
		
		$jwt = JWT::encode($token, $key);
		
		// Redirect to support portal
		$returnToParam = $_REQUEST['return_to'];
		header("Location: " . $supportUrl . "/access/jwt?jwt=" . $jwt . "&name=" . $token['name'] . "&email=" . $token['email'] . "&timestamp=" . $token['iat'] . "&return_to=" . $returnToParam);
	} else {
		// Redirect to apstrata website login page
		$baseUrl = $config['baseUrl'];
		$urlPrefix = $config['urlPrefix'];
		$returnToParam = $_REQUEST['return_to'];
		$redirectTo =  urlencode($baseUrl . "/manage/support/authenticate.php?return_to=" . $returnToParam);
		header("Location: " . $baseUrl . "/" . $urlPrefix . "dashboard?redirectTo=" . $redirectTo);
	}
	
?>