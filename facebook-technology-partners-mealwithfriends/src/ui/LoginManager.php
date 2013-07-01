<?php

	require_once 'lib/APSDB/APSDBClient.php';
	require_once 'lib/APSDB/APSDBConfig.php';
	require_once 'User.php';
	require_once 'util.php';
	
	class LoginManager  {
		
		/*
		 * Check if a cookie exist with user information. If so, unserialize it and use
		 * the value to create an instance of User.
		 * If no user cookie was found, check is the request object contains an Apstrata
		 * token. If so, use it to create an instance of User, serialize the latter and
		 * store it in a "user" cookie. Also add the Apstrata token as a separate cookie
		 */
		public static function handleUser() {
			
			$user = null;
			if (isset($_COOKIE["user"])) {
				$user = unserialize($_COOKIE["user"]);	
			}
			
			$apstrataToken = isset($_REQUEST["apstrataToken"]) ? $_REQUEST["apstrataToken"] : null;
		    $isApstrataTokenValid = $apstrataToken != null ? User::isTokenValid($_REQUEST["userName"], $apstrataToken) : false;
			if ($isApstrataTokenValid == true && $user == null) {
			      		
				$user = new User($_REQUEST["userName"], null, null, $apstrataToken);
				setcookie("user", serialize($user),  time() + $_REQUEST["expiresAfter"], "/", Util::$WEB_DOMAIN);
				setcookie("apstrataToken", $apstrataToken . ";" . $user->getUserName(), time() + $_REQUEST["expiresAfter"], "/", Util::$WEB_DOMAIN);
			}
			
			return $user;			
		}		
		
		/*
		 * Check if a cookie exist with user information. If so, remove it along the Apstrata token cookie.
		 */
		public static function logout() {
						
			// If a user is logged in, get its information from the cookie
			// invalidate the Apstrata token, then remove the user data from teh cookie
			if (isset($_COOKIE["user"])) {
				
				$user = unserialize($_COOKIE["user"]);
					
				// invalidate the Apstrata token by invoking the Apstrata "DeleteToken" API for the current user
				$params = array();
				$client = new APSDBClient(APSDBConfig :: $ACCOUNT_KEY, null, $user->getUserName(), false, $user->getApstrataToken());
				$resp = $client->callApi("DeleteToken", $params); 
				
				// Remove the user and the Apstrata token from cookies 
				setcookie("user", "", time()-36000, "/", Util::$WEB_DOMAIN);
				setcookie("apstrataToken", "", time()-36000, "/", Util::$WEB_DOMAIN);				
			}			
		}
	}
	
?>