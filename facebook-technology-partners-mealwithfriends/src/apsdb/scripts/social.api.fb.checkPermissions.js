<script>
<scriptACL>
	<execute>authenticated-users</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * Use this API to check if a set of permissions has been granted by a Facebook user to a give
 * application. Check the following link for more on Facebook's permissions:
 * (https://developers.facebook.com/docs/reference/login/#permissions)
 * @param permissions (mandatory): an array of permissions (e.g. ["email", "publish_actions"])
 * @param isCORS (optional): send this parameter set to true if you need to allow CORS
 * @return A key/value object where: key = permission and value = 1 or 0, e.g: {"email":1, "publish_actions":0}
 * @throw {"errorCode": "Check_Permission_Error", "errorDetail": response.result.error.message}
 * @throw  {"errorCode": "INVALID_USER", "errorDetail": "You cannot use this API as an account owner"} if ran as account owner
 */
 try {
 
	var userManager = apsdb.require("social.fb.userManager");
	var login = userManager.getUserLoginFromRequest(apsdb, request);
	var isCORS = request.parameters["isCORS"];
	
	// the script should not be called as an account owner
	if (login.indexOf("#") > 1) {
	
		throw {
		
			"errorCode": "INVALID_USER",
			"errorDetail": "You cannot use this API as an account owner"
		}
	}	
	
	var user = userManager.getUser(apsdb, login);
	var permissions = request.parameters["permissions"];
	permissions = [].concat(permissions);
	if (!permissions || permissions.length == 0) {
		
		throw {
			
			"errorCode": "Invalid_Parameter",
			"errorDetail": "'permissions' is a required parameter"		
		}
	}		
	
	var response = userManager.checkPermissions(apsdb, user.user.facebookid, user.user.accessToken, permissions);
	return _handleResponse(response, isCORS);
}catch(exception) {
	
	var error = {
	
		"status": "failure",
		"errorCode": exception.errorCode ? exception.errorCode: exception,
		"errorDetail": exception.errorDetail ? exception.errorDetail : ""
	}
	
	return _handleResponse(error);
}

function _handleResponse(response, isCORS) {
	
	if (isCORS) {
	
		var headers = {"Access-Control-Allow-Origin": "*"};
		apsdb.httpRespond(JSON.stringify(response), 200, headers);
	}
	
	return response;
}

]]>
</code>
</script>