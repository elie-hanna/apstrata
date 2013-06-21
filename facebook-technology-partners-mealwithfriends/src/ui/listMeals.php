<?php
	
	require_once 'lib/APSDB/APSDBClient.php';
	require_once 'lib/APSDB/APSDBConfig.php';
	require_once 'util.php';
	require_once 'User.php';

	session_start();
	$user = null;
	if (isset($_SESSION["user"])) {
		$user = $_SESSION["user"];	
	}
	
	$client = null;	
?>
<html>
<head>
	<link rel="stylesheet" type="text/css" href="./css/style.css">
	<link rel="stylesheet" type="text/css" href="./css/bootstrap.min.css">
	<script type="text/javascript">
	
		// this function invokes the Apstrata script that handles the login process
		function facebookLogin() {
			
			var url = "<?php print APSDBConfig::$SERVICE_URL . '/' . APSDBConfig::$ACCOUNT_KEY?>/RunScript?";
			url = url + "apsws.time=" + new Date().getTime() + "&apsws.responseType=jsoncdp";
			url = url + "&apsdb.scriptName=ftp.api.facebookLogin&redirectAfterLogin=true&";
			url = url + "loggedInRedirectUrl=" + encodeURIComponent("<?php print Util::$WEB_URL?>/listMeals.php");
			url = url + "&returnApstrataToken=true";
			window.location.assign(url);	
		}
	</script>
</head>
<body>
<div class="navbar navbar-inverse navbar-fixed-top">
  <div class="navbar-inner">
    <div class="container-fluid">
      <a class="brand" href="http://as.elementn/listMeals.php">Meals with Friends</a>
      <p id="user-identity" class="navbar-text pull-right">
      	<?php if ($user == null && $_REQUEST["userName"] == null) {?>
      		<button id="login-button" class="btn btn-primary" type="button" onclick="facebookLogin()">Login</button>'
      	<?php } else {
      		      		
      		if (isset($_REQUEST["userName"]) && $user == null) {
      			
      			$user = new User($_REQUEST["userName"], null, null, $_REQUEST["apstrataToken"]);
      			$_SESSION["user"] = $user;
      		}
      	?>
		<img width="25" height="25" alt="<?php print $user->getName()?>" src="<?php print $user->getPicture()?>">
		<span class="hidden-phone"><?php print $user->getName()?></span>
		<button id="logout-button" type="button" class="btn btn-primary">Logout</button>		     			
      	<?php	
      	}	
      	?>
      </p>
    </div>
  </div>
</div>
<div class="container-fluid">
<div class="row-fluid">
<div id="meal-listings" class="span12">

<?php
		
	if ($client == null) {
		$client = new APSDBClient(APSDBConfig :: $ACCOUNT_KEY);
	}
	
	$params = array();
	array_push($params, new KeyValue("apsdb.scriptName", "ftp.api.listMeals"));	
	$mealsResponse = $client->callApi("RunScript", $params);
	$meals = $mealsResponse["response"]["result"]["documents"];	
	$util = new Util();
	$siteUrl = util::$WEB_URL;
	foreach ($meals as $meal) {
	
		$fileUrl = $util->getLinkToFile("pictures", $meal["pictures"], $meal["key"]); 
		$meal["picture"] = $fileUrl;
       ?>       
       <div class="row-fluid">
    	<section id="<?php print $meal['key']?>" class="meal span4" data-meal="<?php print $meal['recipeName']?>" aria-label="print <?php $meal['recipeName']?>" style="background-image: url('<?php print $meal['picture']?>');">
    		<div class="caption">
      			<h2><a href="<?php print $siteUrl . "/getMeal.php?key=" . $meal['key']?>"><?php print $meal['recipeName']?></a></h2>
      			<p><a href="<?php print $siteUrl . "/getMeal.php?key=" . $meal['key']?>"><?php print $meal['description']?></a></p>
    		</div>
  		</section>  	 
  	</div><!--/row-fluid-->
	<?php } ?>
    
  </div><!--/span-->
</div><!--/row-fluid-->
</div><!--/.fluid-container-->
</body>
</html>