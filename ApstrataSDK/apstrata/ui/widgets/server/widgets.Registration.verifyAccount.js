<script>
<scriptACL>
  <execute>anonymous</execute>
  <read>nobody</read>
  <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * This script should be used when registering a new user or when provisioning a new account.
 * The script will consider that it is running an account provisioning scenario if one of the following is true
 * (a)widgets.common/configuration.registrationType == "account"
 * (b) request.parameters["registrationType"] == "account"
 * @param login : the login of the user 
 * @param d : the temporary user document containing subscription information
 * @param profileStore : optional. If used, specifies the store where the profile will be created (only when registrationType == "account"). 
 * @return : if successful and registrationRedirectUrl is defined in widgets.common, returns the url + 
 * "&status=complete". Otherwise returns the last response
 * If failure, returns {status: "failure", errorDetail: the_error_messag}
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
	"apsdb.queryFields" : "*"
}

try {	

	var user = apsdb.callApi("Query", getUserDocParams , null);
	
	if (!(user.result.documents) || (user.result.documents.length == 0)) {
		return {
			status: "failure", 		
			errorDetail: "WRONG_CONFIRMATION_CODE" 	
		}	
	}
	
	// If we were able to retrieve the document, prepare to save the info as a new user			
	// Create the parameters of the SaveUser API from the data contained
	// in the temporary user document
	var response = saveUser();		
		
	if (response.metadata.status == "failure") {
		return response;
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
		
		if (resp.status == "failure") {		
			deleteUser();
			throw resp;
		}else {
			response = resp;
		}
	}	
	
	// 2) Delete the temporary user document from the unconfirmedRegistrations store
	var deleteResponse = deleteTemporaryUserDoc();						
	
	if (deleteResponse.metadata.status == "failure") {
		return deleteResponse;
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
	
	return {
		status: "failure", 		
		errorDetail: exception 	
	}
}

function saveUser() {

	var params = {
		login: request.parameters["login"],
		password: user.result.documents[0].password,
		email: user.result.documents[0].email,
		name: user.result.documents[0].name,
		groups: user.result.documents[0].finalGroups,			
	}	
	
	params["company"] = user.result.documents[0].company;
	params["jobTitle"] = user.result.documents[0].jobTitle;
	params["phone"] = user.result.documents[0].phone;
	params["webSite"] = user.result.documents[0].webSite;
			
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

]]>
</code>
</script>