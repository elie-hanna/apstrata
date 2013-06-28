<script>
<scriptACL>
	<execute>authenticated-users</execute>
	<read>nobody</read>
	<write>nobody</write>
</scriptACL>
<code><![CDATA[

/*
 * This script returns the Facebook friends list of the current Apstrata user
 * @param nextId (optional): the id of the friend to start from when paginating
 * @param limit (optional): the limit defined by Facebook
 * @param offset (optional): the offset defined by Facebook
 * Notes: 
 * nextId, limit and offset have to be passed alltogether
 * Their values are return by this script whenever there are more result to obtain
 * @return
 * If all friends obtained
 * response {
 * 	"metadata" : ...,
 *	"result" : {
 *		"friends" : [ { "name" : "a_name", "id" : "a_fb_id"}, ... ]
 *	}
 * }
 * If pagination
 * response {
 * 	"metadata" : ...,
 *	"result" : {
 *		"friends" : [ { "name" : "a_name", "id" : "a_fb_id"}, ... ],
 *		"nextId" : "the_next_fb_id_to_start_from",
 *		"limit" : "the_fb_limit",
 * 		"offset": "the_fb_offset"
 *	}
 * }
 * On error: {"result": { "metadata": { "status": "failure", "erroCode": "some_code", "errorDetail": "some_text"}}
 */
try {
	
	var userManager = apsdb.require("social.fb.userManager");
	var login = userManager.getUserLoginFromRequest(apsdb, request);
	var response = userManager.getUser(apsdb, login);
	var facebookManager = apsdb.require("social.fb.facebookManager");
	var allFriends = [];
	var paging = null;
	if (request.parameters["nextId"]){
		
		paging = {
		
			"__after_id": request.parameters["nextId"],
			"limit": request.parameters["limit"],
			"offset": request.parameters["offset"]
		}
	}
	
	var nextId, limit, offset;		
	var getFriendsResponse = facebookManager.getFriends(apsdb, response.user.facebookid, response.user.accessToken, paging);
	var more = false;
	if (getFriendsResponse.result) {
	
		allFriends = allFriends.concat(getFriendsResponse.result.data);
		
		if (getFriendsResponse.result.paging.next) {
		
			// get next id
			nextId = _getParameterByName("__after_id", getFriendsResponse.result.paging.next);
						
			// get limit 
			limit = _getParameterByName("limit", getFriendsResponse.result.paging.next);
				
			// get offset
			offset = _getParameterByName("offset", getFriendsResponse.result.paging.next);
			
			var nextPaging = {
		
				"__after_id": nextId,
				"limit": limit,
				"offset": offset
			}
			
			var nextResponse = facebookManager.getFriends(apsdb, response.user.facebookid, response.user.accessToken, nextPaging);
			more = nextResponse.result.paging.next ? true : false
		}		
	}
	
	var response = { "friends" : allFriends };
	if (more) {
	
		response["nextId"] = nextId;
		response["limit"] = limit;
		response["offset"] = offset;
	}
	
	return response;
}catch(exception) {
	
	return {
	
		"status": "failure",
		"errorCode": exception.errorCode ? exception.errorCode: exception,
		"errorDetail": exception.errorDetail ? exception.errorDetail : ""
	}
}
	 
function _getParameterByName(name, url) {

    var match = RegExp('[?&]' + name + '=([^&]*)').exec(url);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

]]>
</code>
</script>