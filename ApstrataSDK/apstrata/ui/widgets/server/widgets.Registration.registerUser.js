<script>
<scriptACL>
     <execute>anonymous</execute>
     <read>group:developers</read>
     <write>group:developers</write>
</scriptACL>
<code><![CDATA[

/*
 * This script can be used to register users or to create accounts (if the caller is entitled to do so).
 * @param : mandatory parameters are "user.name", "user.email", "user.login", "user.password"
 * @param : optional parameters are "user.groups" (not when creating account), "user.company",
 * "user.webSite", "user.jobTitle", "user.phone"
 * Parameters not prefixed with "user" will not be saved.
 * @return { metadata : { status :"success" }, url: redirection_url} if registrationRedirectURL is
 * specified in widgets.common or true if not specified
 *  or
 * {metadata : {status : "failure", errorDetail : "xxxx", errorCode: "yyyy"}} in case of failure
 */

var logLevel = request.parameters["logLevel"];
if (logLevel) {
	apsdb.log.setLogLevel(logLevel);
}

var widgetsCommon = apsdb.require("widgets.common")

var configuration = widgetsCommon.getConfiguration()



if(request.parameters["recaptcha_challenge_field"]){
	var recaptchaChallengeField = request.parameters["recaptcha_challenge_field"];
	var recaptchaResponseField = request.parameters["recaptcha_response_field"];
	 
	var captchaVerifyURL="http://www.google.com/recaptcha/api/verify";	 
	var postParams = {
		"privatekey": "6Lc81vwSAAAAAAoE5sjXNRXTfxfYaj5k9V_t7kl5", 
		"remoteip": request.headers["x-forwarded-for"], 
		"challenge": recaptchaChallengeField, 
		"response": recaptchaResponseField,		
	};
	var captchaResponse = apsdb.callHttp(captchaVerifyURL, "POST", postParams);
	if(captchaResponse.body.indexOf(false)!="-1"){
		return {
			metadata : { 
				status: "failure", 
				errorDetail: "wrong captcha",
				errorCode: "WRONG_CAPTCHA" 
			}
		};
	}

	

}
	
function generateCode() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function sendEmail(validationCode) {
	var url = widgetsCommon.parseTemplate(
		configuration.templates.verifyUrl, 
		{login: params.login, confirmation: validationCode})

	var tokens = {
	    projectName: configuration.projectName,
	    user: params.name,
	    url: url
	}
	
	var emailSubject = widgetsCommon.parseTemplate(configuration.templates.subject, tokens)
	var emailBody = widgetsCommon.parseTemplate(configuration.templates.body, tokens)
		
	var sendEmailInput = {
		"apsma.from": configuration.adminEmail, 
		"apsma.to": params.email, 
		"apsma.subject": emailSubject, 
		"apsma.htmlBody": emailBody,		
	};
	
	apsdb.log.debug("Email parameters", {params:sendEmailInput});
	
	return apsdb.callApi("SendEmail", sendEmailInput, null);		
}

function checkUser(login) {
	var params = {
		login: login
	}

	return apsdb.callApi("GetUser", params, null).metadata.status;
}
/*
 * This function validate promotion codes if these are sent by the registration widget 
 * (default implementation of this widget does not include a field for promotion codes)
 */
function validatePromotionCode(promotionCode) {
	if (promotionCode) {
		if (configuration.promotionCodes) {
			for (var i = 0; i < configuration.promotionCodes.length; i++) {
				if (promotionCode == configuration.promotionCodes[i]) {
					return {metadata:{status: "success"}};
				}
			}
		}
		

		var response = {metadata:{status: "failure", errorCode: "INVALID_PROMOTION_CODE", errorDetail: "The promotion code you entered is not valid. Please try again."}}
		var url = configuration.registrationRedirectUrl;
	
		if (url && url != ""){
			url = url + "&status=error&error=" + response.metadata.errorDetail;
			response.url = url;
		}				
		
		return response;
	}
	
	return {metadata:{status: "success"}};
}

try {
// Validate any promotion code sent by the registration request along the registration parameters
	var validatePromotionCodeResult = validatePromotionCode(request.parameters["user.promotionCode"]);
	if (validatePromotionCodeResult.metadata.status == "failure") {
		return validatePromotionCodeResult;
	}
	

	var params = {}
	
	for (k in request.parameters) {
		// Only parameters sent with the "user." prefix will be saved in the user profile
		if (k.indexOf('user.')>=0) {
			if ((k == "user.login") && (checkUser(request.parameters[k]) == "success"))  {		
				return {
					metadata : { 
						status: "failure", 
						errorDetail: "Unable to register user [Login already exists]",
						errorCode: "DUPLICATE_USER" 
					}
				};								
			}	
			
			if (k == "user.groups")	{	
				
				var groupsAsStr = request.parameters[k];
				if (groupsAsStr){
					groupsAsStr = groupsAsStr.replace(" ", "");
					var groups = groupsAsStr.split(",");
					params["groups"] = groups;
				}
			} else {
				//  Otherwise save param in the user profile
				params[k.substring(5)] = request.parameters[k];			
			}
		}
	}
	
	// If no user.login was sent in the request, create one from the user's e-mail
	if (!params["login"]) {
	     params["login"] = params["email"];
	     
	     // verify that this login doesn't already exist
	     if ((checkUser(params["login"]) == "success"))  {		
			return { 
				metadata : {
					status: "failure", 
					errorDetail: "Unable to register user [email already exists]",
					errorCode: "DUPLICATE_USER"
				}
			};								
		}	
	}
	
	// Suspend the user account as we need him to confirm by clicking on the link sent by e-mail
	params["isSuspended"] = "true";
	
	// Create a validation code and save as part of the user's profile attributes
	// The code will be sent along the verification email and will be removed upon confirmation
	var validationCode = generateCode();
	params["code"] = validationCode;
	
	// Save the user
	apsdb.log.debug("Save user params", {params: params});
	saveUserResult = apsdb.callApi("SaveUser", params, null);
	
	if (saveUserResult.metadata.status == "success") {
		
		var sendEmailResult = sendEmail(validationCode);
		if (sendEmailResult.metadata.status == 'failure') {			
			return { 
				status: "failure", 
				errorDetail: "Unable to send email [" 
				 + sendEmailResult.metadata.errorDetail + "]",
				 params : params 	
			};
		} else {
			
			// Insert here any extra step you would like to add to the process and set the widgets.common.extraStepNeed 
			// and widgets.common.extraStepScriptName accordingly. The following contains default registration step for 
			// Asptrata that might not work in your case.
			if(configuration.extraStepNeeded){
				
				var extraStepManager = apsdb.require(configuration.extraStepScriptName);
				var result = extraStepManager.handleStep(apsdb, "saveUser", params);
				if(result.status == 'failure') {			
					var parameters = {
					  login: params["login"]				
				  	}
					 apsdb.callApi("DeleteUser", parameters, null);
					 return result;
				}	
			}
					
			var url = true;		
			if ((configuration.registrationRedirectUrl) && (configuration.registrationRedirectUrl != "")){
				url = configuration.registrationRedirectUrl;
			}
			return {
				metadata: {
					status : "success"
				},
				url : url				
			}
		}
		
	} else {		
		return { 
			status: "failure", 
			errorDetail: "Unable to register user [" 
			 + saveUserResult.metadata.errorCode + "]"
		};
	}
}catch(exception) {	
	return { 
		status: "failure", 
		errorDetail: "Unable to register user [" 
		 + exception + "]"
	};	
}


]]>
</code>
</script>