<script>
<scriptACL>
     <execute>anonymous</execute>
     <read>group:developers</read>
     <write>group:developers</write>
</scriptACL>
<code><![CDATA[

/**
 * Checks if user is registered
 *
 * @param {string} login user login
 *
 * @returns {boolean} true user exists 
 */

var params = {
	login: request.parameters["login"]
}

return (apsdb.callApi("GetUser", params, null).metadata.status == "success")

]]>
</code>
</script>