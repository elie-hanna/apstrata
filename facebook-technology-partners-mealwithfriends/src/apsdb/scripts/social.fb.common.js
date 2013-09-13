<script>
<scriptACL>
	<execute>authenticated-users</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * This file contains configuration parameters and utility functions shared by all 
 * module of the ftp application
 */

// The name of the Apstrata store to use
var storeName = "DefaultStore";

// The application id of the facebook meals with friend application
var appKey = "157527211099108";

var appVersion = "1.0";

// The application secret of the facebook meals with friend application
var secret = "1229e940a7a4466e896c50cbf23786fa";	

var apstrataUrl = "https://sandbox.apstrata.com/apsdb/rest/";

// default account Key (use it when no account info retrievable from the request
var defaultAccountKey = "B030C6D305";
	
// The callback URL used by the facebook meals with friend application for login
var callbackUrl = apstrataUrl + defaultAccountKey + "/RunScript?apsdb.scriptName=social.api.facebookLogin";

// The URL where to redirect (if requested) further to successfully obtaining an access token
var loggedInRedirectUrl = "";

// The url of the web version of the application
var siteUrl = "http://as.elementn.com";

// The scope used by the facebook meals with friend application	
var scope = "email,publish_stream,publish_actions,read_stream,user_photos,user_videos,user_status,offline_access,manage_pages,read_insights";

// The status to use as security for the facebook meals with friend application
var facebookStatus = "ads&=f";

// The namespace of the facebook application, as defined in the application settings
var appNameSpace = "mealwithfriends";

// Set the below to true if you need to add the instrumentation provided by Facebook
var triggerFacebookInstrumentation = false;

var facebookInstrumentationUrl = "https://www.facebook.com/impression.php";

var facebookPlugin = "featured_resources";

var facebookResourceId = "apstrata_apstrata";

/*
 * This is a utility function that loads the pictures that where uploaded along an HTTP 
 * request to Apstrata	
 */
function loadPicturesFromRequest(apsdb, request) {

	var pictures = null;
	if (request.files && request.files.pictures && request.files.pictures.length > 0) {

		pictures = {
			"pictures": request.files.pictures
		};
	}	
	
	return pictures;
}

/* 
 * Utility function that builds a URL to a file attached to a document
 */
function buildLinkToFile(apsdb, accountKey, docKey, fileFieldName, fileName) {

	var fileUrl = "https://sandbox.apstrata.com/apsdb/rest/" + accountKey + "/GetFile?apsws.time=" + new Date().getTime() + "&apsws.responseType=json&";
	return fileUrl + "apsdb.fileName=" + fileName + "&apsdb.fieldName=" + fileFieldName + "&apsdb.documentKey=" + docKey + "&apsdb.store=" + storeName;
}

/*
 * Parse the returned response in JSON format.
 * @param resp : the response received from the callHttp
 */
function parseJSONResult(apsdb, resp) {	
	
	if (resp.metadata && resp.metadata.status == "failure") {
		return resp;
	}

	var body = resp["body"];	
	var content = JSON.parse(body );	
	var metadata = content.response["metadata"];
	var status = metadata["status"];
	if (status == "failure") {
		var errorDetail = metadata["errorDetail"];
		var errorCode = metadata["errorCode"];		
		return {
			"status" : "failure", 
			"errorDetail" : errorDetail,
			"errorCode": errorCode
		};
	}
	
	return {
		"status": "success",
		"result": content.response["result"]
	}
}


]]>
</code>
</script>