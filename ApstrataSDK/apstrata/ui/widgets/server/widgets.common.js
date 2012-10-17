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
var projectName = "Apstrata Web Site";

// The name of the default group to which subscribing users will belong once registered
var defaultUsersGroup = "users";

// The store where temporary registration documents will be created on the client application (user registration and/or account provisioning))
var defaultUnconfirmedRegistrationStore = "pendingRegistrations";	

// The auth key of the provisioning account on the client application
var apstrataHomeEnvironment = "https://varick.apstrata.com";

// The auth key of the provisioning account on the client application
var apstrataHomeKey = "E83D22E93F";

// The secret of the provisioning account on the client application
var apstrataHomeSecret = "XEA48AE769BF2B86910FBC74116CDF4E";

// The type of registration that is required ("user" -> for user registration, or "account" -> for account creation)
var registrationType = "account";

// Specify if an email should be sent to the user upon successful registration (true/false)
var sendEmailOnceRegistrationConfirmed = true;

// The URL that is sent in the verification e-mail for the subscriber to click on (you normally should not change this)
var verifyUrl = apstrataHomeEnvironment + "/apsdb/rest/" + apstrataHomeKey + "/RunScript?apsws.authMode=simple&apsdb.scriptName=widgets.Registration.verifyAccount&login=$login&d=$confirmation";

// The URL where to redirect the user after he submits his registration form
var registrationRedirectUrl = "http://www.apstrata.com/page.php?pageId=processingReg"
 
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
		body: "<div style='color: #003080;font: 14px Myriad,Helvetica,Tahoma,Arial,clean,sans-serif;'><div style='background-color: #003080;margin-bottom: 10px;'><img style='padding-left: 10px;' src='https://sandbox.apstrata.com/apsdb/rest/E83D22E93F/GetFile?apsws.time=1349340156020&apsws.authSig=dfd97bc84026e3004ada2613d40d8b77&apsws.responseType=json&apsws.authMode=simple&apsdb.fileName=apstratalogo.png&apsdb.store=apstrata&apsdb.documentKey=ApstrataLogo&apsdb.fieldName=apsdb_attachments'></div>Dear $user,<br><br><span style='font-size:1.5em;line-height:200%'>Welcome to Apstrata.</span><br/>You now have access to your Apstrata account. Please use the email and password you provided to login to the Apstrata site.<br><br>The home page of the <a href='www.apstrata.com'>Apstrata website</a> is a live link into the documentation. Simply click on an icon to find out more about that feature.<br><br>In addition, here are some links you may find useful:<br><br><ul><li>Documentation can be found <a href='http://wiki.apstrata.com'>here</a><br><br></li><li>Language-specific API clients can be downloaded <a href='http://code.google.com/p/apstrata/downloads/list'>here</a><br><br></li><li>The Developer Workbench can be found <a href='http://workbench.apstrata.com'>here</a><br><br></li></ul><span style='font-size:1.5em'>If you need assistance:</span><br><br> email us at <b>support@apstrata.com </b>and we will respond within one business day.<br><br>Thank you for using Apstrata.<br><br> We got your back.<br>The Apstrata team</div>"
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