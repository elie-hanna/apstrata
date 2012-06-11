<script>
<scriptACL>  
	<execute>authenticated-users</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * This script provides utility functions that call the GetAccount and ListAccounts 
 * through http calls, using the account owner's credentials defined in widgets.common.
 * It also provides a function to retrieve the profile of a user, i.e. it's user info,
 * company info and list of accounts (accountId, authKey, secret)
 * You can call this script directly through a request or invoke its functions from another script.
 * when called through a request:
 * @param function : the name of the function to call ("getProfile", "getAccount" or "listAccounts")
 * @param login : the user's login if getProfile() or listAccounts() by login (login and authKey are mutually exclusive)
 * @param authKey : the user's authKey if getProfile(), getAccount() or listAccount() by authKey (if login + autKey only login is kept)
 * @param logLevel : the logLevel (optional)
 * @param subject (only if function is "sendAdminMail")
 * @param message (only if function is "sendAdminMail")
  * @param to (only if function is "sendAdminMail")
 */
var widgetsCommon = apsdb.require("widgets.common");
var configuration = widgetsCommon.getConfiguration();

var zLogLevel = request.parameters["logLevel"];
if (zLogLevel){
	apsdb.log.setLogLevel(zLogLevel); 
}
	
var zLoginType = "";
var zUserKey = "";

var authKey = request.parameters["authKey"];
if (authKey) {
	zLoginType = "authKey";
	zUserKey = authKey;
}

var zUserLogin = request.parameters["login"];

if (zUserLogin) {
	zLoginType = "login";
	zUserKey = zUserLogin;
}


var functionName = request.parameters["function"];

try {
	if (functionName == "getAccount"){
		var response = getAccount(zUserKey );
		return response;
	}
	
	if (functionName == "listAccounts"){
		var response = listAccounts(zUserKey , zLoginType);
		return response;
	}
	
	if (functionName == "getProfile"){
		var response = getProfile(zUserKey, zLoginType);
		return response;
	}
	
	if (functionName == "regenerateSecret"){
		var response = regenerateSecret(zUserKey);
		return response;
	}
	
	if (functionName == "sendAdminMail"){
		var subject = request.parameters["subject"];
		var message = request.parameters["message"];
		var response = sendAdminMail(subject, message, zUserKey, zLoginType);
	}
	
	throw "Invalid function name";

}catch(error){
	return {status : "failed", errorDetail : error};
}

// Retrieve the login of the user from the request
function getProfile(userKey, loginType) {
	
	var userLogin = userKey;
	
	// If no login available use the authKey to get the login from the account info	
	if (loginType == "authKey") {		
		
		var accountResponse = listAccounts(userKey, loginType);
		apsdb.log.debug("LISTACCOUNTRESPONSE", {resp: listAccountsResponse} );	
		if (accountResponse.status == "failure" ) {
			return accountResponse;
		}
		
		userLogin = accountResponse.accounts[0].accountId;
	}
	
	// Retrieve the information on the user from the user directory	
	var userResponse = apsdb.callApi("GetUser", {"login" : userLogin}, null);
			
	if (userResponse.metadata.status == "failure") {
		throw userResponse.metadata.errorDetail;
	}	
	
	// Get the accounts created by this user
	var listAccountsResponse = listAccounts(userLogin, "login");	
	apsdb.log.debug("LISTACCOUNTRESPONSE", {resp: listAccountsResponse} );	
	if (listAccountsResponse.status == "failure") {
		
		throw listAccountsResponse.metadata.errorDetail;
	}	
	
	var accountsAsIs = listAccountsResponse.accounts;
	var accounts = new Array();
	for (var i = 0; i < accountsAsIs .length; i++) {
	
		// Get the secret for this account
		var getAccountResponse = getAccount(accountsAsIs[i].aps_authKey);
					
		accounts.push( {
				accountId : accountsAsIs [i].accountId,
				authKey : accountsAsIs[i].aps_authKey,
				secret : getAccountResponse.account.aps_authSecret
				}
			);
	}	
	
	// Retrieve the user profile from the profile document
	var queryParams = {
		"apsdb.query" : "apsdb.documentKey = \"" + userLogin.replace("@", "_at_") + "Profile\"",
		"apsdb.queryFields" : "*"
	}
	
	var userProfileResponse = apsdb.callApi("Query", queryParams, null);
	
	if (userProfileResponse.metadata.status == "failure") {		
		return userProfileResponse.metadata.errorDetail ;
	}
	
	if (!userProfileResponse.result.documents || userProfileResponse.result.documents.length == 0) {
		return {
			status: "failure",
			errorDetail: "User profile not found"
		}
	}
	
	var userProfile = {		
		login: userLogin,
		email: userResponse.result.user.email,
		name: userResponse.result.user.name,
		groups: userResponse.result.user.groups,
		company: userProfileResponse.result.documents[0].company,
		webSite: userProfileResponse.result.documents[0].webSite,
		jobTitle: userProfileResponse.result.documents[0].jobTitle,
		phone: userProfileResponse.result.documents[0].phone,
		availableAccounts :  accounts
	}
	
	return {
		status: "success",
		profile: userProfile
	}	
}

/*
 * @param key the login or the authKey of the user
 * @param loginType if "authKey" userLogin is an authKey. Otherwise or if void, it is a login
 * @return the list of its accounts
 */
function listAccounts(key, loginType) {	

	var query = "";
		
	if (loginType == "authKey"){
		query = encodeURIComponent("aps_authKey = \"" + key + "\"");
	}else{
		query = encodeURIComponent("accountId = \"" + key + "\"");
	}
				
	// Sign the request
	var zurl = signUrl("ListAccounts");	
	zurl = zurl + "&apsdb.query=" + query + "&apsws.responseType=json";
		
	var res = apsdb.callHttp(zurl , 'GET', null, null, null, null, true, null, false, false);
	
	apsdb.log.debug("URL", {url: zurl} );	
	apsdb.log.debug("@@@@ ListAccounts", {key: key, loginType : loginType,  query : query , response : res } );
	return parseResultOrThrowError(res);

}

/*
 * @param an authKey
 * @return the data on the correponding account
 */
function getAccount(accountAuthKey){
								
	// Sign the request
	var zurl = signUrl("GetAccount");			
	zurl = zurl + "&apsdb.authKey=" + accountAuthKey + "&apsws.responseType=json";
		
	var res = apsdb.callHttp(zurl , 'GET', null, null, null, null, true, null, false, false);
	
	apsdb.log.debug("URL", {url: zurl} );	
	apsdb.log.debug("@@@@ RESPONSE", {response : res } );
	return parseResultOrThrowError(res);
	
}

/*
 * @param an authKey
 * @return the data on the correponding account
 */
function regenerateSecret(accountAuthKey) {
	
	// Sign the request
	var zurl = signUrl("ModifyAccount");			
	zurl = zurl + "&apsdb.authKey=" + accountAuthKey;
	zurl = zurl +  "&apsdb.regenerateSecret=" + true + "&apsws.responseType=json";
		
	var res = apsdb.callHttp(zurl , 'GET', null, null, null, null, true, null, false, false);
	
	apsdb.log.debug("URL", {url: zurl} );	
	apsdb.log.debug("@@@@ RESPONSE", {response : res } );
	return parseResultOrThrowError(res);
}

/*
 * @param to : an authKey or a login. If authkey, the email of the account is used, if login, the user's
 * @param loginType : "authKey" or "login" (filled by the script)
 * @param subject : email subject
 * @param message : email message
 */
function sendAdminMail(subject, message, to, loginType) {
	
	var subj = encodeURIComponent(subject);
	var message = encodeURIComponent(message);
	var toEmail = "";
	
	if (loginType == "login") {
		var userResponse = apsdb.callApi("GetUser", {"login" : to}, null);
		if (userResponse.metadata.status == "failure") {
			throw userResponse.metadata.errorDetail;
		}
		
		toEmail = userResponse.result.user.email;
	}else {
		var getAccountResponse = getAccount(to);				
		var mail = getAccountResponse.account.email;
		toEmail = mail.substring(mail.indexOf("_") + 1);
		apsdb.log.debug("@@@@ TO", {to : to, EMAIL : toEmail, loginType : loginType} );
	}		
	
	// Sign the request
	var zurl = signUrl("SendEmail");
	zurl = zurl + "&apsma.to=" + toEmail;
	zurl = zurl + "&apsma.subject=" + subj + "&apsma.body=" + message;
	
	var res = apsdb.callHttp(zurl , 'GET', null, null, null, null, true, null, false, false);
	
	apsdb.log.debug("URL", {url: zurl} );	
	apsdb.log.debug("@@@@ RESPONSE", {response : res } );
	return parseResultOrThrowError(res);
}

/*
 * Utiltiy function that factors the logic that is used to signa url
 * @param : the Apstrata action
 * @return  the first part of the URL before the parameters, 
 */
function signUrl(zAction){

	// Sign the request
	var authKey = configuration.accountCreationKey;
	var authSecret = configuration.accountCreationSecret;
	var restUrl = configuration.accountCreationEnvironment + "/apsdb/rest";
	var action = zAction;	
	var submitUrl = restUrl + "/" + authKey + "/" + action ;			
	var ts = new Date().getTime();		
	var valueToHash = ts + authKey + action + authSecret;
	var hash = hex_md5(valueToHash);
	var url = submitUrl + "?apsws.time=" + ts + "&apsws.authSig=" + hash + "&apsws.authMode=simple";
	return url;
}

/*
 * Parses the returned response in JSON format. Returns the actual "result" section
 * or throws the errorDetail as an exception in case of failure
 * @param resp : the response received from the callHttp
 */
function parseResultOrThrowError(resp) {
	
	var zFile = resp["file"];
	var zContent = zFile["content"];
	var pContent = JSON.parse(zContent);
	var zResponse = pContent["response"];	
	var zMetadata = zResponse["metadata"];
	var zStatus = zMetadata["status"];
	if (zStatus == "failure") {
		var zErrorDetail = zMetadata ["errorDetail"];		
		throw { status : "failure" , errorDetail : zErrorDetail};
	}
	
	var zResult = zResponse["result"];
	return zResult ;
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1. It only merges first level attributes.
 *
 * @param obj1 An object with no nested objects.
 * @param obj2 An object with no nested objects.
 *
 * @returns A new object based on obj1 and obj2.
 */
function shallowMerge (obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) {
    	obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
    	obj3[attrname] = obj2[attrname];
    }

    return obj3;
}

/**
 * Takes a number value and if it has 1 digit, it returns the value prefixed with a "0".
 *
 * @param value
 *
 * @returns
 */
function atLeastTwoDigits (value) {
	return value < 10 ? "0" + value : value;
}

/**
 * Clones the attributes of the passed object and returns the cloned object.
 */
function cloneObject (objectToClone) {
	return eval(uneval(objectToClone));
}

/**
 * Takes the created_time value returned from facebook's graph api calls, and creates a javascript date object.
 *
 * @param dateStr
 * 			A date string that is expected to look like: "2012-02-15T20:03:46+0200"
 *
 * @returns A Date object that corresponds to the passed date string
 */
function parseDate (dateStr) {
	var dateTimeArray = dateStr.split("T"); // separate the date from the time.
	var dateArray = dateTimeArray[0].split("-"); // get individual values for year/month/day.

	var outputDate = new Date();

	// use setUTC since facebook returns everything in UTC time [+0000]
	outputDate.setUTCFullYear(dateArray[0]);
	outputDate.setUTCMonth(dateArray[1] -1); // js month count is from 0 - 11
	outputDate.setUTCDate(dateArray[2]);

	if (dateTimeArray[1]) {
		var timeArray = dateTimeArray[1].split("+")[0].split(":"); // get individual values for hour/minute/second.
		outputDate.setUTCHours(timeArray[0]);
		outputDate.setUTCMinutes(timeArray[1]);
		outputDate.setUTCSeconds(timeArray[2]);
	}

	return outputDate;
}

/**
 * Sets the time (hours/minutes/seconds/milliseconds) of the date to 0.
 * NOTE: The timezone offset still takes effect.
 *
 * @param date
 *
 * @returns The passed date without the time
 */
function removeTimeFromDate (date) {
	var newDate = new Date(date.getTime());
	newDate.setUTCHours(0);
	newDate.setUTCMinutes(0);
	newDate.setUTCMilliseconds(0);
	newDate.setUTCSeconds(0);

	return newDate;
}
  /**
   * strip out all apsdb. and apsws. parameters from a given document if existing
   * 
   * @param doc
   * @return JSON document
   */                    
  function stripOutApsParams (doc) {                           
	var prop = null;
	var result = {};
	for(prop in doc) {
		if (prop.indexOf("apsdb.")==-1 && prop.indexOf("apsws.")==-1 && prop != "key" && prop != "versionNumber" ) {
			result[prop] = doc[prop];
		}
	}
	return result;
  }
  
///////////////////////////// twitterDM notification functions//////////////////////
  function OAuth_nonce(length) {
      var nonceChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
      var result = "";
      for (var i = 0; i < length; ++i) {
          var rnum = Math.floor(Math.random() * nonceChars.length);
          result += nonceChars.substring(rnum, rnum+1);
      }
      return result;
  }

  function OAuth_timestamp() {
      var t = (new Date()).getTime();
      return Math.floor(t / 1000);
  }

  function OAuth_percentEncode(s) {
      if (s == null) {
          return "";
      }
      if (s instanceof Array) {
          var e = "";
          for (var i = 0; i < s.length; ++s) {
              if (e != "") e += '&';
              e += OAuth.percentEncode(s[i]);
          }
          return e;
      }
      s = encodeURIComponent(s);
      // Now replace the values which encodeURIComponent doesn't do
      // encodeURIComponent ignores: - _ . ! ~ * ' ( )
      // OAuth dictates the only ones you can ignore are: - _ . ~
      // Source: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
      s = s.replace(/\!/g, "%21");
      s = s.replace(/\*/g, "%2A");
      s = s.replace(/\'/g, "%27");
      s = s.replace(/\(/g, "%28");
      s = s.replace(/\)/g, "%29");
      return s;
  }

  /* Send a direct message "text" to "screen_name" */
  function sendDirectMessage (apsdb, screen_name, text){
  	
  	var configuration = apsdb.require("Configuration");
  	var shaLib = apsdb.require("SHA1Lib");
  	
  	var twitterDMURL = configuration.twitterDMURL; 
  	var consumer_key = configuration.twitterConsumerKey;
  	var consumer_secret = configuration.twitterConsumerSecret; 
  	var access_key = configuration.twitterAccessKey; 
  	var access_secret = configuration.twitterAccessSecret; 	
  	
  	var method = "POST";
  	var version = "1.0";
  	var nonce = OAuth_nonce(9);
  	var timestamp = OAuth_timestamp();
  	var signature_method = "HMAC-SHA1";
  	var signature_key = OAuth_percentEncode (consumer_secret) + "&" + OAuth_percentEncode (access_secret);

  	
  	var encodedMessage = method + "&" + OAuth_percentEncode(twitterDMURL) + 
  		"&oauth_consumer_key" + OAuth_percentEncode("=" +  OAuth_percentEncode(consumer_key) + "&") +
  		"oauth_nonce" + OAuth_percentEncode("=" +  OAuth_percentEncode(nonce) + "&") +
  		"oauth_signature_method" + OAuth_percentEncode("=" +  OAuth_percentEncode(signature_method) + "&") +
  		"oauth_timestamp" + OAuth_percentEncode("=" +  OAuth_percentEncode(timestamp) + "&") +
  		"oauth_token" + OAuth_percentEncode("=" +  OAuth_percentEncode(access_key) + "&") +
  		"oauth_version" + OAuth_percentEncode("=" +  OAuth_percentEncode(version) + "&") +
  		"screen_name" + OAuth_percentEncode("=" +  OAuth_percentEncode(screen_name) +"&") +
  		"text" + OAuth_percentEncode("=" + OAuth_percentEncode(text)) ;
  	
  	var signature = shaLib.b64_hmac_sha1(signature_key, encodedMessage) + "=";
  	var fullPost = twitterDMURL + "?screen_name=" + OAuth_percentEncode(screen_name) + 
  		"&text=" + OAuth_percentEncode(text) +
  		"&oauth_consumer_key=" + OAuth_percentEncode(consumer_key) + 
  		"&oauth_token=" + OAuth_percentEncode(access_key) +
  		"&oauth_signature_method=" + OAuth_percentEncode(signature_method) + 
  		"&oauth_signature=" + OAuth_percentEncode(signature) +
  		"&oauth_timestamp=" + OAuth_percentEncode(timestamp) + 
  		"&oauth_nonce=" + OAuth_percentEncode(nonce) + 
  		"&oauth_version=" + OAuth_percentEncode(version) ;
  		
  	var httpResp = apsdb.callHttp(fullPost, method, null, null, null, null, false, null, false, false);
  	return httpResp;



  }
////////////////////////////////////////////////////////////////////////////////

  /**
   * Calls the ListStores API to check if a store exists.
   *
   * @param storeName
   *
   * @return true if the store exists, false otherwise.
   * @throws An error if the ListStores call fails.
   */
  function isStoreExists (apsdb, storeName) {
    var listStoresResult = apsdb.callApi("ListStores", {}, null);
    if (listStoresResult.metadata.status == "failure") {
      throw ("An error occurred while listing stores [" + listStoresResult.metadata.errorCode + "] [" + listStoresResult.metadata.errorDetail + "]");
    } else if (listStoresResult.result.count != '0') {
      // Loop through all the store names and check if the passed store name is among them.
      var stores = listStoresResult.result.stores;
      for (var i=0; i<stores.length; i++) {
        if (stores[i].name == storeName) {
          return true;
        }
      }
      return false;
    }
  }

  /**
   * Generate a random string of the passed length and return it.
   *
   * @param length Length of the generated string
   * @param alphaOnly true if the generated string should only contain alphabetic characters
   *
   * @return The generated string.
   */
  function generateRandomString (length, alphaOnly) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    // Add numeric characters to the possible characters in the generated string.
    if (!alphaOnly) {
      possible += '0123456789';
    }

    for(var i=0; i<length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  /**
   * trims the given string of spaces
   * @param str
   * @return
   */
  function trim (str){
	  if (typeof str != 'string')
		  return str;
	  if (str == '')
		  return str;
	  return str.replace(/^\s+|\s+$/g, '') ;
  }
  
	/**
		Validates that each item in the array "requiredParams" exists as a key in "params" and has a value.
		@param params: map of keys & values
		@param requiredParams: array of parameters that should exist as keys in params and should have values.
		@return an array:
				"status" = "success" or "failure" 
				if "failure" then result["errorDetail"] will be an array, keyed by the parameter names that that had an error, and containing 
				"errorDetail" with the reason
	*/
	function validateParamsNonEmpty (params, requiredParams) {
		
		var result = {"status":"success", "errorCode":{}, "errorDetail":{}};
		
		for (var i = 0; i < requiredParams.length; i ++){
			var key = requiredParams [i];
			var value = params [key];
			var keySuccess = {};
			keySuccess = validateParamIsSet (key,  value);
			
			if (keySuccess.status == "failure"){
				result.status = "failure";
				result["errorDetail"][key] = {"errorDetail":keySuccess.errorDetail};
				result["errorCode"][key] = {"errorCode":keySuccess.errorCode};
			}
		}
		
		return result;
		
	}
	
	/**
		Validates that the given value is not empty.
		@param name: The name of the parameter being validated.
		@param value: The value that must not be empty.
		@return an array keyed by "status" and "errorDetail". If status is "success" then validation passed, else status will be "failure" and errorDetail will give the description of the error.
	*/
	function validateParamIsSet (name, value) {
		var message = { "status" : "success" };
		
		var result = true;
		if (typeof value == 'undefined') {
			result = false;
		}else if (typeof value == 'string' && value == '') {
			result = false;
		}else if (typeof value == 'object' && value == null){
			result = false;
		}
		if (!result) {
			message = { "status": "failure", "errorCode": "MISSING_PARAMETER", "errorDetail": "This parameter is required: " + name };
		}		
		return message;
	}

	/**
		Returns true if the specified value is not empty, false otherwise.
		@param value
	*/
	function isParamSet (value) {
		var result = true;
		if (typeof value == 'undefined') {
			result = false;
		} else if (typeof value == 'string' && value == '') {
			result = false;
		}else if (typeof value == 'object' && value == null){
			result = false;
		}
		return result;
	}
	
	function generateDockey (str){		
		var result = hex_md5(str);
		return result;
	}

	function generateKey (params) {
		var conc = "";
		var key;
		for (key in params) {
			conc += params [key];
		}
		var result = hex_md5(conc);
		return result;
	}

	/**
	 * Check if the passed value is null, if its an object, or empty, if its a string.
	 */
	function isEmpty (value) {
		return ((typeof value == 'undefined' || value == null) || (typeof value == 'string' && value == ''));
	}

	/**
	 *  Extracts the login of the user if the user is not an owner account.
	 * Otherwise, returns the owner login sent.
	 */
	function getLogin (login, customer) {
	  if (!customer) {
	    return login.substring(0, login.lastIndexOf('@'));
	  } else {
	    return login;
	  }
	}

	/**
	 * Lists the passed user's groups.
	 *
	 * @param login Login of the owner account
	 *
	 * @return The groups of the passed user
	 */
	function getUserGroups (apsdb, login) {
	  // Get the groups of the passed owner user.
	  var listUserGroupsInput = {
	    "apsdb.query": 'login="' + login + '"',
	    "apsdb.attributes": "groups"
	  };
	  var listUserGroupsResult = apsdb.callApi("ListUsers", listUserGroupsInput, null);
	  if (listUserGroupsResult.metadata.status == 'failure') {
	    return { "status" : "failure", "errorDetail": "Unable to query for groups of the user " + login + " [" + listUserGroupsResult.metadata.errorCode + "]" };
	  } else if (listUserGroupsResult.result.users.length == 0) {
	    return { "status" : "failure", "errorDetail": "Could not find user " + login };
	  }
	
	  var groups = listUserGroupsResult.result.users[0].groups;
	  if (groups == null) {
	    groups = [];
	  }
	
	  if (typeof groups == 'string') {
	    groups = [ groups ];
	  }
	  
	  return { "status": "success", "groups": groups };
	}

/**
 * @returns The number of this week in this year.
 */
function getWeekOfYear (date) {
	var dateTemp = date;
	if (typeof date == 'undefined' || date == null) {
		dateTemp = new Date();
	}
	var onejan = new Date(dateTemp.getFullYear(),0,1);

	return Math.ceil((((dateTemp - onejan) / 86400000) + onejan.getDay()+1)/7);
}

/**
 * 
 * @returns A Date object corresponding to the first day [Sunday] of the passed in week.
 */
function getStartOfWeek(weekDay) {
	var sunday = new Date(weekDay);
	// Date.getDay() returns the day of the week as an int [0-6] where 0 is Sunday.
	// So to get the current week's first day we do:
	sunday.setDate(sunday.getDate() - sunday.getDay());
	
	// return the date object for sunday.
	return sunday;
}
/*
* A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
* Digest Algorithm, as defined in RFC 1321.
* Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
* Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
* Distributed under the BSD License
* See http://pajhome.org.uk/crypt/md5 for more info.
*/

/*
* Configurable variables. You may need to tweak these to be compatible with
* the server-side, but the defaults work in most cases.
*/
var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase */
var b64pad = ""; /* base-64 pad character. "=" for strict RFC compliance */

/*
* These are the functions you'll usually want to call
* They take string arguments and return either hex or base-64 encoded strings
*/
function hex_md5(s) { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
function b64_md5(s) { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
function hex_hmac_md5(k, d)
{ return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function b64_hmac_md5(k, d)
{ return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function any_hmac_md5(k, d, e)
{ return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

/*
* Perform a simple self-test to see if the VM is working
*/
function md5_vm_test()
{
return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
}

/*
* Calculate the MD5 of a raw string
*/
function rstr_md5(s)
{
return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}

/*
* Calculate the HMAC-MD5, of a key and some data (raw strings)
*/
function rstr_hmac_md5(key, data)
{
var bkey = rstr2binl(key);
if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

var ipad = Array(16), opad = Array(16);
for(var i = 0; i < 16; i++)
{
ipad[i] = bkey[i] ^ 0x36363636;
opad[i] = bkey[i] ^ 0x5C5C5C5C;
}

var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
}

/*
* Convert a raw string to a hex string
*/
function rstr2hex(input)
{
try { hexcase } catch(e) { hexcase=0; }
var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
var output = "";
var x;
for(var i = 0; i < input.length; i++)
{
x = input.charCodeAt(i);
output += hex_tab.charAt((x >>> 4) & 0x0F)
+ hex_tab.charAt( x & 0x0F);
}
return output;
}

/*
* Convert a raw string to a base-64 string
*/
function rstr2b64(input)
{
try { b64pad } catch(e) { b64pad=''; }
var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var output = "";
var len = input.length;
for(var i = 0; i < len; i += 3)
{
var triplet = (input.charCodeAt(i) << 16)
| (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
| (i + 2 < len ? input.charCodeAt(i+2) : 0);
for(var j = 0; j < 4; j++)
{
if(i * 8 + j * 6 > input.length * 8) output += b64pad;
else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
}
}
return output;
}

/*
* Convert a raw string to an arbitrary string encoding
*/
function rstr2any(input, encoding)
{
var divisor = encoding.length;
var i, j, q, x, quotient;

/* Convert to an array of 16-bit big-endian values, forming the dividend */
var dividend = Array(Math.ceil(input.length / 2));
for(i = 0; i < dividend.length; i++)
{
dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
}

/*
* Repeatedly perform a long division. The binary array forms the dividend,
* the length of the encoding is the divisor. Once computed, the quotient
* forms the dividend for the next step. All remainders are stored for later
* use.
*/
var full_length = Math.ceil(input.length * 8 /
(Math.log(encoding.length) / Math.log(2)));
var remainders = Array(full_length);
for(j = 0; j < full_length; j++)
{
quotient = Array();
x = 0;
for(i = 0; i < dividend.length; i++)
{
x = (x << 16) + dividend[i];
q = Math.floor(x / divisor);
x -= q * divisor;
if(quotient.length > 0 || q > 0)
quotient[quotient.length] = q;
}
remainders[j] = x;
dividend = quotient;
}

/* Convert the remainders to the output string */
var output = "";
for(i = remainders.length - 1; i >= 0; i--)
output += encoding.charAt(remainders[i]);

return output;
}

/*
* Encode a string as utf-8.
* For efficiency, this assumes the input is valid utf-16.
*/
function str2rstr_utf8(input)
{
var output = "";
var i = -1;
var x, y;

while(++i < input.length)
{
/* Decode utf-16 surrogate pairs */
x = input.charCodeAt(i);
y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
{
x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
i++;
}

/* Encode output as utf-8 */
if(x <= 0x7F)
output += String.fromCharCode(x);
else if(x <= 0x7FF)
output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
0x80 | ( x & 0x3F));
else if(x <= 0xFFFF)
output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
0x80 | ((x >>> 6 ) & 0x3F),
0x80 | ( x & 0x3F));
else if(x <= 0x1FFFFF)
output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
0x80 | ((x >>> 12) & 0x3F),
0x80 | ((x >>> 6 ) & 0x3F),
0x80 | ( x & 0x3F));
}
return output;
}

/*
* Encode a string as utf-16
*/
function str2rstr_utf16le(input)
{
var output = "";
for(var i = 0; i < input.length; i++)
output += String.fromCharCode( input.charCodeAt(i) & 0xFF,
(input.charCodeAt(i) >>> 8) & 0xFF);
return output;
}

function str2rstr_utf16be(input)
{
var output = "";
for(var i = 0; i < input.length; i++)
output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
input.charCodeAt(i) & 0xFF);
return output;
}

/*
* Convert a raw string to an array of little-endian words
* Characters >255 have their high-byte silently ignored.
*/
function rstr2binl(input)
{
var output = Array(input.length >> 2);
for(var i = 0; i < output.length; i++)
output[i] = 0;
for(var i = 0; i < input.length * 8; i += 8)
output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
return output;
}

/*
* Convert an array of little-endian words to a string
*/
function binl2rstr(input)
{
var output = "";
for(var i = 0; i < input.length * 32; i += 8)
output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
return output;
}

/*
* Calculate the MD5 of an array of little-endian words, and a bit length.
*/
function binl_md5(x, len)
{
/* append padding */
x[len >> 5] |= 0x80 << ((len) % 32);
x[(((len + 64) >>> 9) << 4) + 14] = len;

var a = 1732584193;
var b = -271733879;
var c = -1732584194;
var d = 271733878;

for(var i = 0; i < x.length; i += 16)
{
var olda = a;
var oldb = b;
var oldc = c;
var oldd = d;

a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
c = md5_ff(c, d, a, b, x[i+ 2], 17, 606105819);
b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
d = md5_ff(d, a, b, c, x[i+ 5], 12, 1200080426);
c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
a = md5_ff(a, b, c, d, x[i+ 8], 7 , 1770035416);
d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
a = md5_ff(a, b, c, d, x[i+12], 7 , 1804603682);
d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
b = md5_ff(b, c, d, a, x[i+15], 22, 1236535329);

a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
c = md5_gg(c, d, a, b, x[i+11], 14, 643717713);
b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
d = md5_gg(d, a, b, c, x[i+10], 9 , 38016083);
c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
a = md5_gg(a, b, c, d, x[i+ 9], 5 , 568446438);
d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
b = md5_gg(b, c, d, a, x[i+ 8], 20, 1163531501);
a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
c = md5_gg(c, d, a, b, x[i+ 7], 14, 1735328473);
b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
c = md5_hh(c, d, a, b, x[i+11], 16, 1839030562);
b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
d = md5_hh(d, a, b, c, x[i+ 4], 11, 1272893353);
c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
a = md5_hh(a, b, c, d, x[i+13], 4 , 681279174);
d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
b = md5_hh(b, c, d, a, x[i+ 6], 23, 76029189);
a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
c = md5_hh(c, d, a, b, x[i+15], 16, 530742520);
b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
d = md5_ii(d, a, b, c, x[i+ 7], 10, 1126891415);
c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
a = md5_ii(a, b, c, d, x[i+12], 6 , 1700485571);
d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
a = md5_ii(a, b, c, d, x[i+ 8], 6 , 1873313359);
d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
b = md5_ii(b, c, d, a, x[i+13], 21, 1309151649);
a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
c = md5_ii(c, d, a, b, x[i+ 2], 15, 718787259);
b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

a = safe_add(a, olda);
b = safe_add(b, oldb);
c = safe_add(c, oldc);
d = safe_add(d, oldd);
}
return Array(a, b, c, d);
}

/*
* These functions implement the four basic operations the algorithm uses.
*/
function md5_cmn(q, a, b, x, s, t)
{
return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
* Add integers, wrapping at 2^32. This uses 16-bit operations internally
* to work around bugs in some JS interpreters.
*/
function safe_add(x, y)
{
var lsw = (x & 0xFFFF) + (y & 0xFFFF);
var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
return (msw << 16) | (lsw & 0xFFFF);
}

/*
* Bitwise rotate a 32-bit number to the left.
*/
function bit_rol(num, cnt)
{
return (num << cnt) | (num >>> (32 - cnt));
}


]]></code>
</script>