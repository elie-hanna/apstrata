<script>
<scriptACL>
     <execute>group:users</execute>
     <read>group:users</read>
     <write>group:users</write>
</scriptACL>
<code><![CDATA[

var params = {
	login: request.parameters["login"]
}

return apsdb.callApi("GetUser", params, null).metadata

]]>
</code>
</script>
