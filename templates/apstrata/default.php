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
	<body class="<?php print $config['template'] ?>">

<!-- ClickTale Top part -->
<script type="text/javascript">
var WRInitTime=(new Date()).getTime();
</script>
<!-- ClickTale end of Top part -->

<!-- Place this tag in your head or just before your close body tag -->
<script type="text/javascript" src="https://apis.google.com/js/plusone.js">
  {parsetags: 'explicit'}
</script>
	<div id='wrap'>	
		<?php 
			include("templates/" . $config['template'] . "/parts/top.php");			
		?>			
		
		<?php 
			if ($page['template'] != "home") {
		?>
			<div class="container">             	
				<!-- begin content wrap-->
				<div class="content-wrap">
			    	<!-- begin content -->
			        <div class="content">
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
		
	</div> <!-- end container -->
	<div class="clearfix"></div>
	</div><!--end wrap -->
	<?php 
		include("templates/" . $config['template'] . "/parts/bottom.php");
	?>
<!--  CRAZY EGG START -->
<script type="text/javascript">
setTimeout(function(){var a=document.createElement("script");
var b=document.getElementsByTagName("script")[0];
a.src=document.location.protocol+"//dnn506yrbagrg.cloudfront.net/pages/scripts/0022/8830.js?"+Math.floor(new Date().getTime()/3600000);
a.async=true;a.type="text/javascript";b.parentNode.insertBefore(a,b)}, 1);
</script>
<!-- CRASY EGG END -->

<!-- ClickTale Bottom part -->
<script type='text/javascript'>
// The ClickTale Balkan Tracking Code may be programmatically customized using hooks:
// function ClickTalePreRecordingHook() { /* place your customized code here */ Ê}
// For details about ClickTale hooks, please consult the wiki page http://wiki.clicktale.com/Article/Customizing_code_version_2

document.write(unescape("%3Cscript%20src='"+
(document.location.protocol=='https:'?
"https://cdnssl.clicktale.net/www07/ptc/0e133f69-ff35-469f-8c11-54dd9f9956f4.js":
"http://cdn.clicktale.net/www07/ptc/0e133f69-ff35-469f-8c11-54dd9f9956f4.js")+"'%20type='text/javascript'%3E%3C/script%3E"));
</script>
<!-- ClickTale end of Bottom part -->
	</body>
</html>
