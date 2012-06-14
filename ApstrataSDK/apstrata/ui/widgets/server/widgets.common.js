<script>
<scriptACL>
     <execute>anonymous</execute>
     <read>nobody</read>
     <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * The below variables will be populated at deployment time with the correct values
 */

var projectName = "MyProject";
var defaultUsersGroup = "users";
var defaultUnconfirmedRegistrationStore = "DefaultStore";	
var apstrataHomeEnvironment = "";
var apstrataHomeKey = "";
var registrationType = "user";
var sendEmailOnceRegistrationConfirmed = true;
var verifyUrl = apstrataHomeEnvironment + "/apsdb/rest/" + apstrataHomeKey + "/RunScript?apsws.authMode=simple&apsdb.scriptName=widgets.Registration.verifyAccount&login=$login&d=$confirmation";
var registrationRedirectUrl = ""
 
var configuration = {
	projectName: projectName,
	defaultUsersGroup: defaultUsersGroup,
	defaultUnconfirmedRegistrationStore: defaultUnconfirmedRegistrationStore,	
	apstrataHomeEnvironment: apstrataHomeEnvironment,	
	apstrataHomeKey: apstrataHomeKey,
	registrationType: registrationType,
	registrationRedirectUrl: registrationRedirectUrl,
	sendEmailOnceRegistrationConfirmed: sendEmailOnceRegistrationConfirmed,	
	templates: {
		adminEmail: "dude@dude.com",
		subject: "$projectName Registration - Email Verification",
		body: "<div style='font-family:Calibri, font-size:11'>Hello $user,<br/><br/> Thank you for signing up to our $projectName <br/><br/> Please click on the link below to activate your account. If the link doesn't work, copy and paste the link directly into the address bar of your internet browser.<br/><a href='$url'>$url</a><br/><br/>Sincerely<br/><br/>The $projectName Team",		
		verifyUrl: verifyUrl 
	},

	templatesConfirmed: {
		adminEmail: "dude@dude.com",
		subject: "$projectName Registration confirmed",
		body: "<div style='font-family:Calibri, font-size:11'>Hello $user,<br/><br/> Welcome to our $projectName <br/><br/> Your account has been activated.<br/>Sincerely<br/><br/>The $projectName Team",
	}
}

function parseTemplate(template, tokens) {
    var t = template + ""
    for (var key in tokens) {
        template = template.replace(new RegExp("\\$"+key, "g"), tokens[key])
    }    
    return template
}

function getConfiguration() {
	return configuration
}

]]>
</code>
</script>