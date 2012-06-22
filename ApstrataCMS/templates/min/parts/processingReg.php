
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
				var span1Message = "A verification e-mail message has been sent to the e-mail address you provided in the registration form.";
				var span2Message = "Please click on the link included in the e-mail to complete your registration";
				
				urlParams = dojo.queryToObject(location.search.substr(1));
				var status = urlParams["status"];
				if (status && status == "complete") {
					h1Message = "Welcome ! Your registration has successfully completed";
					span1Message = "Click on the <a href=\'<?php print $GLOBALS["config"]["baseUrl"] . "/". $GLOBALS["config"]["urlPrefix"] . $GLOBALS["config"]["loginUrl"]; ?>'>login link</a> and enter you email and password to log in";
					span2Message = "";
				}
				
				if (status && status == "error") {
					var error = urlParams["error"];
					h1Message = "An error occurred when processing your registration request.";
					span1Message = "Please contact us at apstrata-support@apstrata.com";
					span2Message = decodeURIComponent(error);
				}
				
				var h1Node = dojo.byId("h1");
				h1Node.innerHTML = h1Message;
				var span1Node = dojo.byId("span1");
				span1Node.innerHTML = span1Message;
				var span2Node = dojo.byId("span2");
				span2Node.innerHTML = span2Message;
			});
</script>