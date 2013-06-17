<?php 

	require_once 'lib/APSDB/APSDBClient.php';
	require_once 'lib/APSDB/APSDBConfig.php';
	error_reporting(E_ALL);
	ini_set('display_errors', '1');
	$client = new APSDBClient(APSDBConfig::$ACCOUNT_KEY);
		
	// verify if the request contains the key of a meal document or the document itself
	$key = $_REQUEST['key'];
	
	// if the request contains the key of a meal document, we need to retrive the document before
	// rendering the page
	$meal = null;
	if ($key != null) {
		
		$params = array();
		array_push($params, new KeyValue("key", $key));
		array_push($params, new KeyValue("apsdb.scriptName", "ftp.api.getMeal"));	
			
		$mealDocResp = $client->callApi("RunScript", $params);
		$meal = $mealDocResp["response"]["result"];	
		
		// join the content of the ingredients array into a string
		$meal["ingredients"] = join(",", $meal["ingredients"]);
		
		// build the link to the image of the meal
		$timestamp = round(microtime(true) * 1000);
		$fileUrl = APSDBConfig::$SERVICE_URL . "/" . APSDBConfig::$ACCOUNT_KEY . "/GetFile?apsws.time=" . $timestamp . "&apsws.responseType=json&";
		$fileUrl = $fileUrl . "apsdb.fileName=" .  $meal["pictures"] . "&apsdb.fieldName=pictures&apsdb.documentKey=" . $key . "&apsdb.store=" . APSDBConfig::$ACCOUNT_STORE;
		$meal["picture"] = $fileUrl;
	}else {
		
		// otherwise, the meal data is already available in the request as a JSON object
		$mealStr = $_REQUEST['meal'];
		$mealStr = str_replace('\\', '', $mealStr);
		$mealStr = str_replace(';=', '=', $mealStr);
		$meal = json_decode($mealStr, true);
	}
	
?>
<body>
	<div class="container-fluid">	
	<section id="meal" class="meal row-fluid" data-meal="<?php print $meal['recipeName']?>" data-mealtitle="<?php print $meal['recipeName']?>" role="main">
	  <div class="span4 thumbnail img-container"><img alt="<?php print $meal['recipeName']?>" src="<?php print $meal['picture']?>"</div>
	  <div class="span8">
	    <header>
	      <h1><?php print $meal['recipeName']?></h1>
	      <p class="lead"><?php print $meal['description']?></p>
	    </header>
	
	    <p id="ingredients"><?php print $meal['ingredients']?></p>
	
	    <div id="social-actions"></div>
	  </div>
	</section>	
	</div><!--/.fluid-container-->
</body>