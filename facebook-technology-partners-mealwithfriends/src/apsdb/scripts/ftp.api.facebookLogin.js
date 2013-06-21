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
 * (1)Use "login" to log in using facebook from a web application. This command orchestrates the two others.
 * (2)Use "getRequestToken" to get an authorization url from facebook that you will paste into your browser.
 * (3)Use the "getAccessToken" to get an access token that you can use to authorize the application
 *** login ***
 * @param accessToken(optional): if set, will check the token against facebook. If valid, will verify if 
 * a user currently exists for that token. If so, update the token and return the user login and hashed password
 * If the user did not exist, create him, and return the above
 * @param redirectAfterLogin (optional): if true, redirect either to the loggedInRedirectUrl if provided, 
 * @param loggedInRedirectUrl (optional): the URL where to redirect (if requested) further to successfully obtaining an access token
 * @param returnApstrataToken: if sent and set to true, will make the api return the Apstrata token (See below)
 * @return (upon success, if no redirection) 
 * {
 * 	status: "success",
 *	accessToken: the_access_token_sent_by_facebook,
 *	login: the Apstrata login of the user
 *	hashedPwd: the Apstrata hashed password of the user
 *	  
 * }
 * @return (upon success, if returnApstrataToken==true) 
 * {
 *	status: "success",
 *	"login": the Apstrata login of the user
 * 	"apsdb.authToken": "some_token", 
 *	"apsdb.tokenExpires": "time_in_seconds", 
 *	"apsdb.tokenLifetime": "time_in_seconds"
 * }
 * 
 *** getRequestToken ***
 * @param callbackUrl (optional): the URL that will be called back by Facebook after the user logs in 
 * If not provided, will use the url defined in "ftp.common"
 * Note: this URL has to be defined in the settings of the facebook app (Web site URL)
 * @param loggedInRedirectUrl (optional): the URL where to redirect (if requested) further to successfully obtaining an access token
 * if provided you do not need to set redirectAfterLogin
 * @param redirectAfterLogin (optional): if true, redirect either to the loggedInRedirectUrl if provided, 
 * or the one defined in "ftp.common"
 * @return of getRequestToken (upon success)
 * {
 *	status : "success",
 *	authorizationUrl : URL_sent_by_facebook
 * } 
 *** getAccessToken ***
 * @param code: the oAuth verifier sent by facebook upon redirection to the callbackUrl
 * @param callbackUrl (optional): : the URL that will be called back by Facebook after the user logs in 
 * Note: this has to be the same URL as the one provided when invoking "getRequestToken"
 * If not provided, will use the url defined in "ftp.common"
 * @param loggedInRedirectUrl (optional): the URL where to redirect (if requested) further to successfully obtaining an access token
 * @param redirectAfterLogin (optional): if true, redirect either to the loggedInRedirectUrl if provided, 
 * or the one defined in "ftp.common"
 * @param returnApstrataToken: if sent and set to true, will make the api return the Apstrata token (See below)
 * @return (upon success) 
 * {
 * 	status: "success",
 *	accessToken: the_access_token_sent_by_facebook,
 *	login: the Apstrata login of the user
 *	hashedPwd: the Apstrata hashed password of the user
 *	  
 * }
 * @return (upon success, if returnApstrataToken==true) 
 * {
 *	status: "success",
 *	"login": the Apstrata login of the user
 * 	"apsdb.authToken": "some_token", 
 *	"apsdb.tokenExpires": "time_in_seconds", 
 *	"apsdb.tokenLifetime": "time_in_seconds"
 * }
 * 
 *** Response on error ***
 * @return (upon failure)
 * {
 * 	status: "failure",
 *	errorCode: the_error_code
 * 	errorDetail: the_error_detail
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
	
		var accessToken = request.parameters["accessToken"];
		if (accessToken) {
		
			return _handleAccessToken(apsdb, accessToken);
		}else {
		
			var authorizationUrl = facebookManager.getRequestToken(apsdb, request);
			apsdb.httpRedirect(authorizationUrl);
		}
	}
			
	if (command == "getRequestToken") {
	
		var authorizationUrl = facebookManager.getRequestToken(apsdb, request);		
		return 	{
			status: "success",
			authorizationUrl: authorizationUrl
		}
	}
	
	if (command == "getAccessToken") {
		
		var accessToken = facebookManager.getAccessToken(apsdb, request);		
		if (accessToken) {
		
			return _handleAccessToken(apsdb, accessToken, request);
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

	if (e.metadata) {
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
			"facebookPicture": userInfo.result.picture,
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

function _handleAccessToken(apsdb, accessToken, request) {

	// we need to either create a new user of update it with the new token
	var userLoginHashedPwd = _updateUserInfo(apsdb, accessToken);
	
	// we need to check if redirection is requested			
	var redirect = request.parameters["redirectAfterLogin"];
	var redirectUrl = request.parameters["loggedInRedirectUrl"];	
	if (redirect && redirect == "true") { 	
	
		var common = apsdb.require("ftp.common");
		var returnApstrataToken = request.parameters["returnApstrataToken"];
		redirectUrl = redirectUrl ? redirectUrl : common.loggedInRedirectUrl;
		if (returnApstrataToken) {
		
			var userManager = apsdb.require("ftp.userManager");
			var apstrataToken = userManager.generateToken(apsdb, userLoginHashedPwd.login, userLoginHashedPwd.hashedPassword);
			redirectUrl = redirectUrl + "?apstrataToken=" + apstrataToken["apsdb.authToken"] + "&expiresAfter=" + apstrataToken["apsdb.tokenExpires"] + "&userName=" + userLoginHashedPwd.login;
		}else {
			redirectUrl = redirectUrl + "?accessToken=" + accessToken + "&login=" + userLoginHashedPwd.login + "&hashedPwd=" + userLoginHashedPwd.hashedPassword;
		}
			
		apsdb.httpRedirect(redirectUrl);				
	}
	
	// if no redirection required return 
	return {
	
		"status": "success",
		"accessToken": accessToken,
		"login": userLoginHashedPwd.login,
		"hashedPwd": userLoginHashedPwd.hashedPassword
	}
}

]]>
</code>
</script>