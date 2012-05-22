<script>
<scriptACL>
     <execute>anonymous</execute>
     <read>group:developers</read>
     <write>group:developers</write>
</scriptACL>
<code><![CDATA[

var configuration = {
	projectName: "MyProject",
	templates: {
		adminEmail: "dude@dude.com",
		subject: "$projectName Registration - Email Verification",
		body: "<div style='font-family:Calibri, font-size:11'>Hello $user,<br/><br/> Thank you for signing up to our $projectName <br/><br/> Please click on the link below to activate your account. If the link doesn't work, copy and paste the link directly into the address bar of your internet browser.<br/><a href='$url'>$url</a><br/><br/>Sincerely<br/><br/>The $projectName Team",
		verifyUrl: "https://sandbox.apstrata.com/apsdb/rest/RA422AED62/RunScript?apsws.authMode=simple&apsdb.scriptName=widgets.Registration.verifyAccount&login=$login&d=$confirmation"
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