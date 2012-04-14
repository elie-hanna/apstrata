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

function sendEmail() {
	var url = widgetsCommon.parseTemplate(
		configuration.templates.verifyUrl, 
		{login: params.login, confirmation: params.confirmationCode})

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
	
	//return (userSendEmailResult.metadata.status == 'failure')	
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

// Add the new user to the unconfirmedRegistrations group 
params.groups = "unconfirmedRegistrations"
params.confirmationCode = generateCode()

// Save the user
var saveUserResult = apsdb.callApi("SaveUser", params, null)

if (saveUserResult.metadata.status == "success") {
	var sendEmailResult = sendEmail()
	if (sendEmailResult.metadata.status == 'failure') {
		return { 
			status: "failure", 
			errorDetail: "Unable to send email [" 
			 + userSendEmailResult.metadata.errorCode + "]" 	
		};
	} else {
		return true
	}
	
} else {
	return { 
		status: "failure", 
		errorDetail: "Unable to register user [" 
		 + saveUserResult.metadata.errorCode + "]"
	};
}


]]>
</code>
</script>