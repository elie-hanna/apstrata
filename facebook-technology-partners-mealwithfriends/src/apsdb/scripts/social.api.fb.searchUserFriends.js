<script>
<scriptACL>
	<execute>authenticated-users</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * On error: {"result": { "metadata": { "status": "failure", "erroCode": "some_code", "errorDetail": "some_text"}}
 */
try {
	
	var userManager = apsdb.require("social.fb.userManager");
	var login = userManager.getUserLoginFromRequest(apsdb, request);
	var response = userManager.getUser(apsdb, login);
	var facebookManager = apsdb.require("social.fb.facebookManager");
	var name = request.parameters["name"];
	var response = facebookManager.searchFriendsByName(apsdb, null, response.user.accessToken, {"name":name});
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

]]>
</code>
</script>