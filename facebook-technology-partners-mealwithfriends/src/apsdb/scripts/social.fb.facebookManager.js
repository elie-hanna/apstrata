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
 * @param the request sent by the app
 * If this parameter is not provided, the script will take the default value from the social.fb.common file
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
function getRequestToken(apsdb, request) {
	
	// Get the optional callback url
	var callbackUrl = request ? request.parameters["callbackUrl"] : null;
	
	// Get the details of the targetted application
	var appDetails = _getApplicationDetails(apsdb);
	
	// Get the optional url to redirect to upon login
	var redirect = request ? request.parameters["redirectAfterLogin"] : "false";
	var loggedInRedirectUrl = request ? request.parameters["loggedInRedirectUrl"] : null;
	if (redirect == "true") {
		loggedInRedirectUrl = loggedInRedirectUrl ? loggedInRedirectUrl : common.loggedInRedirectUrl;
	}
		
	// Add the appKey and next command to run to the callback url
	var callbackUrl = _buildCallbackUrl(appDetails.appKey, callbackUrl ? callbackUrl : appDetails.callbackUrl, loggedInRedirectUrl);
	if (request.parameters["returnApstrataToken"]) {
		callbackUrl = callbackUrl + "&returnApstrataToken=" + request.parameters["returnApstrataToken"];
	}
	
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
	
	// Get the optional url to redirect to upon login
	var redirect = request.parameters["redirectAfterLogin"];
	var loggedInRedirectUrl = request.parameters["loggedInRedirectUrl"];
	if (redirect) {
		loggedInRedirectUrl = loggedInRedirectUrl ? loggedInRedirectUrl : common.loggedInRedirectUrl;
	}
	
	// As per facebook's specifications, we need to re-send the same callback url
	var callbackUrl = _buildCallbackUrl(appDetails.appKey, callBackUrl ? callBackUrl : appDetails.callbackUrl, loggedInRedirectUrl);	
	if (request.parameters["returnApstrataToken"]) {
		callbackUrl = callbackUrl + "&returnApstrataToken=" + request.parameters["returnApstrataToken"];
	}
	
	var response = apsdb.social.facebook.getAccessToken(appDetails.appKey, appDetails.secret, callbackUrl, request.parameters["code"]);	
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
 * On failure
 * @throws
 * { "status" = "failure", "errorCode": "some_error_code", "error_detail": "some_error_detail" }
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
 * @param postDTO: the parameters to post
 * @return { "result": { "id": "the_identifier_of_the_facebook_post"}}
 * On failure
 * @throws
 * { "status" = "failure", "errorCode": "some_error_code", "error_detail": "some_error_detail" }
 */
function post(apsdb, facebookid, accessToken, postDTO) {

	var fbObjects = ["actions", "properties", "to"];
	var url = "https://graph.facebook.com/" + facebookid + "/feed";		
	var common = apsdb.require("social.fb.common");
	for(var property in postDTO) {
	
		if (fbObjects.indexOf(property) > -1) {
			postDTO[property] = JSON.stringify([].concat(postDTO[property]));
		}
		
		if (property == "place") {
			postDTO[property] = JSON.stringify(postDTO[property]);
		}
	}
	
	var response = apsdb.social.facebook.callApi(common.appKey, common.secret, accessToken, "POST", url, postDTO);
	if (response.metadata.status == "success") {	
		return response;
	}else {
		return response.metadata;
	}
}

/*
 * Executes a custom action on the account of the facebook user
 * @param facebookid: the facebook identifier of the targeted user (optional)
 * @param accessToken: the access token to the facebook account of the user
 * @param actionDTO: the parameters of the action, i.e: (https://developers.facebook.com/docs/opengraph/using-actions/#publish)
 * {
 * 	"actionType": the_name_of_the_action_type,
 *	"objectType": the_name_of_the_object_type,
 *	"objectRef": the_url_to_the_object_need_by_the_action
 * ...
 * }
 * @return { "result": { "id": "the_identifier_of_the_facebook_action_execution"}}
 * On failure
 * @throws
 * { "status" = "failure", "errorCode": "some_error_code", "error_detail": "some_error_detail" }
 */
function executeAction(apsdb, facebookid, accessToken, actionDTO) {

	var fbObjects = ["place", "tags"];
	var common = apsdb.require("social.fb.common");
	//var url = "https://graph.facebook.com/" + facebookid + "/" + common.appNameSpace + ":" + actionDTO.actionType;
	var url = "https://graph.facebook.com/me/" + common.appNameSpace + ":" + actionDTO.actionType;	
	var params = {};
	params[actionDTO.objectType] = actionDTO.objectRef;
	params["fb:explicitly_shared"] = actionDTO["fb:explicitly_shared"];
	
	for(var property in actionDTO) {
		if (property != "objectType") {
		
			if (fbObjects.indexOf(property) > -1) {
				params[property] = JSON.stringify(actionDTO[property]);
			}else {
				params[property] = actionDTO[property];
			}		
		}
	} 
	
	var response = apsdb.social.facebook.callApi(common.appKey, common.secret, accessToken, "POST", url, params);
	if (response.metadata.status == "success") {	
		return response;
	}else {
		return response.metadata;
	}
}

/*
 * @param facebookid (optional): the facebook identifier of the targeted user (optional)
 * @param accessToken: the access token to the facebook account of the user
 * @param paging(optional): in case of pagination, { "__after_id": the friend id to start from, "limit": fb_limit, "offset": fb_offset}
 * @return 
 * On failure
 * @throws
 * { "status" = "failure", "errorCode": "some_error_code", "error_detail": "some_error_detail" }
 */
function getFriends(apsdb, facebookid, accessToken, paging) {

	var common = apsdb.require("social.fb.common");
	var url = "https://graph.facebook.com/me/friends";
	var params = paging ? paging : {}
	var response = apsdb.social.facebook.callApi(common.appKey, common.secret, accessToken, "GET", url, params);
	if (response.metadata.status == "success") {	
		return response;
	}else {
		return response.metadata;
	}
}

/*
 * @param facebookid (optional): the facebook identifier of the targeted user (optional)
 * @param accessToken: the access token to the facebook account of the user
 * @param searchDTO: the object holding the search criteria {"name":"some_name"}
 * @return
 * { "result": {  "data": [  {"uid": "some_uid", "name": "some_name", "pic_small": "url_to_profile_pic"}, ... ]}}
 * On failure
 * @throws
 * { "status" = "failure", "errorCode": "some_error_code", "error_detail": "some_error_detail" }
 */
function searchFriendsByName(apsdb, facebookid, accessToken, searchDTO) {

	var common = apsdb.require("social.fb.common");
	var fqlQuery = "select uid, name, pic_small, profile_url from user where uid in (SELECT uid2 FROM friend WHERE uid1 = me())and (strpos(lower (name),'" + searchDTO.name + "')>=0 OR strpos(name,'" + searchDTO.name + "')>=0)";
	var url = "https://graph.facebook.com/fql";
	var params = {
		"q": fqlQuery
	}
	
	var response = apsdb.social.facebook.callApi(common.appKey, common.secret, accessToken, "GET", url, params);
	if (response.metadata.status == "success") {	
		return response;
	}else {
		return response.metadata;
	}
} 

/*
 * Gets the details of the application we need to integrate with. 
 * These details will be retrieved from the request.
 * If this is not the case, falls back to the default values
 * @return application detail object {secret, callbackUrl, scope, facebookStatus}
 */
function _getApplicationDetails(apsdb) {

	var common = apsdb.require("social.fb.common");
	return {
	
		"appKey": common.appKey,
		"secret": common.secret,
		"callbackUrl": common.callbackUrl,
		"scope": common.scope,
		"facebookStatus": common.facebookStatus,
		"loggedInRedirectUrl": common.loggedInRedirectUrl
	}
}

/*
 * Utility function that build the callback url to send when invoking getRequestToken
 * @param pAppKey: the key of the facebook application
 * @param pCallbackUrl: the base url for the callback
 * @param pLoggedInRedirectUrl (optional): the url to redirect to when logged in
 */
function _buildCallbackUrl(pAppKey, pCallbackUrl, pLoggedInRedirectUrl) {
	
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
	
	// if available, add the redirect url
	pCallbackUrl = pLoggedInRedirectUrl ? pCallbackUrl + "&redirectAfterLogin=true&loggedInRedirectUrl=" + encodeURIComponent(pLoggedInRedirectUrl) : pCallbackUrl;
	return pCallbackUrl;  //+ "/";
}
	
]]>
</code>
</script>