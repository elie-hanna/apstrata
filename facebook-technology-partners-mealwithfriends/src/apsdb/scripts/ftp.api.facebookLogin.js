<script>
<scriptACL>
  <execute>anonymous</execute>
  <read>nobody</read>
  <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * Use this script to integrate your application to your facebook account.
 *** Common parameters ***
 * @param command: the function to execute in the script, i.e. "login", "getRequestToken" or "getAccessToken".
 * (1)Use login to log in using facebook. This command orchestrates the two others and should be the only one to be used
 * (2)Use getRequestToken to get an authorization url from facebook that you will paste into your browser.
 * (3)Use the getAccessToken to get an access token that you can use to authorize the application
 * @return of getRequestToken (upon success)
 * {
 *	status : "success",
 *	authorizationUrl : [URL_sent_by_facebook]
 * } 
 *** getAccessToken parameters ***
 * @param code: the oAuth verifier sent by facebook upon redirection to the callbackUrl
 * @return (upon success) 
 * {
 * 	status: "success",
 *	accessToken: [The_access_token_sent_by_facebook],
 *	login: the Apstrata login of the user
 *	hashedPwd: the Apstrata hashed password of the user
 *	  
 * }
 *** Response on error ***
 * @return (upon failure)
 * {
 * 	  status: "failure",
 * 	  errorDetail: [The_error_detail]
 * }
 */

try {

	var facebookManager = apsdb.require("social.facebookManager");
		
	// Since this script offers different capabilities (command), retrieve the needed command from the request	
	var command = request.parameters["command"];
	
	if (!command) {
		command = "login";
	}	
	
	/*
	 * Trigger the correct behavior according to the requested command	
	 */
	if (command == "login") {
	
		var authorizationUrl = facebookManager.getRequestToken(apsdb);
		apsdb.httpRedirect(authorizationUrl);
	}
			
	if (command == "getRequestToken") {
	
		var authorizationUrl = facebookManager.getRequestToken(apsdb);		
		return 	{
			status: "success",
			authorizationUrl: authorizationUrl
		}
	}
	
	if (command == "getAccessToken") {
			
		var accessToken = facebookManager.getAccessToken(apsdb, request);		
		if (accessToken) {
		
			// we need to either create a new user of update it with the new token
			var userLoginHashedPwd = _updateUserInfo(apsdb, accessToken);
			
			// return 
			return {
			
				"status": "success",
				"accessToken": accessToken,
				"login": userLoginHashedPwd.login,
				"hashedPwd": userLoginHashedPwd.hashedPassword
			}
		}else {
			throw {
			
				"errorCode": "PERMISSION_DENIED",
				"errorDetail": "No access token was retrieved"
			}
		}	
	}
	
	throw {
	
		"errorCode": "INVALID_PARAMETER",
		"errorDetail": "Invalid command name : " + command
	}
} catch (e) {

	if (e.status) {
		return e;
	}
	
	return {status: "failure", errorDetail: e}
}
	

function _updateUserInfo(apsdb, accessToken) {

	var common = apsdb.require("ftp.common");
	var resourceUrl = "https://graph.facebook.com/me";
	
	// Retrieve the user's information from faceboo, using the authentication token
	var userInfo = apsdb.social.facebook.callApi(common.appKey, common.appSecret, accessToken, "GET", resourceUrl, {});
	if (userInfo.metadata.status == "failure") {
		throw userInfo.metadata;
	}
	
	// Try to find a user with facebook's username
	var userManager = apsdb.require("ftp.userManager");
	var user = userManager.getUser(apsdb, userInfo.result.username);
	
	// If the user does not exist, we need to create one using the facebook info
	if (!user) {
	
		var userDTO = {
		
			"login": userInfo.result.username,
			"name": userInfo.result.first_name + " " + userInfo.result.last_name,
			"email": userInfo.result.email,
			"accessToken": accessToken,
			"facebookid": userInfo.result.id
		}
		
		return userManager.createUser(apsdb, userDTO);
	}else {
	
		// if the user exists, we need to update his access token
		var userDTO = {
		
			"login": userInfo.result.username,
			"accessToken": accessToken
		}
		
		return userManager.updateUser(apsdb, userDTO);
	}	
}

]]>
</code>
</script>