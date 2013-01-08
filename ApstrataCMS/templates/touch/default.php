<?php
	$menu = $cms->getMenu();	
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
		<title>
			<?php 
				if (!isset($page["title"])) {
					$page["title"] = "Apstrata Website";
				} 
				print $page["title"];
				
			?>
		</title>
		<?php 
			if(isset($page["summaryMode"]) &&  $page["summaryMode"] == "true"){
				include("templates/" . $config['template'] . "/parts/head-summary.php");				
			}else{
				include("templates/" . $config['template'] . "/parts/head.php");
			}
		?>
		<script language="javascript" type="text/javascript" src="lib/editarea/edit_area/edit_area_full.js"></script>
	</head>
	<body class="<?php print $config['template'] ?>">
<!-- Place this tag in your head or just before your close body tag -->
<script type="text/javascript" src="https://apis.google.com/js/plusone.js">
  {parsetags: 'explicit'}
</script>
	<div id='wrap'>	
		<?php 
			include("templates/" . $config['template'] . "/parts/top.php");			
		?>			
		
		<div class="container">             	
			<!-- begin content wrap-->
			<div class="content-wrap">
		    	<!-- begin content -->
		        <div class="content">
		<?php		
		   
			include("templates/". $config['template'] . "/parts/" . $page['template'] . ".php");
		?>
		
				  <!-- end content -->
		        <div class="clearfix"></div>
		    </div>
		    <!-- end content wrap-->
		</div>
		 <!-- end wrapper -->
		
	</div> <!-- end container -->
	<div class="clearfix"></div>
	</div><!--end wrap -->
	<?php 
		include("templates/" . $config['template'] . "/parts/bottom.php");
	?>

	</body>
</html>
