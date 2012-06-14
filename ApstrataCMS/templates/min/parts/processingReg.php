
<div class='page'>
	<br>
	<h1 id="h1"></h1>
	<br>
	<span id="span1"></span>
	<br>
	<span id="span2"></span>	
</div>
<script type="text/javascript">			
			dojo.ready(function() {
				
				var h1Message = "We are processing your registration request";
				var span1Message = "A verification e-mail has been sent to the e-mail address you provided in the registration form.";
				var span2Message = "Please click on the link contained in the e-mail to complete your registration";
				
				urlParams = dojo.queryToObject(location.search.substr(1));
				var status = urlParams["status"];
				if (status && status == "complete") {
					h1Message = "Welcome ! You are now registered to Apstrata";
					span1Message = "Click on the Login link and enter you email and password to log in";
					span2Message = "";
				}
				
				var h1Node = dojo.byId("h1");
				h1Node.innerHTML = h1Message;
				var span1Node = dojo.byId("span1");
				span1Node.innerHTML = span1Message;
				var span2Node = dojo.byId("span2");
				span2Node.innerHTML = span2Message;
			});
</script>