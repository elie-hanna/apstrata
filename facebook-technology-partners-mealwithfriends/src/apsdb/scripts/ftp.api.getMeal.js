<script>
<scriptACL>
	<execute>anonymous</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * @param key: the key of a meal document
 * @param returnHTML (optional): if passed and set to true, will return the HTML code required
 * by facebook Open Graph
 * @return 
 * If successful, returns the meal document (all fields)
 * On error: {"result": { "metadata": { "status": "failure", "erroCode": "some_code", "errorDetail": "some_text"}}
 */
try {

	var key = request.parameters["key"];
	
	// verify that required parameters are available
	_verifyParameters();
	
	// if parameters OK, create a mealDTO and pass it to an instance of mealManager
	var mealDTO = {
		"key": key
	};	
	
	var mealManager = apsdb.require("ftp.mealManager");
	var returnHTML = request.parameters["returnHTML"];
	var mealDocument = mealManager.getMeal(apsdb, mealDTO);
	
	// see if we need to return an HTML document as this script might have been called by facebook
	if (returnHTML && returnHTML == "true") {
		return _buildHTML(apsdb, mealDocument);
	}
	
	return mealDocument;
}catch(exception) {

	return {
	
		"status": "failure",
		"errorCode": exception.errorCode ? exception.errorCode: exception,
		"errorDetail": exception.errorDetail ? exception.errorDetail : ""
	}
}	

function _buildHTML(apsdb, mealDocument) {

	var common = apsdb.require("ftp.common");
	var picName = ([].concat(mealDocument.pictures))[0];
	var linkToPic = common.buildLinkToFile(apsdb, common.defaultAccountKey, mealDocument.key, "pictures", picName);
	var body = "<html><head prefix=\"og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# " + common.appNameSpace + ": http://ogp.me/ns/fb/" + common.appNameSpace + "#\">";
	body = body + "<meta property=\"fb:app_id\" content=\"" + common.appKey + "\"/>";
	body = body + "<meta property=\"og:type\" content=\"" + common.appNameSpace + ":meal\"/>";
  	//body = body + "<meta property=\"og:url\" content=\"" + "https://sandbox.apstrata.com/apsdb/rest/" + common.defaultAccountKey + "/RunScript?apsws.time=" + new Date().getTime() + "&apsws.responseType=jsoncdp&apsdb.scriptName=ftp.api.getMeal&key=" + mealDocument.key +"\"/>"; 
  	body = body + "<meta property=\"og:title\" content=\"" + mealDocument.recipeName + "\"/>"; 
 	body = body + "<meta property=\"og:image\" content=\"" + linkToPic + "\"/>";
 	var status = 200;
 	
 	// send the needed data to the view object (php page)
 	var mealParam = {
 	
 		"recipeName": mealDocument.recipeName,
 		"description": mealDocument.description,
 		"ingredients": mealDocument.ingredients.join(),
 		"picture": linkToPic
 	}
 	return "http://as.elementn.com/getMeal.php?meal=" + JSON.stringify(mealParam);
	var ui = apsdb.callHttp("http://as.elementn.com/getMeal.php?meal=" + encodeURIComponent(JSON.stringify(mealParam)));
	body = body + "</head>" + ui.body;
	body = body + "</html>";
	apsdb.httpRespond(body, status, null);
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