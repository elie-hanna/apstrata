<script>
<scriptACL>
  <execute>authenticated-users</execute>
  <read>nobody</read>
  <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * Use this script to search for places on Facebook
 * @param query (mandatory): the query string to send (e.g. "office")
 * @param center (optional): the lattitude and longitude from where to start the search
 * @param distance (optional): the radius from the center to narrow the search
 * @param fields (optional): the fields to return 
 * @param any other parameter available from Facebook
 * (check Facebook's documentation for more https://developers.facebook.com/docs/reference/api/search/#types)
 * @return
 * { "result": {  "data": [  {"uid": "some_uid", "name": "some_name", "pic_small": "url_to_profile_pic"}, ... ]}}
 * On failure
 * @throws
 * { "status" = "failure", "errorCode": "some_error_code", "error_detail": "some_error_detail" }
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

	var searchDTO = {};

	for (var param in request.parameters) {
		
		if (_isPostParameter(param)) {		
		
			try {	
				searchDTO[param] = JSON.parse(request.parameters[param]);
			}catch(exception){
				searchDTO[param] = request.parameters[param];
			}
		}
	}
		
	// post to facebook using Apstrata's APIs
	var facebookManager = apsdb.require("social.fb.facebookManager");
	var response = facebookManager.searchPlaces(apsdb, user.facebookid, accessToken, searchDTO);
	if (request.parameters["cors"]) {
		
		var headers = {"Access-Control-Allow-Origin": "*"};
		apsdb.httpRespond(JSON.stringify(response), 200, headers);
	}
	
	return response;
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
	var common = apsdb.require("social.fb.common");
	var picUrl = common.buildLinkToFile(apsdb, accountKey, doc.key, "pictures", picName);	
	return {
	
		"picture": picUrl,
		"name": doc.recipeName,
		"caption":  doc.recipeName,
		"description": doc.description
	}
}

function _isPostParameter(parameter) {

	if (parameter.indexOf("apsdb") > -1 || parameter.indexOf("apsws") > -1) {
		return false;
	}
	
	if (parameter == "docKey" || parameter == "accessToken") {
		return false;
	}
	
	return true;
}	
	
]]>
</code>
</script>