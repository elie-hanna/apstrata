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

var accountCreationEnvironment = "https://test-apps.apstrata.com";
var accountCreationKey = "WC7A01F4C8";
var accountCreationSecret = "TC8F2E246874CB3C86856C33BCB2047F";
 
var advancedConfiguration = {	
	accountCreationEnvironment: accountCreationEnvironment,	
	accountCreationKey: accountCreationKey,
	accountCreationSecret: accountCreationSecret,	
}

function getConfiguration() {
	return advancedConfiguration;
}

]]>
</code>
</script>