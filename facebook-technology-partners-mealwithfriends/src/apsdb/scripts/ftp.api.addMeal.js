<script>
<scriptACL>
	<execute>authenticated-users</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * Invoke this script to create a new meal document
 * @param name: the name of the meal
 * @param description: the description of the meal
 * @param ingredients: the ingredients of the recipe
 * @param pictures (optional): picture(s) uploaded in complement to the textual description
 * @return
 * If successful, the document key of the created meal document
 * { "result": "some_key"}
 * On error
 * {"result": { "metadata": { "status": "failure", "erroCode": "some_code", "errorDetail": "some_text"}}
 */
try {

	// check if the user is authenticated, if not throw an exception
	var userManager = apsdb.require("social.fb.userManager");
	if (!userManager.isUserAuthenticated(apsdb, request)) {
	
		throw {
		
			"errorCode": "PERMISSION_DENIED",
			"errorDetail": "You need to authenticate yourself using your app or your facebook credentials"
		}	
	}

	var common = apsdb.require("social.fb.common");
	var name = request.parameters["name"];
	var description = request.parameters["description"];
	var ingredients = request.parameters["ingredients"];	
	var pictures = common.loadPicturesFromRequest(apsdb, request);
	
	// verify that required parameters are available
	_verifyParameters();
	
	// if parameters OK, create a mealDTO and pass it to an instance of mealManager
	var mealDTO = {
	
		"name": name,
		"description": description,
		"ingredients": [].concat(ingredients),
		"pictures": pictures
	}	
	
	var mealManager = apsdb.require("ftp.mealManager");
	return mealManager.addMeal(apsdb, mealDTO);
}catch(exception) {

	return {
	
		"status": "failure",
		"errorCode": exception.errorCode ? exception.errorCode: exception,
		"errorDetail": exception.errorDetail ? exception.errorDetail : ""
	}
}	
	
function _verifyParameters() {

	
	if (!name) {
		
		throw {
			
			"errorCode": "Invalid_Parameter",
			"errorDetail": "'name' is required to create a meal"
		}
	}
	
	if (!description) {
		
		throw {
			
			"errorCode": "Invalid_Parameter",
			"errorDetail": "'description' is required to create a meal"
		}
	}
	
	if (!ingredients) {
		
		throw {
			
			"errorCode": "Invalid_Parameter",
			"errorDetail": "'ingredients' is required to create a meal"
		}
	}
}

]]>
</code>
</script>