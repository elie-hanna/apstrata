<script>
<scriptACL>
	<execute>anonymous</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * Get the list of meal documents or narrow the list using the "name" parameter
 * @param name (optional): if provided, the script returns  list of meal document of which 
 * the "recipeName" property starts with the value of "name"
 * @param pageNumber (optional): if provided and if more than 50 meal documents, specifies the result page
 * to retrieve
 * @return 
 * If successful
 * "result": {
 *  "count": "total_of_meals",
 *  "documents": [
 *  	{...} // name, description, ingredients, pictures (name only), key and versionNumber
 *  ] 
 * } 
 * On error : {"result": { "metadata": { "status": "failure", "erroCode": "some_code", "errorDetail": "some_text"}}
 */
try {

	var name = request.parameters["name"];
	var pageNumber = request.parameters["pageNumber"];
		
	var mealDTO = {};
	if (name) {
		mealDTO.name = name;
	}
	
	if (pageNumber) {
		mealDTO.pageNumber = pageNumber;
	}
	
	var mealManager = apsdb.require("ftp.mealManager");
	return mealManager.listMeals(apsdb, mealDTO);
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