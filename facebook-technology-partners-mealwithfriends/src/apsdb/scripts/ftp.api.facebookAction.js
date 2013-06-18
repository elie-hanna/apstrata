<script>
<scriptACL>
  <execute>anonymous</execute>
  <read>nobody</read>
  <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * @param actionType: the name of the targeted facebook action type
 * @param objectType: the name of the facebook object type that is associated to the action type
 * @param docKey: the key of the document that is linked to the object type
 * @param accessToken (optional): the access token received from facebook for the current user
 */
try {
	
	var userManager = apsdb.require("ftp.userManager");
	var common = apsdb.require("ftp.common");
	
	// check if the user is authenticated, if not throw an exception
	if (!userManager.isUserAuthenticated(apsdb, request)) {
	
		throw {
		
			"errorCode": "PERMISSION_DENIED",
			"errorDetail": "You need to authenticate yourself using your app or your facebook credentials"
		}	
	}
	
	// get the login and account key of the user who sent the request, if any
	var currentUserLogin = userManager.getUserLoginFromRequest(apsdb, request);
	var accountKey = userManager.getUserAccountFromRequest(apsdb, request);
	
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

	var actionDTO = {
	
		"actionType":  request.parameters["actionType"],
		"objectType": request.parameters["objectType"],
	} 
	
	// check if a document key is passed, if so, extract corresponding data
	var docKey = request.parameters["docKey"];
	if (!docKey) {
	
		throw {
		
			"errorCode": "MISSING_PARAMETER",
			"errorDetail": "You need to pass the meal document key"
		}
	}
	
	var objectRef = common.apstrataUrl + accountKey + "/RunScript?apsws.time=" + new Date().getTime() + "&apsws.responseType=jsoncdp&apsdb.scriptName=ftp.api.getMeal&key=" + docKey + "&returnHTML=true";
	actionDTO.objectRef = objectRef;	
	
	// post action to facebook using Apstrata's APIs
	var facebookManager = apsdb.require("social.facebookManager");
	return facebookManager.executeAction(apsdb, user.facebookid, accessToken, actionDTO);
}catch(exception) {

	return {
	
		"status": "failure",
		"errorCode": exception.errorCode ? exception.errorCode: exception,
		"errorDetail": exception.errorDetail ? exception.errorDetail : ""
	}
}
	
]]>
</code>
</script>