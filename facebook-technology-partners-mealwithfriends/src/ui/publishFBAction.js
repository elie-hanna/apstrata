function publishAction(docKey) {
	
	var apstrataToken = decodeURIComponent(getCookie("apstrataToken")).split(";");
	var xhReq = new XMLHttpRequest(docKey);	
	var url = "https://sandbox.apstrata.com/apsdb/rest/B030C6D305/RunScript?apsws.time=1371484281539&apsws.responseType=jsoncdp&apsdb.scriptName=ftp.api.facebookAction&apsdb.authToken=" + apstrataToken[0] + "&apsws.user=" + apstrataToken[1] + "&docKey=" + docKey + "&actionType=Eat&objectType=meal";
	xhReq.open("GET", url, false);
	xhReq.send(null);
	var serverResponse = xhReq.responseText;
	if (serverResponse.indexOf("success") == -1) {
		alert(serverResponse);
	}
}

function getCookie(cookieName) {
	
	var cookies = document.cookie;
	var cookieName = cookieName + "=";
	var cookieStart = cookies.indexOf(cookieName);
	cookieStart = cookieStart + cookieName.length; 
	if (cookieStart > -1) {
	 
		cookieEnd = cookies.indexOf(";", cookieStart);
		var cookieValue = cookieEnd >  -1 ? cookies.substring(cookieStart, cookieEnd) : cookies.substring(cookieStart);
		return cookieValue;
	}
	
	return "";
}