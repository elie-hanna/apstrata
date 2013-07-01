<script>
<scriptACL>
  <execute>authenticated-users</execute>
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
	
	var userManager = apsdb.require("social.fb.userManager");
	var common = apsdb.require("social.fb.common");
	
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
		accessToken = user.user.accessToken;
	}else {
		user = userManager.findUserFromToken(apsdb, accessToken);
	}
	
	var actionDTO = {};
	for (var param in request.parameters) {
		
		if (_isPostParameter(param)) {		
		
			try {	
				actionDTO[param] = JSON.parse(request.parameters[param]);
			}catch(exception){
				actionDTO[param] = request.parameters[param];
			}
		}
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
	actionDTO["fb:explicitly_shared"]="true";	
	
	// post action to facebook using Apstrata's APIs
	var facebookManager = apsdb.require("social.fb.facebookManager");
	var response = facebookManager.executeAction(apsdb, user.facebookid, accessToken, actionDTO);
	var headers = {"Access-Control-Allow-Origin": "*"};
	apsdb.httpRespond(JSON.stringify(response), 200, headers);
}catch(exception) {

	return {
	
		"status": "failure",
		"errorCode": exception.errorCode ? exception.errorCode: exception,
		"errorDetail": exception.errorDetail ? exception.errorDetail : ""
	}
}

function _isPostParameter(parameter) {

	if (parameter.indexOf("apsdb") > -1 || parameter.indexOf("apsws") > -1) {
		return false;
	}
	
	if (parameter == "accessToken") {
		return false;
	}
	
	return true;
}	
	
]]>
</code>
</script>