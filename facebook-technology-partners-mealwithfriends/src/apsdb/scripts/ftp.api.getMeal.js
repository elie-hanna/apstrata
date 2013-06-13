<script>
<scriptACL>
	<execute>anonymous</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * @param key: the key of a meal document
 * @return 
 * If successful, returns the meal document (all fields)
 * On error: {"result": { "metadata": { "status": "failure", "erroCode": "some_code", "errorDetail": "some_text"}}
 */
try {

	// check if the user is authenticated, if not throw an exception
	var userManager = apsdb.require("ftp.userManager");
	if (!userManager.isUserAuthenticated(apsdb, request)) {
	
		throw {
		
			"errorCode": "PERMISSION_DENIED",
			"errorDetail": "You need to authenticate yourself using your app or your facebook credentials"
		}	
	}
	
	var key = request.parameters["key"];
	
	// verify that required parameters are available
	_verifyParameters();
	
	// if parameters OK, create a mealDTO and pass it to an instance of mealManager
	var mealDTO = {
		"key": key
	};	
	
	var mealManager = apsdb.require("ftp.mealManager");
	return mealManager.getMeal(apsdb, mealDTO);
}catch(exception) {

	return {
	
		"status": "failure",
		"errorCode": exception.errorCode ? exception.errorCode: exception,
		"errorDetail": exception.errorDetail ? exception.errorDetail : ""
	}
}	
	
function _verifyParameters() {

	
	if (!key) {
		
		throw {
			
			"errorCode": "Invalid_Parameter",
			"errorDetails": "'key' is required"
		}
	}
}

]]>
</code>
</script>