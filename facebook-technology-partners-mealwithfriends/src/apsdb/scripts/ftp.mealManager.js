<script>
<scriptACL>
	<execute>nobody</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * This module handles operation on meal documents, notably CRUD operations
 */
 
/*
 * Create a new meal document
 * @param apsdb: the Apstrata apsdb object
 * @param mealDTO: an object containing meal information
 * @return the key of the new meal document
 * @throw {result.metadata} in case something went wrong when adding the document
 */ 
function addMeal(apsdb, mealDTO){

	return _saveMeal(apsdb, mealDTO, false);
}

/*
 * Create a new meal document
 * @param apsdb: the Apstrata apsdb object
 * @param mealDTO: an object containing meal information
 * @return the key of the updated meal document
 * @throw {result.metadata} in case something went wrong when updating the document
 * @throw errorCode: "Missing_DocumentKey" if mealDTO.key is null or empty
 */ 
function updateMeal(apsdb, mealDTO) {

	if (!mealDTO.key || mealDTO.key === "") {
		
		throw {
			"status": "failure",
			"errorCode": "Missing_DocumentKey",
			"errorDetail": "You need to provide the document key to update a document"
		}
	}
	
	return _saveMeal(apsdb, mealDTO, true);
}

/*
 * @param mealDTO: an object containing the "key" property holding a document key
 * @return the meal document of which "apsdb.documentKey" matches mealDTO.key
 * @throw {result.metadata} in case something went wrong when reading the document
 */
function getMeal(apsdb, mealDTO) {

	var params = {
	
		"apsdb.queryName": "ftp_getMeal",
		"key": mealDTO.key
	}
	
	var getMealResult = apsdb.callApi("Query", params, null);
	if (getMealResult.metadata.status == "failure") {	
		throw getMealResult.metadata;	
	}
	
	return getMealResult.result.documents[0];
}

/*
 * @param mealDTO: an object containing the properties to search for in meal documents
 * @return { cout: "total_docs", "documents": [meal documents matching the values of mealDTO properties]}
 * @throw {result.metadata} in case something went wrong when reading the document
 */
function listMeals(apsdb, mealDTO) {

	var params = {
		"apsdb.queryName": "ftp_listMeals"		
	}
	
	if (mealDTO.pageNumber) {
		params["pageNumber"] = mealDTO.pageNumber;		
	}
	
	if (mealDTO.name) {
		params["name"] = mealDTO.name + "%";
	}
	
	var listMealsResult = apsdb.callApi("Query", params, null);
	if (listMealsResult.metadata.status == "failure") {	
		throw listMealsResult.metadata;	
	}
	
	return listMealsResult.result;
}

/*
 * Generic function to create/update a meal document
 * @param apsdb: the Apstrata apsdb object
 * @param mealDTO: an object containing meal information
 * @param update: true if we need to update a document, false otherwise
 * @return the key of the updated meal document
 * @throw {result.metadata} in case something went wrong when updating the document
 */ 
function _saveMeal(apsdb, mealDTO, update) {

	var common = apsdb.require("social.fb.common");
	var params = {
	
		"apsdb.schema": "ftp_meal",
		"apsdb.store": common.storeName,
		"recipeName": mealDTO.name
	}	
	
	if (mealDTO.key) {
		params["apsdb.documentKey"] = mealDTO.key;
	}
		
	if (mealDTO.description) {
		params["description"] = mealDTO.description;
	}
	
	if (mealDTO.ingredients) {
		params["ingredients"] = mealDTO.ingredients;
	}	
	
	if (update) {
		params["apsdb.update"] = "true";
	}
	
	// Save the meal document
	var saveMealResult = apsdb.callApi("SaveDocument", params, mealDTO.pictures);
	
	if (saveMealResult.metadata.status == "failure") {	
		throw saveMealResult.metadata;	
	}
	
	return saveMealResult.result.document.key;
}

]]>
</code>
</script>