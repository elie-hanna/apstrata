<link rel="stylesheet" type="text/css" href="./css/style.css">
<link rel="stylesheet" type="text/css" href="./css/bootstrap.min.css">
<div class="navbar navbar-inverse navbar-fixed-top">
  <div class="navbar-inner">
    <div class="container-fluid">
      <a class="brand" href="http://as.elementn/listMeals.php">Meals with Friends</a>
      <p id="user-identity" class="navbar-text pull-right"></p>
    </div>
  </div>
</div>
<div class="container-fluid">
<div class="row-fluid">
<div id="meal-listings" class="span12">

<?php
	
	require_once 'lib/APSDB/APSDBClient.php';
	require_once 'lib/APSDB/APSDBConfig.php';
	require_once 'util.php';
	error_reporting(E_ALL);
	ini_set('display_errors', '1');
	$client = new APSDBClient(APSDBConfig :: $ACCOUNT_KEY);
	$params = array();
	array_push($params, new KeyValue("apsdb.scriptName", "ftp.api.listMeals"));	
	$mealsResponse = $client->callApi("RunScript", $params);
	$meals = $mealsResponse["response"]["result"]["documents"];	
	$util = new Util();
	foreach ($meals as $meal) {
	
		$fileUrl = $util->getLinkToFile("pictures", $meal["pictures"], $meal["key"]); 
		$meal["picture"] = $fileUrl;
       ?>       
       <div class="row-fluid">
    	<section id="<?php print $meal['key']?>" class="meal span4" data-meal="<?php print $meal['recipeName']?>" aria-label="print <?php $meal['recipeName']?>" style="background-image: url('<?print $meal['picture']?>');">
    		<div class="caption">
      			<h2><a href="<?php print "/getMeal.php?key=" . $meal['key']?>"><?php print $meal['recipeName']?></a></h2>
      			<p><a href="<?php print "/getMeal.php?key=" . $meal['key']?>"><?php print $meal['description']?></a></p>
    		</div>
  		</section>  	 
  	</div><!--/row-fluid-->
	<?php } ?>


    
  </div><!--/span-->
</div><!--/row-fluid-->
</div><!--/.fluid-container-->