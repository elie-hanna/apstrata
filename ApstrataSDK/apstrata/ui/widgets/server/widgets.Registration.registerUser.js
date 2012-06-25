<script>
<scriptACL>
     <execute>anonymous</execute>
     <read>group:developers</read>
     <write>group:developers</write>
</scriptACL>
<code><![CDATA[

/*
 * This script can be used to register users or to create accounts (if the caller is entitled to do so).
 * @param : mandatory parameters are "user.name", "user.email", "user.login", "user.password"
 * @param : optional parameters are "user.groups" (not when creating account), "user.company",
 * "user.webSite", "user.jobTitle", "user.phone"
 * Parameters not prefixed with "user" will not be saved.
 * @return { metadata : { status :"success" }, url: redirection_url} if registrationRedirectURL is
 * specified in widgets.common or true if not specified
 *  or
 * {metadata : {status : "failure", errorDetail : "xxxx", errorCode: "yyyy"}} in case of failure
 */

var logLevel = request.parameters["logLevel"];
if (logLevel) {
	apsdb.log.setLogLevel(logLevel);
}

var widgetsCommon = apsdb.require("widgets.common")

var configuration = widgetsCommon.getConfiguration()


function generateCode() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function sendEmail(validationCode) {
	var url = widgetsCommon.parseTemplate(
		configuration.templates.verifyUrl, 
		{login: params.login, confirmation: validationCode})

	var tokens = {
	    projectName: configuration.projectName,
	    user: params.login,
	    url: url
	}
	
	var emailSubject = widgetsCommon.parseTemplate(configuration.templates.subject, tokens)
	var emailBody = widgetsCommon.parseTemplate(configuration.templates.body, tokens)
		
	var sendEmailInput = {
		"apsma.from": configuration.adminEmail, 
		"apsma.to": params.email, 
		"apsma.subject": emailSubject, 
		"apsma.htmlBody": emailBody,		
	};
	
	apsdb.log.debug("Email parameters", {params:sendEmailInput});
	
	return apsdb.callApi("SendEmail", sendEmailInput, null);		
}

function checkUser(login) {
	var params = {
		login: login
	}

	return apsdb.callApi("GetUser", params, null).metadata.status;
}

var params = {}

for (k in request.parameters) {
	// Only parameters sent with the "user." prefix will be saved in the user profile
	if (k.indexOf('user.')>=0) {
		if ((k == "user.login") && (checkUser(request.parameters[k]) == "success"))  {		
			return {
				metadata : { 
					status: "failure", 
					errorDetail: "Unable to register user [Login already exists]",
					errorCode: "DUPLICATE_USER" 
				}
			};								
		}	
		
		if (k == "user.groups")	{	
			
			var groupsAsStr = request.parameters[k];
			if (groupsAsStr){
				groupsAsStr = groupsAsStr.replace(" ", "");
				var groups = groupsAsStr.split(",");
				params["groups"] = groups;
			}
		} else {
			//  Otherwise save param in the user profile
			params[k.substring(5)] = request.parameters[k];
			if (k == "user.password") {
				params["user.password.aspdb.fieldType"] = "password";
			}
		}
	}
}

// If no user.login was sent in the request, create one from the user's e-mail
if (!params["login"]) {
     params["login"] = params["email"];
     
     // verify that this login doesn't already exist
     if ((checkUser(params["login"]) == "success"))  {		
		return { 
			metadata : {
				status: "failure", 
				errorDetail: "Unable to register user [email already exists]",
				errorCode: "DUPLICATE_USER"
			}
		};								
	}	
}

// Create a temporary document for this new user
// The account owner is the only one who can read this document
params["document.writeACL"] = "nobody";
params["document.readACL"] = "nobody"

// Add the new user to the unconfirmedRegistrations store 
params["apsdb.store"] = configuration.defaultUnconfirmedRegistrationStore;

// Save the user
try {
	apsdb.log.debug("Save user params", {params: params});
	saveUserResult = apsdb.callApi("SaveDocument", params, null);
	
	if (saveUserResult.metadata.status == "success") {
		var sendEmailResult = sendEmail(saveUserResult.result.document.key)
		if (sendEmailResult.metadata.status == 'failure') {			
			return { 
				status: "failure", 
				errorDetail: "Unable to send email [" 
				 + sendEmailResult.metadata.errorDetail + "]",
				 params : params 	
			};
		} else {			
			var url = true;		
			if ((configuration.registrationRedirectUrl) && (configuration.registrationRedirectUrl != "")){
				url = configuration.registrationRedirectUrl;
			}
			return {
				metadata: {
					status : "success"
				},
				url : url				
			}
		}
		
	} else {		
		return { 
			status: "failure", 
			errorDetail: "Unable to register user [" 
			 + saveUserResult.metadata.errorCode + "]"
		};
	}
}catch(exception) {	
	return { 
		status: "failure", 
		errorDetail: "Unable to register user [" 
		 + exception + "]"
	};	
}


]]>
</code>
</script>