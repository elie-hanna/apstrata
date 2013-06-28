function handleEvent(event) {
	
	var eventHandler = {
		
		"toggle-friends" : "toggleFriendsHandler",
		"toggle-place" : "togglePlaceHandler",
		"symbol-form-close": "closeForm",
		"btn-form-close": "closeForm",
		"share-button": "openForm"
	}
	
	var clickedBtnId = event.currentTarget.id;
	window[eventHandler[clickedBtnId]]();	
}

function openForm() {
	
	var apstrataToken = decodeURIComponent(getCookie("apstrataToken")).split(";");	
	if (!apstrataToken || apstrataToken[0] === "") {	
		
		var url = window.location.href.substring(0, window.location.href.indexOf("&"));
		window.location.href = url;
		return;
	}
	
	var composerModalNode = document.getElementById("composer-modal");
	composerModalNode.style.display = "block";
	var bodyNode = document.getElementsByTagName("body")[0];
	var curtainNode = document.createElement("div");
	curtainNode.setAttribute("id", "curtain");
	curtainNode.setAttribute("class", "modal-backdrop in");
	bodyNode.appendChild(curtainNode);
}  

function closeForm() {
	
	var composerModalNode = document.getElementById("composer-modal");
	var formNode = document.getElementById("composer");
	composer.reset();
	composerModalNode.style.display = "none";
	var bodyNode = document.getElementsByTagName("body")[0];
	var curtain = document.getElementById("curtain");
	bodyNode.removeChild(curtain);
}

function toggleFriendsHandler() {
	
	var placeGroupNode = document.getElementById("composer-place-group");
	var friendsGroupNode = document.getElementById("composer-friends-group");
	var toggleFriendsBtnNode = document.getElementById("toggle-friends");
	var togglePlaceBtnNode = document.getElementById("toggle-place");
	if (friendsGroupNode.style.display == "block") {
		friendsGroupNode.style.display = "none";
	}else {
		friendsGroupNode.style.display = "block";
	}
	
	if (toggleFriendsBtnNode.className == "btn active") {
		toggleFriendsBtnNode.className = "btn";
	}else {
		toggleFriendsBtnNode.className = "btn active";
	}
	
	placeGroupNode.style.display = "none";
	togglePlaceBtnNode.className = "btn";
}

function togglePlaceHandler() {
	
	var friendsGroupNode = document.getElementById("composer-friends-group");
	var placeGroupNode = document.getElementById("composer-place-group");
	var togglePlaceBtnNode = document.getElementById("toggle-place");
	var toggleFriendsBtnNode = document.getElementById("toggle-friends");
	if (placeGroupNode.style.display == "none") {
		
		placeGroupNode.style.display = "block";
		geolocate();
	}else {
		placeGroupNode.style.display = "none";
	}
	
	if (togglePlaceBtnNode.className == "btn active") {
		togglePlaceBtnNode.className = "btn";
	}else {
		togglePlaceBtnNode.className = "btn active";
	}
	
	friendsGroupNode.style.display = "none";
	toggleFriendsBtnNode.className = "btn";
}

function geolocate() {
		
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getPosition, handleGeolocateError);
	}
}

function getPosition(position) {
 
	var lattitude = position.coords.latitude;
	var longitude = position.coords.longitude;
	var placeFieldNode = document.getElementById("composer-place-field");
	placeFieldNode.innerHTML = lattitude + ";" + longitude;
}

function handleGeolocateError(error) {
  
  	switch(error.code) {
  	
	    case error.PERMISSION_DENIED:
	      
	      break;
	    case error.POSITION_UNAVAILABLE:
	      
	      break;
	    case error.TIMEOUT:
	     
	      break;
	    case error.UNKNOWN_ERROR:
	     
	      break;
	}
}

function publishAction(docKey) {
	
	var messageNode = document.getElementById("composer-message");
	var apstrataToken = decodeURIComponent(getCookie("apstrataToken")).split(";");	
	var xhReq = new XMLHttpRequest(docKey);	
	var url = "https://sandbox.apstrata.com/apsdb/rest/B030C6D305/RunScript?apsws.time=1371484281539&apsws.responseType=jsoncdp&apsdb.scriptName=ftp.api.facebookAction&apsdb.authToken=" + apstrataToken[0] + "&apsws.user=" + apstrataToken[1] + "&docKey=" + docKey + "&actionType=Eat&objectType=meal";
	url = (messageNode.value) ? url + "&message=" + messageNode.value : url;	
	xhReq.open("GET", url, false);
	try {
		xhReq.send(null);
	}catch(crossSiteException) {
		
	}
	
	var serverResponse = xhReq.responseText;
	if (serverResponse) {
		var result =  JSON.parse(serverResponse);
		if (result.metadata.status == "failure") {
			alert(result.metadata.errorDetail);
		}
	}
	
	closeForm();
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