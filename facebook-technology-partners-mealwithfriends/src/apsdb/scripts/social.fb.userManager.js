<script>
<scriptACL>
  <execute>anonymous</execute>
  <read>nobody</read>
  <write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * @param login: the login of a user of an Apstrata appp
 * @return null if the login does not match an existing user, 
 * if user is found
 * @return result.user resulting from GetUser @see http://wiki.apstrata.com/display/doc/GetUser 
 */
function getUser(apsdb, login) {

	var user = apsdb.callApi("GetUser", {"login": login}, null);
	if (user.metadata.status == "failure") {
	
		if (user.metadata.errorCode == "INVALID_USER") {
			return null;
		}
		
		throw user.metadata;
	}
	
	return user.result;
}

/*
 * Search for a user using its facebook access token
 * @param accessToken:  the facebook access token previously provided to the user
 * @return null if not found, 
 * if found:
 * {
 * 	"login": "the_login",
 *	"email": "the_email",
 * 	"name": "the_name",
 *	"accessToken": "the_token",
 *	"facebookid": "the_id",
 *	"hashedPassword": "the_hashed_pwd"
 * }
 */
function findUserFromToken(apsdb, accessToken) {

	var params = {
	
		"apsdb.query": "accessToken = \"" + accessToken + "\"",
		"apsdb.attributes": "*"
	}
	
	var findUserResult = apsdb.callApi("ListUsers", params, null);
	if (findUserResult.metadata.status == "failure") {	
		throw user.metadata;
	}
	
	if (findUserResult.result.users.length == 0) {
		return null;
	}
	
	var user = {
	
		"login": findUserResult.result.users[0].login[0],
		"name": findUserResult.result.users[0].name[0],
		"email": findUserResult.result.users[0].email[0],
		"hashedPassword": findUserResult.result.users[0].hashedPassword[0],
		"accessToken": findUserResult.result.users[0].accessToken[0],
		"facebookid": findUserResult.result.users[0].facebookid[0]
	}
	
	return user;
}

/*
 * Since the APIs exposed by the application can be called by users who are not using the Apstrata
 * signature, this function allows the APIs to verify if the caller is authenticated. 
 * @param request: the request sent to the API
 * @return true if the user has signed the request or passed a valid facebook access token, false otherwise
 */
function isUserAuthenticated(apsdb, request) {

	// get the login of the user who initiated the request
	var currentUserLogin = getUserLoginFromRequest(apsdb, request);
	
	// if the request was signed, just check if it contains a user and return true
	// (actually, the authentication has already been made by Apstrata)
	if (currentUserLogin != "anonymous") {
		return true;
	}else {
	
		// if the request was not signed, check for a facebook access token in the request parameters
		var accessToken = request.parameters["accessToken"];
		
		// if no access token found return false
		if (!accessToken) {
			return false;
		}
		
		// if an access token was found, we need to verify if it is still up to date
		// if not return false
		var facebookManager = apsdb.require("social.fb.facebookManager");
		return facebookManager.checkAccessToken(apsdb, accessToken);
	}
}

/*
 * Create a new Apstrata app user
 * @param userDTO: the user's information. 
 * userDTO.login mandatory
 * userDTO.email mandatory
 * userDTO.password mandatory
 * userDTO.name mandatory
 * @return {"login": the_login, "hashedPassword": "the_hashedPassword"}
 * @errorCode: "Invalid_Parameter" if one of the mandatory fields is missing
 */
function createUser(apsdb, userDTO) {

	if (!userDTO.login || !userDTO.email || !userDTO.name) {
		throw {
			"errorCode": "Invalid_Parameter",
			"errorDetail": "login, email and name are mandatory"
		}
	}
	
	if (!userDTO.password) {
	
		var password = _generatePassword();
		userDTO.password = password;		
	}
	
	userDTO.hashedPassword = hex_md5(userDTO.password).toUpperCase();
	return _saveUser(apsdb, userDTO, false);
}

/*
 * Update a existing Apstrata app user
 * @param userDTO: the user's information. 
 * userDTO.login mandatory
 * @return {"login": the_login, "hashedPassword": "the_hashedPassword"}
 * @errorCode: "Invalid_Parameter" if one of the mandatory fields is missing
 * @errorCode: "INVALID_USER" if user does not exist
 */
function updateUser(apsdb, userDTO) {

	if (!userDTO.login) {
	
		throw {
			"errorCode": "Invalid_Parameter",
			"errorDetail": "login is mandatory"
		}
	}
	
	if (userDTO.password) {
		userDTO.hashedPassword = hex_md5(userDTO.password).toUpperCase();	
	}
	
	return _saveUser(apsdb, userDTO, true);
}

/*
 * Returns the login of the user who triggered the request without the account auth key
 * Return # if request is ran as account owner
 */
function getUserLoginFromRequest(apsdb, req) {
	
	var fullLogin = req.user.login;
	if (fullLogin == "anonymous") {
		return fullLogin;
	}
	
	var atIndex = fullLogin.lastIndexOf("@");
	
	// if the user is the owner, just return the fullLogin as is + a pound so other
	// script understand that this is the account owner
	if (atIndex < 0) {
		return fullLogin + "#";
	}
	
	// otherwise, return the value before the last "@"
	return fullLogin.substring(0, atIndex);
}

/*
 * Returns the account key of the user who triggered the request without the login 
 */
function getUserAccountFromRequest(apsdb, req) {
	
	var fullLogin = req.user.login;
	if (fullLogin == "anonymous") {
	
		var common = apsdb.require("social.fb.common");
		return common.defaultAccountKey;
	}
	
	var atIndex = fullLogin.lastIndexOf("@");
	
	// if the user is the owner, just return the fullLogin as is + a pound so other
	// script understand that this is the account owner
	if (atIndex < 0) {
		return fullLogin;
	}
	
	// otherwise, return the value after the last "@"
	return fullLogin.substring(atIndex + 1);
}

function generateToken(apsdb, login, hashedPassword, action, token) {

	var common = apsdb.require("social.fb.common");
	var accountUrl = common.apstrataUrl;
	var accountKey = common.defaultAccountKey;
			
	// Sign the request
	var submitUrl = accountUrl + accountKey + "/VerifyCredentials";			
	var ts = new Date().getTime();		
	var valueToHash = ts + login + "VerifyCredentials" + hashedPassword;
	var hash = hex_md5(valueToHash);		
				
	var params = {
		"apsdb.action": action ? action : "generate"
	}
	
	if (action == "renew") {
		params["apsdb.authToken"] = token
	}
					
	var url = submitUrl + "?apsws.time=" + ts + "&apsws.authSig=" + hash + "&apsws.user=" + login + "&apsws.authMode=simple&apsws.responseType=json";
	var res = apsdb.callHttp(url , "GET", params, null, null, null, false, null, false, false);
	var resJson = common.parseJSONResult(apsdb, res);
	return resJson["result"];
}

/*
 * Call this function when you need to check if a given user has granted some permissions
 * to an app on Facebook (https://developers.facebook.com/docs/reference/login/#permissions)
 * @param apsdb: the Apstrata apsdb object
 * @param facebookId: the user id on Facebook
 * @param accessToken: the Facebook access token of the user for this app
 * @param permissionArray: an array of Facebook permissions to check (e.g. ["email", "publish_actions"])
 * @return A key/value object where: key = permission and value = 1 or 0, e.g: {"email":1, "publish_actions":0}
 * @throw {"errorCode": "Check_Permission_Error", "errorDetail": response.result.error.message}
 */
function checkPermissions(apsdb, facebookId, accessToken, permissionArray) {

	var common = apsdb.require("social.fb.common");
	var permissionsStr = "";
	for (var i = 0; i < permissionArray.length; i++) {
		
		permissionsStr = permissionsStr + permissionArray[i];
		if (i < permissionArray.length - 1) {
			permissionsStr = permissionsStr + ",";
		}
	}
	
	var fqlQuery = "select " + permissionsStr + " from permissions where uid = " + facebookId;
	var url = "https://graph.facebook.com/fql";
	var params = {
		"q": fqlQuery
	}
	
	var response = apsdb.social.facebook.callApi(common.appKey, common.secret, accessToken, "GET", url, params);
	if (response.metadata.status == "success") {	
		
		if (response.result.error) {
			
			throw {
				"errorCode": "Check_Permission_Error",
				"errorDetail": response.result.error.message
			}
		}
		
		return response.result.data[0];
	}else {
		return response.metadata;
	}
}

/*
 * Call this function when you need to know if a given permission has been granted by a 
 * a user to an app on Facebook (https://developers.facebook.com/docs/reference/login/#permissions)
 * @param apsdb: the Apstrata apsdb object
 * @param facebookId: the user id on Facebook
 * @param accessToken: the Facebook access token of the user for this app
 * @param permissionArray: an array of Facebook permissions to check (e.g. ["email", "publish_actions"])
 * @return true or false
 * @throw {"errorCode": "CHECK_PERMISSION_ERROR", "errorDetail": response.result.error.message}
 */
function hasPermission(apsdb, facebookId, accessToken, permission) {
	
	var permissionArray = [];
	permissionArray[0] = permission;
	var result = checkPermissions(apsdb, facebookId, accessToken, permissionArray);
	return result[permission] == 1 ? true : false; 
}

/*
 * Save (create/update) a user in the Apstrata application account
 * @param userDTO: the data on the user (userDTO.login mandatory)
 * @param update: if true, updates and existing user, if false, creates a new user
 * @return  {"login": the_login, "hashedPassword": "the_hashedPassword"}
 * @error any error returned by the SaveUser API
 */
function _saveUser(apsdb, userDTO, update) {

	var params = {};
	for (var property in userDTO) {
	
		if (userDTO[property] != null) {
			params[property] = "" + userDTO[property];
		}
	}
	
	
	params["apsdb.update"] = update ? "true" : "false";
	var createUserResult = apsdb.callApi("SaveUser", params,  null);
	if (createUserResult.metadata.status == "failure") {	
		throw createUserResult.metadata;
	}
	
	// we need to retrieve the hashed password
	var userResponse = getUser(apsdb, userDTO.login);	
	return {
		"login": userDTO.login,
		"hashedPassword": userResponse.user.hashedPassword
	}
}

function _generatePassword() {

	var length = 8,
        charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
	for (var i = 0, n = charset.length; i < length; ++i) {
		retVal += charset.charAt(Math.floor(Math.random() * n));
	}
	
	return retVal;
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

	
]]>
</code>
</script>