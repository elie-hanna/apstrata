<script>
<scriptACL>
     <execute>anonymous</execute>
     <read>nobody</read>
     <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * The below variables will be populated at deployment time with the correct values.
 * These variables are specific to 
 */

// the url of the client application (user registration and/or account provisioning)
var apstrataHomeEnvironment = 
// the auth key of the provisioning account on the client application (user registration and/or account provisioning)
var apstrataHomeKey = 
// the store where temporary registration documents will be created on the client application (user registration and/or account provisioning))
var defaultUnconfirmedRegistrationStore = 
// the type of registration ("account" or "user") that needs to be ran (optional)
var registrationType =
// the url of the target cluster where accounts will be created (needed when provisioning accounts)
var accountCreationEnvironment = 
// the auth key of the provisioning account on the target cluster (needed when provisioning accounts)
var accountCreationKey = 
// the secret of the provisioning account on the target cluster (needed when provisioning accounts)
var accountCreationSecret =
// the store where user profiles documents will be created on the client application (needed when provisioning accounts)
var defaultProfileStore = 

/* end of deployment time variables */

var verifyUrl = apstrataHomeEnvironment + "/apsdb/rest/" + apstrataHomeKey + "/RunScript?apsws.authMode=simple&apsdb.scriptName=widgets.Registration.verifyAccount&login=$login&d=$confirmation";

var configuration = {
	projectName: "MyProject",
	defaultUsersGroup: "users",
	defaultUnconfirmedRegistrationStore: defaultUnconfirmedRegistrationStore,
	defaultProfileStore: defaultProfileStore ,
	accountCreationEnvironment : accountCreationEnvironment,
	apstrataHomeEnvironment : apstrataHomeEnvironment,
	accountCreationKey : accountCreationKey,
	accountCreationSecret : accountCreationSecret,
	apstrataHomeKey : apstrataHomeKey,
	sendEmailOnceRegistrationConfirmed: true,	
	templates: {
		adminEmail: "dude@dude.com",
		subject: "$projectName Registration - Email Verification",
		body: "<div style='font-family:Calibri, font-size:11'>Hello $user,<br/><br/> Thank you for signing up to our $projectName <br/><br/> Please click on the link below to activate your account. If the link doesn't work, copy and paste the link directly into the address bar of your internet browser.<br/><a href='$url'>$url</a><br/><br/>Sincerely<br/><br/>The $projectName Team",		
		verifyUrl : verifyUrl,
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