<script>
<scriptACL>
  <execute>anonymous</execute>
  <read>nobody</read>
  <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * Calls facebook in order to retrieve an oAuth verifier. Facebook will redirect the call
 * to the provided callbackUrl. Use the returned autorization URL to route the user to the
 * facebook login
 * @param callbackUrl (optional): the URL that will be called back by facebook after the user logs in
 * If this parameter is not provided, the script will take the default value from the ftp.common file
 * @return:
 * If successful 
 * {
 *	"status":"success",
 *	"authorizationUrl": "the_url"
 * }
 * On failure
 * @throws
 * { "status" = "failure", "errorCode": "some_error_code", "error_detail": "some_error_detail" }
 */
function getRequestToken(apsdb, callbackUrl) {
	
	// Get the details of the targetted application
	var appDetails = _getApplicationDetails(apsdb);
	
	// Add the appKey and next command to run to the callback url
	var callbackUrl = _buildCallbackUrl(appDetails.appKey, callbackUrl ? callbackUrl : appDetails.callbackUrl);
	var response = apsdb.social.facebook.getRequestToken(appDetails.appKey, appDetails.secret, callbackUrl, appDetails.scope, appDetails.facebookStatus);
	if (response.metadata.status == "success") {
		return response.result.authorizationUrl;
	}else {
		throw response.metadata;
	}
}

/*
 * Call the getAccessToken API and returns the access token
 * (field = "facebook" + appKey, value = token)
 * @param request: the callback request from facebook
 * @return the access token if user granted permissions
 * @throws{ // if the user did not grant requested permissions on his account
 * 	errorCode: "user_denied",
 *	errorDetail: "Permissions error"
 * }
 */
function getAccessToken(apsdb, request) {

	// first, verify if facebook returned an error and if so, throw an exception
	var errorCode = request.parameters["error_reason"];
	if (errorCode) {
	
		throw {
		
			"errorCode": errorCode,
			"errorDetail": request.parameters["error_description"]
		}
	}
	
	var appDetails = _getApplicationDetails(apsdb);
	var callBackUrl = request.parameters["callbackUrl"];
	
	// As per facebook's specifications, we need to re-send the same callback url
	var callbackUrl = _buildCallbackUrl(appDetails.appKey, callBackUrl ? callBackUrl : appDetails.callbackUrl);	
	var response = apsdb.social.facebook.getAccessToken(appDetails.appKey, appDetails.secret, callbackUrl, oAuth);	
	var appId = "facebook" + appDetails.appKey;
	if (response.result.accessToken) {		
		return response.result.accessToken;
	}else {		
		throw response.metadata;
	}	
}

/*
 * Verify if the accessToken passed as an argument is valid
 * @param accessToken: the oAuth token received from Facebook
 * @return true or false
 */
function checkAccessToken(apsdb, accessToken) {

	var appDetails = _getApplicationDetails(apsdb);	
	var params = {
	
		"input_token": accessToken,
     		"access_token": appDetails.secret
	}	
	
	var response = apsdb.social.facebook.callApi(appDetails.appKey, appDetails.secret, accessToken, "GET", "https://graph.facebook.com/debug_token", params);
	if (response.metadata.status == "success") {	
		return response.result.data.is_valid;
	}else {
		return response.metadata;
	}
}

/*
 * Post to the wall of a user using his facebook id and access token
 * @param facebookid: the facebook identifier of the targeted user
 * @param accessToken: the access token to the facebook account of the user
 * @param message: the message to post (string)
 * @return { "result": { "id": "the_identifier_of_the_facebook_message"}}
 */
function post(apsdb, facebookid, accessToken, message) {

	var url = "https://graph.facebook.com/" + facebookid + "/feed";
	var params = {
		"message": message,
	}
	
	var common = apsdb.require("ftp.common");
	return apsdb.social.facebook.callApi(common.appKey, common.secret, accessToken, "POST", url, params);
}

/*
 * Gets the details of the application we need to integrate with. 
 * These details will be retrieved from the request.
 * If this is not the case, falls back to the default values
 * @return application detail object {secret, callbackUrl, scope, facebookStatus}
 */
function _getApplicationDetails(apsdb) {

	var common = apsdb.require("ftp.common");
	return {
	
		"appKey": common.appKey,
		"secret": common.secret,
		"callbackUrl": common.callbackUrl,
		"scope": common.scope,
		"facebookStatus": common.facebookStatus
	}
}

/*
 * Utility function that build the callback url to send when invoking getRequestToken
 * @param pAppKey: the key of the facebook application
 * @param pCallbackUrl: the base url for the callback
 */
function _buildCallbackUrl(pAppKey, pCallbackUrl) {
	
	// Verify that a question mark is available in the callback url
	var ampersand = "&";
	if (pCallbackUrl.indexOf("?") < 0) {
		pCallbackUrl = pCallbackUrl + "?";
		ampersand = "";
	}
	
	// Add the appKey to the callback url so the called back script knows to what application it needs to map the received oAuth token
	pCallbackUrl = pCallbackUrl + ampersand + "appKey=" + pAppKey;
	
	// Add the next command to run to the callback url that will be sent to facebook
	pCallbackUrl = pCallbackUrl + "&command=getAccessToken";
		
	return pCallbackUrl;  //+ "/";
}
	
]]>
</code>
</script>