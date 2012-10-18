<?php
	include('./jsConnectFunctions.php');
	include('../config.php');

	// 1. Get your client ID and secret here. These must match those in your jsConnect settings.
	$clientID = $config['jsConnectClientID'];
	$secret = $config['jsConnectSecret'];


	// 2. Check if a user is already signed in
	$login = '';
	if (isset($_COOKIE['apstrata_token_connection'])) {
		$cookie = json_decode($_COOKIE['apstrata_token_connection'], true);
		$login = $cookie['credentials']['user'];  
		$signedIn = true;
	} else {
		$signedIn = false;
	}
	

	// 3. Fill in the user information in a way that Vanilla can understand.
	$user = array();
	if ($signedIn) {
	   $user['uniqueid'] = $login;
	   $user['name'] = $login;
	   $user['email'] = $login;
	   $user['photourl'] = '';
	}

	// 4. Generate the jsConnect string.
	// This should be true unless you are testing. 
	// You can also use a hash name like md5, sha1 etc which must be the name as the connection settings in Vanilla.	
	$secure = true; 
	WriteJsConnect($user, $_GET, $clientID, $secret, $secure);
?>