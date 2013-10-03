<!--<div class='sideButton'><a href='http://wiki.apstrata.com/display/doc/Apstrata+CMS' target='_googleCode'>fork this site from google code</a></div>-->
<div class="Mainrow">
	<div class="header-wrap">
		<header>
			 <?php 
	if ($page['template'] != "test-dashboard") 
	{
	?>   
			<div id="logo">
				<a href="<?php print $GLOBALS["config"]["baseUrl"]; ?>" id='logo'>
					<img src="<?php print $GLOBALS["config"]["baseUrl"] ?>/themes/touch/images/logo.png" alt="Touch Cloud" title="Touch Cloud" />
				</a>
			</div>
	 <?php
	}
  ?>	
  
  
  			 <?php 
	if ($page['template'] == "test-dashboard") 
	{
	?>   
			<div id="innerLogo">
				<a href="<?php print $GLOBALS["config"]["baseUrl"]; ?>" id='logo'>
					<img src="<?php print $GLOBALS["config"]["baseUrl"] ?>/themes/touch/images/innerLogo.png" alt="Touch Cloud" title="Touch Cloud" />
				</a>
			</div>
	 <?php
	}
  ?>		
  	
	        <!-- Begin logging header -->
			 <script type="text/javascript">
			 	dojo.addOnLoad(function() { 
			 		dojo.require("apstrata.home.Logging");
			 	 	var loggingHeader = new apstrata.home.Logging({
				        		loginUrl: "<?php echo $config["baseUrl"] . "/" . $config["urlPrefix"] . "loginboard"; ?>", 
				        		signupUrl:"<?php echo $config["baseUrl"] . "/" . $config["urlPrefix"] . "register"; ?>",
				        		dashboardUrl: "<?php echo $config["baseUrl"] . "/" . $config["urlPrefix"] . "test-dashboard"; ?>",
				        		logoutUrl:"<?php echo $config["baseUrl"]; ?>",
				        		credentials: apstrata.apConfig["apstrata.sdk"].Connection.credentials
				      }, dojo.byId("loggingHeader"));  
			 	});
			 </script>
	        <div id="loggingHeader"></div>
	        <!-- end logging header -->
	 
	 <?php 
	if ($page['template'] != "test-dashboard") 
	{
	?>       
			<!-- begin social media -->
	        <div class="social-media">
	            <ul>
	                <li class="facebook"><a href="https://www.facebook.com/TouchCloudLB" target="_blank">facebook</a></li>
	                <li class="twitter"><a href="https://twitter.com/#!/touchlebanon" target="_blank">twitter</a></li>
	                <li class="youtube"><a href="http://www.youtube.com/touchlebanon" target="_blank">youtube</a></li>
	            </ul>
	        </div>
	        <!-- end social media -->
   <?php
	}
  ?>
		</header>
	</div>      
	
<?php 
	if ($page['template'] != "test-dashboard") 
	{
	?>
	
	<div id="nav-wrapper">
	    <nav>				        	
	        <ul class="menu">
	        	<?php						
					foreach ($menu["menuPhp"] as $menuItem) {									
						
						$link = $cms->getLink($menuItem);							
				?>													
					<li 
					  <?php 
					    if (strcasecmp($link, "home") == 0) {
					    	echo "class='home''";
					    } ?> 
					>
				<?php echo $link ?>
					</li>						
				<?php
					}				
				?>		            	
	        </ul>		        	
	    </nav>
	</div>
	<?php
	}
  ?>
</div>
<script>
	dojo.addOnLoad(function() {	
		dojo.require("dojo.cookie");
		var lastSelected = dojo.cookie("lastSelected");
		if (lastSelected) {
			var node = dojo.byId(lastSelected);
			if (node) {
				dojo.removeClass(node, "selected");
			}
		}
	});
</script>		