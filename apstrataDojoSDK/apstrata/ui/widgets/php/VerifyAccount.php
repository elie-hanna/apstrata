<?php 

$url = "https://sandbox.apstrata.com/apsdb/rest/" . $_GET['a'] .  "/RunScript?apsws.authMode=simple&apsdb.scriptName=widgets.Registration.verifyAccount&login=" . $_GET['l'] . "&d=" . $_GET['d'];
$xml = simplexml_load_file ($url);
$success = $xml->verify->success; 
?>
<h2>You can customize this page at apstrata/ui/widgets/server/VerifyAccount.php</h2>

<?php
	if ($success == "true") {
?>
		<h1>Account verified, you can login.</h1>
<?php
	} else {
		$error = $xml->verify->errorDetail;
		echo $error;
		if ($error == "ACCOUNT_ALREADY_VERIFIED") {
?>
		<h1>Account already verified.</h1>
<?php
		
		} else {
?>
		<h1>Account doesn't exist.</h1>
<?php
		
		}
	} 
?>