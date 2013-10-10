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

// The name of the project (or site) the user is subscribing to
var projectName = "";

// The name of the default group to which subscribing users will belong once registered
var defaultUsersGroup = "users";

// The store where temporary registration documents will be created on the client application (user registration and/or account provisioning))
//var defaultUnconfirmedRegistrationStore = "pendingRegistrations";	

// The auth key of the provisioning account on the client application
var apstrataHomeEnvironment = "";

// The auth key of the provisioning account on the client application
var apstrataHomeKey = "";

// The secret of the provisioning account on the client application
var apstrataHomeSecret = "";

// The type of registration that is required ("user" -> for user registration, or "account" -> for account creation)
var registrationType = "user";

// Specify if an email should be sent to the user upon successful registration (true/false)
var sendEmailOnceRegistrationConfirmed = true;

// The URL that is sent in the verification e-mail for the subscriber to click on (you normally should not change this)
var verifyUrl = apstrataHomeEnvironment + "/apsdb/rest/" + apstrataHomeKey + "/RunScript?apsws.authMode=simple&apsdb.scriptName=widgets.Registration.verifyAccount&login=$login&d=$confirmation";

// The URL where to redirect the user after he submits his registration form. Change this according to your own environment.
var registrationRedirectUrl = "http://www.apstrata.com/page.php?pageId=processingReg";

// The promotion codes that will be distributed to developers
var promotionCodes = [];

 // set this property to true if you need to trigger the execution of an additional step in the registration process\
// (used by default in widgets.Registration.registerUser and widgets.Registration.verifyAccount)
var extraStepNeeded = false; 

// set this property to the name of the server-side script that implements any additional extra step in the registration process
var extraStepScriptName = "";
var adminEmail = "admin@gmail.com"; 

var configuration = {
	projectName: projectName,
	defaultUsersGroup: defaultUsersGroup,
	//defaultUnconfirmedRegistrationStore: defaultUnconfirmedRegistrationStore,	
	apstrataHomeEnvironment: apstrataHomeEnvironment,	
	apstrataHomeKey: apstrataHomeKey,
	registrationType: registrationType,
	registrationRedirectUrl: registrationRedirectUrl,
	sendEmailOnceRegistrationConfirmed: sendEmailOnceRegistrationConfirmed,	
	promotionCodes: promotionCodes,
	extraStepNeeded: extraStepNeeded,
	extraStepScriptName: extraStepScriptName,
	templates: {
		adminEmail: adminEmail,
		subject: "$projectName Registration - Email Verification",
		body: "<div style='font-family:Calibri, font-size:11'>Hello $user,<br/><br/> Thank you for signing up to our $projectName <br/><br/> Please click on the link below to activate your account. If the link doesn't work, copy and paste the link directly into the address bar of your internet browser.<br/><a href='$url'>$url</a><br/><br/>Sincerely<br/><br/>The $projectName Team",		
		verifyUrl: verifyUrl 
	},

	templatesConfirmed: {
		adminEmail: adminEmail,
		subject: "$projectName Registration confirmed",
		body: ""
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