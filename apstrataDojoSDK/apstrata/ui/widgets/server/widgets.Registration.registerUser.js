<script>
<scriptACL>
     <execute>group:users</execute>
     <read>group:users</read>
     <write>group:users</write>
</scriptACL>
<code><![CDATA[

function registerUser(params) {
	for (k in request.parameters) {
		if (k.indexOf('user.')>=0) {
			if (k == "user.groups") 
				params["finalGroups"] = request.parameters[k];
			else 
				params[k.substring(5)] = request.parameters[k]
		}
	}
	params.groups = "unconfirmedRegistrations"
	return apsdb.callApi("SaveUser", params, null)
}

function getUserStatus() {
	var user = apsdb.callApi("GetUser", 
		{ login: request.parameters["user.login"] }, null)
	
	var status 
	
	if (user.metadata.status == "success") {
		if (user.result.groups=="unconfirmedRegistrations") {
			status = 1
		} else {
			status = 2
		}
	} else if (user.result.metadata.errorCode == "INVALID_USER") {
		status = 0
	}
		
	return status
}

var status = getUserStatus()
var params = {}
if (status == 1) params["apsdb.update"] = true
if (status == 2) return {success: "failue", errorCode: "DUPLICATE_USER"}

	return registerUser(params).metadata

]]>
</code>
</script>
