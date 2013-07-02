var friends = [];
var places = [];
var selectedFriends = [];
var currentPlace;
var currentLocation = {};

window.onkeypress = function(event) {
	
	if (event.keyCode == 27) {
		
		var whoAreYouWithNode = document.getElementById("ui-id-1");
		if (whoAreYouWithNode) {
			whoAreYouWithNode.style.display = "none";
		}
		
		var whereAreYouNode = document.getElementById("ui-id-p1");
		if (whereAreYouNode) {
			whereAreYouNode.style.display = "none";
		}
		
		event.stopPropagation();
	}
}

function handleEvent(event) {
	
	var eventHandler = {
		
		"toggle-friends" : "toggleFriendsHandler",
		"toggle-place" : "togglePlaceHandler",
		"symbol-form-close": "closeForm",
		"btn-form-close": "closeForm",
		"share-button": "openForm",
		"composer-friends-field": "getFriends",
		"composer-place-field": "getPlaces"
	}
	
	var clickedBtnId = event.currentTarget.id;
	window[eventHandler[clickedBtnId]](event);	
}

function openForm() {
	
	if (!validateToken()) {
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

function validateToken() {
	
	var apstrataToken = decodeURIComponent(getCookie("apstrataToken")).split(";");	
	if (!apstrataToken || apstrataToken[0] === "") {	
		
		var url = window.location.href.substring(0, window.location.href.indexOf("&"));
		window.location.href = url;
		return false;
	}
	return true;
}

function toggleFriendsHandler() {
	
	var placeGroupNode = document.getElementById("composer-place-group");
	var friendsGroupNode = document.getElementById("composer-friends-group");
	var toggleFriendsBtnNode = document.getElementById("toggle-friends");
	var togglePlaceBtnNode = document.getElementById("toggle-place");
	if (friendsGroupNode.style.display == "") {
		friendsGroupNode.style.display = "none";
	}else {
		friendsGroupNode.style.display = "";
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
 
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;
	currentLocation = {
		"latitude" : latitude,
		"longitude" : longitude
	}
}

function handleGeolocateError(error) {
  
  	switch(error.code) {
  	
	    case error.PERMISSION_DENIED:
	          
	    case error.POSITION_UNAVAILABLE:
	      
	    case error.TIMEOUT:
	     
	    case error.UNKNOWN_ERROR:
	     
	    alert(JSON.stringify(error));
	}
}

function publishAction(docKey) {
	
	var messageNode = document.getElementById("composer-message");
	var apstrataToken = decodeURIComponent(getCookie("apstrataToken")).split(";");	
	var xhReq = new XMLHttpRequest(docKey);	
	var url = "https://sandbox.apstrata.com/apsdb/rest/B030C6D305/RunScript?apsws.time=1371484281539&apsws.responseType=jsoncdp&apsdb.scriptName=ftp.api.facebookAction&apsdb.authToken=" + apstrataToken[0] + "&apsws.user=" + apstrataToken[1] + "&docKey=" + docKey + "&actionType=Eat&objectType=meal";
	url = (messageNode.value) ? url + "&message=" + messageNode.value : url;
	url = (currentPlace) ? url + "&place=" + currentPlace.id : url;
	if (selectedFriends.length > 0) {
		
		var friendsInfoToSend = [];
		for (var i = 0; i < selectedFriends.length; i++) {
			
			friendsInfoToSend.push(selectedFriends[i].uid);
		}
		
		url = url + "&tags=" + JSON.stringify(friendsInfoToSend);
	}
	
	xhReq.open("GET", url, false);
	try {
		xhReq.send(null);
	}catch(crossSiteException) {
		console.log(crossSiteException);
	}
	
	var serverResponse = xhReq.responseText;
	if (serverResponse) {
		var result =  JSON.parse(serverResponse);
		if (result && result.metadata.status == "failure") {
			alert(result.metadata.errorDetail);
		}
		
		if (result && result.result.error) {
			alert(result.result.error.message);
		}
		
		if (!result) {
			alert("Time-out: could not connect to server");
		}
	}
	
	closeForm();
}

function getFriends(event) {
	
	if (!validateToken()) {
		return;
	}
	
	var name = event.target.value;
	if (name == "") {
		
		friends = [];
		displayFriends(friends);
	}
	
	var apstrataToken = decodeURIComponent(getCookie("apstrataToken")).split(";");	
	var xhReq = new XMLHttpRequest();	
	var url = "https://sandbox.apstrata.com/apsdb/rest/B030C6D305/RunScript?apsws.time=1371484281539&apsws.responseType=jsoncdp&apsdb.scriptName=social.api.fb.searchUserFriends&apsdb.authToken=" + apstrataToken[0] + "&apsws.user=" + apstrataToken[1] + "&cors=true&name=" + name;		
	
	xhReq.onreadystatechange=function() {
	  	
	  	if (xhReq.readyState==4 && xhReq.status==200) {
	   
	   		var serverResponse = xhReq.responseText;
			if (serverResponse) {
				
				var result = JSON.parse(serverResponse);
				if (!result.friends) {
					alert("result: " + JSON.stringify(result));
					return;
				}
				
				friends = result.friends;
				displayFriends(friends)
			}
	  	}
  	}
	
	xhReq.open("GET", url, true);
	try {
		xhReq.send(null);
	}catch(crossSiteException) {
		console.log(crossSiteException);
	}
}

function getPlaces(event) {
	
	if (!validateToken()) {
		return;
	}
	
	var name = event.target.value;
	if (name == "") {
		
		places = [];
		displayPlaces(places);
		return;
	}
	
	var apstrataToken = decodeURIComponent(getCookie("apstrataToken")).split(";");	
	var xhReq = new XMLHttpRequest();
	var url = "https://sandbox.apstrata.com/apsdb/rest/B030C6D305/RunScript?apsws.time=1371484281539&apsws.responseType=jsoncdp&apsdb.scriptName=social.api.fb.searchPlaces&apsdb.authToken=" + apstrataToken[0] + "&apsws.user=" + apstrataToken[1] + "&cors=true&q=" + name;		
	if (currentLocation && currentLocation.latitude && currentLocation.longitude) {		
		url = url + "&center=" + currentLocation.latitude + "," + currentLocation.longitude;
	}
	
	xhReq.onreadystatechange=function() {
	  	
	  	if (xhReq.readyState==4 && xhReq.status==200) {
	   
	   		var serverResponse = xhReq.responseText;
			if (serverResponse) {
				
				var result = JSON.parse(serverResponse);
				if (!result.data) {
					alert("result: " + JSON.stringify(result));
					return;
				}
				
				places = result.data;
				displayPlaces(places)
			}
	  	}
  	}
	
	xhReq.open("GET", url, true);
	try {
		xhReq.send(null);
	}catch(crossSiteException) {
		console.log(crossSiteException);
	}
}

function displayFriends(friends) {

	var whoAreYouWithNode = document.getElementById("ui-id-1");
	if (friends.length == 0) {
		whoAreYouWithNode.style.display = "none"; 
		return;
	}
	
	whoAreYouWithNode.style.display = "block"; 
	whoAreYouWithNode.style.width = "218px";
	whoAreYouWithNode.style.top = "120px";
	whoAreYouWithNode.style.left = "20.5px";
	
	// remove existing nodes
	if (whoAreYouWithNode.hasChildNodes()) {
	    while (whoAreYouWithNode.childNodes.length >= 1 ){
	        whoAreYouWithNode.removeChild(whoAreYouWithNode.firstChild);       
	    } 
	}
	
	// build new friend list from returned friends	
	for(var i = 0; i < friends.length; i++) {
		
		var friend = friends[i];
		
		var li = document.createElement("li");
		li.className = "friend ui-menu-item";
		li.setAttribute("role", "presentation");
		li.setAttribute("id", "friend-" + i);
		li.setAttribute("aria-label", friend.name);	
		li.setAttribute("onmouseover", "focusFriend(this)");
		li.setAttribute("onmouseout", "blurFriend(this)");
		li.setAttribute("onclick", "addFriend(event)");
		whoAreYouWithNode.appendChild(li);
		
		var img = document.createElement("img");
		img.setAttribute("src", friend.pic_small);
		img.setAttribute("alt", friend.name);
		img.setAttribute("width", "25");
		img.setAttribute("height", "25");		
		li.appendChild(img);
		
		var a = document.createElement("a");
		a.className = "text ui-corner-all";
		a.setAttribute("id", "ui-id-" + (i+2));
		a.setAttribute("tabindex", "-1");		
		a.innerHTML = friend.name;
		li.appendChild(a);
	}
}

function displayPlaces(places) {
	
	var whereAreYouNode = document.getElementById("ui-id-p1");
	if (places.length == 0) {
		whereAreYouNode.style.display = "none"; 
		return;
	}
	
	whereAreYouNode.style.display = "block"; 
	whereAreYouNode.style.width = "363px";
	whereAreYouNode.style.top = "121px";
	whereAreYouNode.style.left = "15px";
	
	// remove existing nodes
	if (whereAreYouNode.hasChildNodes()) {
	    while (whereAreYouNode.childNodes.length >= 1 ){
	        whereAreYouNode.removeChild(whereAreYouNode.firstChild);       
	    } 
	}
	
	// build new friend list from returned friends	
	for(var i = 0; i < places.length; i++) {
		
		var place = places[i];
		
		var li = document.createElement("li");
		li.className = "place ui-menu-item";
		li.setAttribute("role", "presentation");
		li.setAttribute("id", "place-" + i);
		li.setAttribute("aria-label", place.name);	
		li.setAttribute("onmouseover", "focusFriend(this)");
		li.setAttribute("onmouseout", "blurFriend(this)");
		li.setAttribute("onclick", "addPlace(event)");
		whereAreYouNode.appendChild(li);
		
		var img = document.createElement("img");
		img.setAttribute("src", place.picture.data.url);
		img.setAttribute("alt", place.name);
		img.setAttribute("width", "25");
		img.setAttribute("height", "25");		
		li.appendChild(img);
		
		var a = document.createElement("a");
		a.className = "text ui-corner-all";
		a.setAttribute("id", "ui-id-p" + (i+2));
		a.setAttribute("tabindex", "-1");		
		a.innerHTML = place.name;
		li.appendChild(a);
	}
}	

function focusFriend(node) {
		
	node.className = "ui-state-focus"
}

function blurFriend(node) {
	
	node.className = node.className.replace(/\ui-state-focus\b/,'');
}

function addFriend(item) {
	
	var index = item.currentTarget.id.substring(item.currentTarget.id.indexOf("-") + 1);
	var selectedFriend = friends[index];
	var found = false; 
	for (var i = 0; i < selectedFriends.length && !found; i++) {
		found = (selectedFriends[i].uid == selectedFriend.uid) ? true : false;
	}
	
	if (found){
		return;
	}	
	
	selectedFriends.push(selectedFriend);
	var ul = document.getElementById("composer-friends-group-fields");
	var li = document.createElement("li");
	li.setAttribute("id", "selectedFriend-" + selectedFriend.uid);
	li.className = "friend";
	ul.appendChild(li);
	var a = document.createElement("a");
	a.setAttribute("href", selectedFriend.profile_url);
	a.setAttribute("target", "_blank");
	a.innerHTML = selectedFriend.name;
	li.appendChild(a);
	var button = document.createElement("button");
	button.className = "btn btn-link";
	button.setAttribute("type", "button");
	button.setAttribute("id", "btn-remove-friend-" + selectedFriend.uid);
	button.setAttribute("title", "Remove " + selectedFriend.name);
	button.setAttribute("onclick", "removeFriend(event)");
	var x = document.createTextNode("x");
	button.appendChild(x);
	li.appendChild(button);
	
	var composerMsgDataNode = document.getElementById("composer-message-data-friends");
	composerMsgDataNode.style.display = "block";
	if (selectedFriends.length == 1) {
	
		var withTxt = document.createTextNode("With ");
		composerMsgDataNode.appendChild(withTxt);
	}
	
	var span = document.createElement("span");
	span.className = "friends";
	span.setAttribute("id", "span-selected-friend-" + selectedFriend.uid);
		
	var a = document.createElement("a");
	a.setAttribute("href", selectedFriend.profile_url);
	a.setAttribute("target", "_blank");
	span.appendChild(a);
	var nameTxt =  document.createTextNode(selectedFriend.name);
	a.appendChild(nameTxt);		
	var sepTxt = document.createTextNode(" ");
	span.appendChild(sepTxt);
	composerMsgDataNode.appendChild(span);
	
	var whoAreYouWithNode = document.getElementById("ui-id-1");
	whoAreYouWithNode.style.display = "none";	
}

function addPlace(item) {
	
	var index = item.currentTarget.id.substring(item.currentTarget.id.indexOf("-") + 1);
	var selectedPlace = places[index];
	var found = false; 
	if (currentPlace && currentPlace.name == selectedPlace.name) {
		return;
	}
	
	currentPlace = selectedPlace;
	var composerMsgDataNode = document.getElementById("composer-message-data-place");
	var span = document.getElementById("currentPlace");
	if (span) {
		removePlace(composerMsgDataNode);
	}
	
	span = document.createElement("span");
	span.className = "place";
	span.id = "currentPlace";
	composerMsgDataNode.appendChild(span);
	var at = document.createTextNode("at ");
	span.appendChild(at);
	 
	var a = document.createElement("a");
	a.setAttribute("href", selectedPlace.link);
	a.setAttribute("target", "_blank");
	span.appendChild(a); 
	var aTxt = document.createTextNode(selectedPlace.name);
	a.appendChild(aTxt);
	
	composerMsgDataNode.style.display = "block";
	var whereAreYouNode = document.getElementById("ui-id-p1");
	whereAreYouNode.style.display = "none";	
}

function removeFriend(event) {
	
	var id = event.currentTarget.id.substring(event.currentTarget.id.lastIndexOf("-") + 1);
	var ul = document.getElementById("composer-friends-group-fields");
	var li = document.getElementById("selectedFriend-" + id);
	ul.removeChild(li);
	
	var composerMsgDataNode = document.getElementById("composer-message-data-friends");
	var span = document.getElementById("span-selected-friend-" + id);
	composerMsgDataNode.removeChild(span);
	
	var found = false;
	for (i=0; i < selectedFriends.length && !found; i++) {
		if (selectedFriends[i].uid == id) {
			
			selectedFriends.splice(i,1);
			found = true;
		}
	}
	
	if (selectedFriends.length == 0) {
		composerMsgDataNode.style.display = "none";
		composerMsgDataNode.removeChild(composerMsgDataNode.firstChild);
	}
}

function removePlace(root) {
	
	root.removeChild(root.firstChild);
}

function removeAllFriends() {
	
	var ul = document.getElementById("composer-friends-group-fields");
	if (ul.hasChildNodes()) {
		
	    for (var i = 0; i < ul.childNodes.length; i++){
	    	
	    	if (ul.childNodes[i].id && ul.childNodes[i].id.indexOf("selectedFriend-") > -1) {    		
	    		
	        	ul.removeChild(ul.childNodes[i]);       
	    	}
	    } 
	}
	
	selectedFriends.splice(0, selectedFriends.length);
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