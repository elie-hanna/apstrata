<script>
<scriptACL>
     <execute>anonymous</execute>
     <read>group:developers</read>
     <write>group:developers</write>
</scriptACL>
<code><![CDATA[

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
		"apsma.htmlBody": emailBody
	};
	
	return apsdb.callApi("SendEmail", sendEmailInput, null);		
}

var params = {}

for (k in request.parameters) {
	// Only parameters sent with the "user." prefix will be saved in the user profile
	if (k.indexOf('user.')>=0) {
		if (k == "user.groups") 
		// If groups have been set, save them to a temporary user attribute
		//  Until the registration is confirmed 
			params["finalGroups"] = request.parameters[k];
		else 
		//  Otherwise save param in the user profile
			params[k.substring(5)] = request.parameters[k]
	}
}

// If no user.login was sent in the request, create one from the user's e-mail
if (!params["login"]) {
     params["login"] = params["email"];
}

// Create a temporary document for this new user
// The account owner is the only one who can read this document
params["document.writeACL"] = "nobody";
params["document.readACL"] = "nobody"

// Add the new user to the unconfirmedRegistrations store 
params["apsdb.store"] = configuration.defaultUnconfirmedRegistrationStore;

// Save the user
var transaction = apsdb.beginTransaction();
saveUserResult = apsdb.callApi("SaveDocument", params, null);

if (saveUserResult.metadata.status == "success") {
	var sendEmailResult = sendEmail(saveUserResult.result.document.key)
	if (sendEmailResult.metadata.status == 'failure') {
		transaction.rollback();
		return { 
			status: "failure", 
			errorDetail: "Unable to send email [" 
			 + sendEmailResult.metadata.errorCode + "]",
			 params : params 	
		};
	} else {
		transaction.commit();
		return true
	}
	
} else {
	transaction.rollback();
	return { 
		status: "failure", 
		errorDetail: "Unable to register user [" 
		 + saveUserResult.metadata.errorCode + "]"
	};
}


]]>
</code>
</script>