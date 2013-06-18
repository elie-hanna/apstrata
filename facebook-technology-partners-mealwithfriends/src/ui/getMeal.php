<?php 

	require_once 'lib/APSDB/APSDBClient.php';
	require_once 'lib/APSDB/APSDBConfig.php';
	require_once 'util.php';
	
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
		$util = new Util();
		$fileUrl = $util->getLinkToFile("pictures", $meal["pictures"], $key); 
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
		<section id="meal" class="meal row-fluid" data-meal="<?php print $meal['recipeName']?>" data-mealtitle="<?php print $meal['recipeName']?>" role="main">
		  <div class="span4 thumbnail img-container"><img alt="<?php print $meal['recipeName']?>" src="<?php print $meal['picture']?>"/></div>
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