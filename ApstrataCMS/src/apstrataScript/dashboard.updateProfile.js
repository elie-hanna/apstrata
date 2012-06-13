<script>
<scriptACL>
     <execute>authenticated-users</execute>
     <read>nobody</read>
     <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * Use this script in order to update the profile of a given user.
 * @param login : the login of the user (mandatory)
 * @param password : the password of the user
 * @param name : the name of the user
 * @param email : the email of the user, as specified in the user document 
 * @param company : the name of the user's company -> profile document
 * @param jobTitle : the user's job title -> profile document
 * @param phone : the user's phone -> profile document
 * @param webSite : the user's web site -> profile document
 */
 
try {
	var zLogLevel = request.parameters["logLevel"];
	if (zLogLevel){
		apsdb.log.setLogLevel(zLogLevel); 
	}
	
	var transaction = null;
	
	transaction = apsdb.beginTransaction();
		
	var login = request.parameters["login"];
	var name = request.parameters["name"];
	var email = request.parameters["email"];
	var password = request.parameters["password"];
	
	var saveUserParams = {	
		login : login,
		"apsdb.update" : "true"
	}
		
	
	if (name) {
		saveUserParams["name"] =  name;
	}
	
	if (password) {
		saveUserParams["password"] =  password;
	}
	
	if (email) {
		saveUserParams["email"] =  email;
	}	
	
	if (request.parameters["company"]) {
		saveUserParams["company"] = request.parameters["company"];	
	}
		
	if (request.parameters["phone"]) {
		saveUserParams["phone"] = request.parameters["phone"];
	}
	
	if (request.parameters["jobTitle"]) {
		saveUserParams["jobTitle"] = request.parameters["jobTitle"];
	}
	
	if (request.parameters["webSite"]) {
		saveUserParams["webSite"] = request.parameters["webSite"];
	}	
	
	var saveProfileResponse = apsdb.callApi("SaveUser", saveUserParams, null);
	
	apsdb.log.debug("SAVEPROFILERESPONSE", {resp: saveProfileResponse } );
	
	if (saveProfileResponse.metadata.status == "failure") {
		throw saveProfileResponse.metadata.errorDetail;
	}
	
	if (transaction) {
		transaction.commit();
	}
	
	return {status : "success"}

}catch(error) {
	if (transaction) {
		transaction.rollback();
	}
	
	return {status : "failure", errorDetail : error};
}	
]]>
</code>
</script>