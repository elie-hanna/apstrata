<?php
	
	require_once 'lib/APSDB/APSDBClient.php';
	require_once 'lib/APSDB/APSDBConfig.php';
	require_once 'util.php';
	require_once 'User.php';
	require_once 'LoginManager.php';

	$user = LoginManager::handleUser();	
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
			url = url + "&apsdb.scriptName=social.api.facebookLogin&redirectAfterLogin=true&";
			url = url + "loggedInRedirectUrl=" + encodeURIComponent("<?php print Util::$WEB_URL?>/index.php");
			url = url + "&returnApstrataToken=true";
			window.location.assign(url);	
		}
	</script>
</head>
<body>
<div class="navbar navbar-inverse navbar-fixed-top">
  <div class="navbar-inner">
    <div class="container-fluid">
      <a class="brand" href="<?php Util::$WEB_URL?>/index.php"> Meals with Friends</a>
      <p id="user-identity" class="navbar-text pull-right">
      	<?php     	
      		
      		if ($user == null && $isApstrataTokenValid == false ) {
      	?>
      			<button id="login-button" class="btn btn-primary" type="button" onclick="facebookLogin()">Login</button>
      	<?php }
      		
      		if ($user != null) {
      	?>	
		      		<img width="25" height="25" alt="<?php print $user->getName()?>" src="<?php print $user->getPicture()?>">
					<span class="hidden-phone"><?php print $user->getName()?></span>
					<button id="logout-button" type="button" class="btn btn-primary" onclick="window.open('<?php print Util::$WEB_URL . '/logout.php?paramString=index.php'?>', '_self')">Logout</button>		
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
	$index = 0;
	foreach ($meals as $meal) {
	
		$fileUrl = $util->getLinkToFile("pictures", $meal["pictures"], $meal["key"]); 
		$meal["picture"] = $fileUrl;
		if ($index++ % 3 == 0) {
	       print '<div class="row-fluid">';
		}
       	?> 
    	<section id="<?php print $meal['key']?>" class="meal span4" data-meal="<?php print $meal['recipeName']?>" aria-label="print <?php $meal['recipeName']?>" style="background-image: url('<?php print $meal['picture']?>');">
    		<div class="caption">
      			<h2><a href="<?php print $siteUrl . "/getMeal.php?key=" . $meal['key']?>"><?php print $meal['recipeName']?></a></h2>
      			<p><a href="<?php print $siteUrl . "/getMeal.php?key=" . $meal['key']?>"><?php print $meal['description']?></a></p>
    		</div>
  		</section>  	 
  		<?php 
  		if ($index % 3 == 0) {
  			print '</div><!--/row-fluid-->';
  		}
	}	
	?>    
  </div><!--/span-->
</div><!--/row-fluid-->
</div><!--/.fluid-container-->
</body>
</html>