<script>
<scriptACL>
  <execute>authenticated-users</execute>
  <read>nobody</read>
  <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * Use this script to post of the requestor's wall on facebook. Although the script has an excecute
 * ACL set to anonymous, users sending the request need to be authenticated. They can do this
 * either by signing the request using their Apstrata credentials, or by passing a valid facebook access
 * token as a parameter of the request.
 * @param message: the message to post (optional). If empty, will post a blank
 * @param docKey(optional): the key of the meal document from which data will be retrieved for the post
 * @param link (optional): a link on which users can click from the post
 * @param accessToken (optional): the facebook access token of the requestor 
 * @return 
 * if successful, {"result": {"id": "the_facebook_id_of_the_posted_message"}}
 * if failure because the user is not authenticated:
 * {"result": {"status":"failure", "errorCode": "PERMISSION_DENIED", "errorDetail": "some_details"}}
 * if failure because the request is signed with account owner crendentials:
 * {"result": {"status":"failure", "errorCode": "INVALID_USER", "errorDetail": "some_details"}}
 * if failure because of any other reason
 * {"result": {"status":"failure", "errorCode": "some_code", "errorDetail": "some_details"}}
 */
try {
	
	var userManager = apsdb.require("social.fb.Manager");
	
	// check if the user is authenticated, if not throw an exception
	if (!userManager.isUserAuthenticated(apsdb, request)) {
	
		throw {
		
			"errorCode": "PERMISSION_DENIED",
			"errorDetail": "You need to authenticate yourself using your app or your facebook credentials"
		}	
	}
	
	// get the login of the user who sent the request, if any
	var currentUserLogin = userManager.getUserLoginFromRequest(apsdb, request);
	
	// the script should not be called as an account owner
	if (currentUserLogin.indexOf("#") > 1) {
	
		throw {
		
			"errorCode": "INVALID_USER",
			"errorDetail": "You cannot use this API as an account owner"
		}
	}	
	
	// get the data on the user who sent the request, either using his login if available or his access token
	var user = null;
	var accessToken = request.parameters["accessToken"]
	if (currentUserLogin != "anonymous") {
		user = userManager.getUser(apsdb, currentUserLogin);
	}else {
		user = userManager.findUserFromToken(apsdb, accessToken);
	}

	var postDTO = {};

	// retrieve the post message from the request
	var message = request.parameters["message"] ? request.parameters["message"] : "";
	
	// check if a document key is passed, if so, extract corresponding data
	var docKey = request.parameters["docKey"];
	if (docKey) {
	
		postDTO = _getMealData(apsdb, docKey);
	}
	
	// retrieve the link if any
	var link = request.parameters["link"];
	if (link) {
		postDTO["link"] = link;
	}
	
	postDTO["message"] = message;
		
	// post to facebook using Apstrata's APIs
	var facebookManager = apsdb.require("social.fb.facebookManager");
	return facebookManager.post(apsdb, user.facebookid, accessToken, postDTO);
}catch(exception) {

	return {
	
		"status": "failure",
		"errorCode": exception.errorCode ? exception.errorCode: exception,
		"errorDetail": exception.errorDetail ? exception.errorDetail : ""
	}
}

function _getMealData(apsdb, key) {

	var mealManager = apsdb.require("ftp.mealManager");
	var doc = mealManager.getMeal(apsdb, {"key": docKey});
	var picName = ([].concat(doc.pictures))[0];
	var userManager = apsdb.require("social.fb.userManager");
	var accountKey = userManager.getUserAccountFromRequest(apsdb, request);
	var common = apsdb.require("ftp.common");
	var picUrl = common.buildLinkToFile(apsdb, accountKey, doc.key, "pictures", picName);	
	return {
	
		"picture": picUrl,
		"name": doc.recipeName,
		"caption":  doc.recipeName,
		"description": doc.description
	}
}	
	
]]>
</code>
</script>