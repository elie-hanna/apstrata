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

var accountCreationEnvironment = "";
var accountCreationKey = "";
var accountCreationSecret = "";
 
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