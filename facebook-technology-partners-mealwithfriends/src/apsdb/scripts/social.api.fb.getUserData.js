<script>
<scriptACL>
	<execute>authenticated-users</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * Invoke this script in order to retrieve the data of the current user (the one sending the request)
 */
	var userManager = apsdb.require("social.fb.userManager");
	var login = userManager.getUserLoginFromRequest(apsdb, request);
	
	// the script should not be called as an account owner
	if (login.indexOf("#") > 1) {
	
		throw {
		
			"errorCode": "INVALID_USER",
			"errorDetail": "You cannot use this API as an account owner"
		}
	}	
	
	return userManager.getUser(apsdb, login);		
]]>
</code>
</script>