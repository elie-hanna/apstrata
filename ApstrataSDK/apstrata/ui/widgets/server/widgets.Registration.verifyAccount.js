<script>
<scriptACL>
  <execute>anonymous</execute>
  <read>nobody</read>
  <write>nobody</write>
</scriptACL>
<code><![CDATA[

var params = {
	login: request.parameters["login"]
}

var user = apsdb.callApi("GetUser", params, null)

if (user.result.user.groups == "unconfirmedRegistrations") {
	if (user.result.user.confirmationCode == request.parameters.d) {
		var params = {
			login: request.parameters["login"],
			groups: user.result.user.finalGroups,
			"finalGroups.apsdb.delete":"",
			"confirmationCode.apsdb.delete":"",
			"apsdb.update": "true"
		}
		
		return apsdb.callApi("SaveUser", params, null)
	} else {
		return {
			status: "failure", 
			errorDetail: "WRONG_CONFIRMATION_CODE" 	
		}
	}
}


]]>
</code>
</script>