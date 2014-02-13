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
 * @param d : the validation code
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
  
// Retrieve the temporary user and verify that the temporary profile contains
// the provided confirmation code
try {	

	var getUserParams = {
		login: request.parameters["login"]
	};
	
	var user = apsdb.callApi("GetUser", getUserParams, null);
	
 // check if d parameter was sent in the request
	if(!(request.parameters["d"]) || request.parameters["d"]==null){
		throw "INVALID_REQUEST";
	}
	
	if (!(user.result) || (!user.result.user) || (user.result.user.code != request.parameters["d"])) {
		throw "WRONG_CONFIRMATION_CODE";		
	}
	
	// If we were able to retrieve the user, prepare to update its profile info 			
	// Create the parameters of the SaveUser API from the data contained
	// in the temporary user document
	user = user.result.user;

	var response = saveUser(user);		
		
	if (response.metadata.status == "failure") {
		throw response.metadata.errorDetail;
	}
			
	// If we were able to update the user, we now need to:
	// 1) Check if we are in a user registration process or an account registration process.
	//    If we are in the latter case, we extend the current script with the account creation script.
	//    The registration process is an account registration process if one of the following is true:
	//   a) configuration.registration == "account" (not "user")
	//   b) request.parameters["registrationType"] == "account"
	//
	// 2) Send a confirmation e-mail (if configured to do so)	
	
	// Insert here any extra step you would like to add to the process and set the widgets.common.extraStepNeed 
	// and widgets.common.extraStepScriptName accordingly. The following contains default registration step for 
	// Asptrata that might not work in your case.
	if(configuration.extraStepNeeded){
		
		var extraStepManager = apsdb.require(configuration.extraStepScriptName);
		var params = {
			
			"login": user.login,
			"isSuspended": "false",
			"update": "true",
			"code": ""		
		};
	
		var result = extraStepManager.handleStep(apsdb, "saveUser", params);
		if(result.status == 'failure') {
					
			var parameters = {
			  login: params["login"]				
		  }
			 apsdb.callApi("DeleteUser", parameters, null);
			 
			 throw result ; 
		}
	}
	
	if ((configuration.registrationType == "account") || (request.parameters["registrationType"] == "account")) {
		// retrieve advanced configuration 
		var advancedWidgetsCommon = apsdb.require("widgets.common.advanced");
		var advancedConfig = advancedWidgetsCommon.getConfiguration()
		
		// load account creation logic and run it
		var accountProcess = apsdb.require("widgets.Registration.createAccount");	
		var resp = accountProcess.handleAccountCreation(request, user, advancedConfig, apsdb, logLevel);		
		if (resp.metadata.status == "failure") {		
			// MFE: No need to delete user, we just create him without an application
			// deleteUser();
			// MFE: No need to throw anymore, because registration can be completed without a user application
			//throw resp.metadata.errorDetail; 
		}else {
			response = resp;
		}
	}			
	
	// 2) Send confirmation e-mail
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
		errorDetail: exception
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
	
	apsdb.log.debug("Saving user", {user:user});
	
	// Change the isSuspended attribute to false and remove the validation code
	var params = {
		"login": user.login,
		"isSuspended": "false",
		"apsdb.update": "true",
		"code": ""		
	};
	
	var groups = user["groups"];
	if (!groups && configuration.defaultUsersGroup){
		params["groups"] = [configuration.defaultUsersGroup];
	}
	
	apsdb.log.debug("SaveUser params", {params:params});
			
	return apsdb.callApi("SaveUser", params, null);
}

function deleteUser() {

	var params = {
		login: request.parameters["login"]				
	}
		
	return apsdb.callApi("DeleteUser", params, null);
}

function sendEmail() {
	
	var tokens = {
	    projectName: configuration.projectName,
	    user: user.name,	    
	}
	
	var emailSubject = widgetsCommon.parseTemplate(configuration.templatesConfirmed.subject, tokens)
	var emailBody = widgetsCommon.parseTemplate(configuration.templatesConfirmed.body, tokens)
	
	var sendEmailInput = {
		"apsma.from": configuration.adminEmail, 
		"apsma.to": user.email, 
		"apsma.subject": emailSubject, 
		"apsma.htmlBody": emailBody
	};
	
	return apsdb.callApi("SendEmail", sendEmailInput, null);		
}

]]>
</code>
</script>