<?php
	$menu = $cms->getMenu();	
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
		<title>
			<?php 
				if (!isset($page["windowTitle"])) {
					$page["windowTitle"] = "Apstrata Website";
				} 
				print $page["windowTitle"];
				
			?>
		</title>
		<?php 
			if(isset($page["summaryMode"]) &&  $page["summaryMode"] == "true"){
				include("templates/" . $config['template'] . "/parts/head-summary.php");				
			}else{
				include("templates/" . $config['template'] . "/parts/head.php");
			}
		?>
		<script language="javascript" type="text/javascript" src="<?php print $GLOBALS["config"]["baseUrl"] ?>/lib/editarea/edit_area/edit_area_full.js"></script>
	</head>
	<body class="<?php print $config['template'] ?> amc">
<!-- Place this tag in your head or just before your close body tag -->
<script type="text/javascript" src="https://apis.google.com/js/plusone.js">
  {parsetags: 'explicit'}
</script>
	<div class='frame'>	
		<?php 
			include("templates/" . $config['template'] . "/parts/top.php");			
		?>			
		
		<?php 
			if ($page['template'] != "home") {
		?>
			<div class="container Mainrow expand">             	
				<!-- begin content wrap-->
				<div class="content-wrap">
			    	<!-- begin content -->
			        <div class="content-page">
		<?php
			}
		?>
		
		<?php
		  
			include("templates/". $config['template'] . "/parts/" . $page['template'] . ".php");
		?>
		
		<?php 
			if ($page['template'] != "home") {
		?>
				  <!-- end content -->
		        <div class="clearfix"></div>
		    </div>
		    <!-- end content wrap-->
		</div>
		 <!-- end wrapper -->
		
		<?php
			}
		?>
		
	</div> 
	<!-- end container -->
	<?php 
		include("templates/" . $config['template'] . "/parts/bottom.php");
	?>
	</div><!--end frame -->
	</body>
</html>
