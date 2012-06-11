<script>
<scriptACL>
     <execute>authenticated-users</execute>
     <read>nobody</read>
     <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * Use this script in order to update the profile of a given user.
 * The script will update the user and the profile (docKey = userloginProfile) documents.
 * @param login : the login of the user (mandatory)
 * @param password : the password of the user
 * @param name : the name of the user
 * @param email : (optional) the email of the user, as specified in the user document 
 * @param company : (optional) the name of the user's company -> profile document
 * @param jobTitle : (optional) the user's job title -> profile document
 * @param phone : (optional) the user's phone -> profile document
 * @param webSite : (optinal) the user's web site -> profile document
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
		"login" : login,
		"name" : name,
		"password" : password,
		"apsdb.update" : "true"
	}
	
	if (email) {
		saveUserParams["email"] =  email;
	}
		
	var saveUserResponse = apsdb.callApi("SaveUser", saveUserParams, null);
	
	apsdb.log.debug("SAVEUSERRESPONSE", {resp: saveUserResponse } );
			
	if (saveUserResponse.metadata.status == "failure") {
		throw saveUserResponse.metadata.errorDetail;
	}
	
	var saveProfileParams = {
		"apsdb.documentKey" : login.replace("@", "_at_") + "Profile",		
		"apsdb.update" : "true"
	}
	
	if (request.parameters["company"]) {
		saveProfileParams["company"] = request.parameters["company"];
	}
	
	if (request.parameters["phone"]) {
		saveProfileParams["phone"] = request.parameters["phone"];
	}
	
	if (request.parameters["jobTitle"]) {
		saveProfileParams["jobTitle"] = request.parameters["jobTitle"];
	}
	
	if (request.parameters["webSite"]) {
		saveProfileParams["webSite"] = request.parameters["webSite"];
	}	
	
	var saveProfileResponse = apsdb.callApi("SaveDocument", saveProfileParams, null);
	
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