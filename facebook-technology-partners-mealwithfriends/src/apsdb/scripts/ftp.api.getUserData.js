<script>
<scriptACL>
	<execute>authenticated-users</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

	var userManager = apsdb.require("ftp.userManager");
	var login = userManager.getUserLoginFromRequest(apsdb, request);
	return userManager.getUser(apsdb, login);		
]]>
</code>
</script>