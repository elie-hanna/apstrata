<script>
<scriptACL>
  <execute>anonymous</execute>
  <read>nobody</read>
  <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * This script should be used when registering a new user or when provisioning a new account.
 * The script will consider that it is running an account provisioning scenario 
 * if one of the following is true
 * (a)widgets.common/configuration.registrationType == "account"
 * (b) request.parameters["registrationType"] == "account"
 * @param login : the login of the user 
 * @param d : the temporary user document containing subscription information
 * @return : if successful and registrationRedirectUrl is defined in widgets.common, returns the url + 
 * "&status=complete". Otherwise (if url not specified) returns the last response.
 * If unsuccessful and redirection url defined, returns the url + "&status=error&error=error_msg".
 * Otherwise, returns {status: "failure", errorDetail: the_error_messag}
 */

var logLevel = request.parameters["logLevel"];
if (logLevel){
	apsdb.log.setLogLevel(logLevel); 
}
 
var widgetsCommon = apsdb.require("widgets.common");
var configuration = widgetsCommon.getConfiguration();
              
// Retrieve the temporary document that contains the user's info, using the documentKey received
// in the e-mail from the unconfirmedRegistrations store
var getUserDocParams = {
	"apsdb.store" : configuration.defaultUnconfirmedRegistrationStore,
	"apsdb.query" : "apsdb.documentKey = \"" + request.parameters["d"] + "\"",
	"apsdb.queryFields" : "*",
	"apsdb.includeFieldType" : "true"
}

try {	

	var user = apsdb.callApi("Query", getUserDocParams , null);
	
	if (!(user.result.documents) || (user.result.documents.length == 0)) {
		throw "WRONG_CONFIRMATION_CODE";		
	}
	
	// If we were able to retrieve the document, prepare to save the info as a new user			
	// Create the parameters of the SaveUser API from the data contained
	// in the temporary user document
	var response = saveUser();		
		
	if (response.metadata.status == "failure") {
		throw response.metadata.errorDetail;
	}
			
	// If we were able to create a new user, we now need to:
	// 1) Check if we are in a user registration process or an account registration process.
	//    If we are in the latter case, we extend the current script with the account creation script.
	//    The registration process is an account registration process if one of the following is true:
	//   a) configuration.registration == "account" (not "user")
	//   b) request.parameters["registrationType"] == "account"
	//
	// 2) Delete the temporary user document from the unconfirmedRegistrations store
	// 3) Send a confirmation e-mail (if configured to do so)
	
	if ((configuration.registrationType == "account") || (request.parameters["registrationType"] == "account")) {
		// retrieve advanced configuration 
		var advancedWidgetsCommon = apsdb.require("widgets.common.advanced");
		var advancedConfig = advancedWidgetsCommon.getConfiguration()
		
		// load account creation logic and run it
		var accountProcess = apsdb.require("widgets.Registration.createAccount");	
		var resp = accountProcess.handleAccountCreation(request, user, advancedConfig, apsdb, logLevel);		
		apsdb.log.debug("Create account response", {resp:resp});
		if (resp.metadata.status == "failure") {		
			deleteUser();
			throw resp.metadata.errorDetail;
		}else {
			response = resp;
		}
	}	
	
	// 2) Delete the temporary user document from the unconfirmedRegistrations store
	var deleteResponse = deleteTemporaryUserDoc();						
	
	if (deleteResponse.metadata.status == "failure") {
		throw deleteResponse.metadata.errorDetail;
	}
	
	// 3) Send confirmation e-mail
	if (configuration.sendEmailOnceRegistrationConfirmed == true) {
		sendEmail();
	}
					
	response = {status : "success", result : response }; 
	var url = configuration.registrationRedirectUrl;
	if (url && url != ""){
		apsdb.httpRedirect(url + "&status=complete");						
	}else {
		return response;
	}
	
	
}catch(exception){
	
	apsdb.log.debug("Exception", {exception: exception});
	
	var errorDetail = exception ? exception : "An error occurred";		
	var resp = {
		status: "failure", 		
		errorDetail: encodeURIComponent(errorDetail) 
	};
	
	var url = configuration.registrationRedirectUrl;
	
	apsdb.log.debug("Redirect URL", {url : url});
	
	if (url && url != ""){
		apsdb.httpRedirect(url + "&status=error&error=" + resp.errorDetail);
					
	}else {
		return resp;
	}
}

function saveUser() {
	
	var params = {};
	var types = user.result.documents[0]["_type"];	
	for (var key in user.result.documents[0]) {
		if (key.indexOf("apsdb.") < 0 && key != ("versionNumber") && key != "key" && key != "_type") {			
			
			if (types[key] == "date") {
				var strDate = user.result.documents[0][key];				
				var d = parseDate(strDate);				
				var day = d.getDay();
				var month = d.getMonth() + 1;
				var year = d.getFullYear();
				params[key] = day + "/" + month + "/" + year;				
				continue;
			}
			
			params[key] = user.result.documents[0][key];
			if (key == "password") {				
				continue;
			}			
			
			params[key + ".apsdb.fieldType"] = types[key];
		}
	}
			
	return apsdb.callApi("SaveUser", params, null);
}

function deleteUser() {

	var params = {
		login: request.parameters["login"],				
	}
		
	return apsdb.callApi("DeleteUser", params, null);
}

function deleteTemporaryUserDoc() {

	var deleteParams = {
		"apsdb.store": configuration.defaultUnconfirmedRegistrationStore,
		"apsdb.documentKey": request.parameters["d"]
	}
	
	return apsdb.callApi("DeleteDocument", deleteParams, null);
}

function sendEmail() {
	
	var tokens = {
	    projectName: configuration.projectName,
	    user: user.result.documents[0].name,	    
	}
	
	var emailSubject = widgetsCommon.parseTemplate(configuration.templatesConfirmed.subject, tokens)
	var emailBody = widgetsCommon.parseTemplate(configuration.templatesConfirmed.body, tokens)
	
	var sendEmailInput = {
		"apsma.from": configuration.adminEmail, 
		"apsma.to": user.result.documents[0].email, 
		"apsma.subject": emailSubject, 
		"apsma.htmlBody": emailBody
	};
	
	return apsdb.callApi("SendEmail", sendEmailInput, null);		
}

function parseDate (dateStr) {
	var dateTimeArray = dateStr.split("T"); // separate the date from the time.
	var dateArray = dateTimeArray[0].split("-"); // get individual values for year/month/day.

	var outputDate = new Date();

	// use setUTC since facebook returns everything in UTC time [+0000]
	outputDate.setUTCFullYear(dateArray[0]);
	outputDate.setUTCMonth(dateArray[1] -1); // js month count is from 0 - 11
	outputDate.setUTCDate(dateArray[2]);

	if (dateTimeArray[1]) {
		var timeArray = dateTimeArray[1].split("+")[0].split(":"); // get individual values for hour/minute/second.
		outputDate.setUTCHours(timeArray[0]);
		outputDate.setUTCMinutes(timeArray[1]);
		outputDate.setUTCSeconds(timeArray[2]);
	}

	return outputDate;
}

]]>
</code>
</script>