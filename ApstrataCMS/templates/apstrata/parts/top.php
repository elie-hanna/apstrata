<!--<div class='sideButton'><a href='http://wiki.apstrata.com/display/doc/Apstrata+CMS' target='_googleCode'>fork this site from google code</a></div>-->
<div class="header-wrap">
	<header>
		<div id="logo">
			<a href="<?php print $GLOBALS["config"]["baseUrl"]."/page.php?pageId=home"; ?>" id='logo'>
				<img src="lib/ApstrataSDK/apstrata/horizon/resources/images/apstrata-big.png" alt="Apstrata" title="Apstrata" width="200px"/>
			</a>
		</div>
		<!-- begin credentials-->
        <div id="credentials">
                <ul>
                    <li class="login"><a href=<?php echo $config["baseUrl"]."/page.php?pageId=dashboard"; ?>>Login</a></li>
                    <li class="logout" style="display: none;"><a href="#">Log out</a></li>
                    <li><a href=<?php echo $config["baseUrl"]."/page.php?pageId=register"; ?>>Signup</a></li>
                </ul>
        </div>
		<!-- begin social media -->
        <div class="social-media">
            <ul>
                <li class="facebook"><a href="https://www.facebook.com/Apstrata" target="_blank">facebook</a></li>
                <li class="twitter"><a href="https://twitter.com/apstrata" target="_blank">twitter</a></li>
                <li class="linkedin"><a href="http://www.linkedin.com/company/apstrata" target="_blank">linkedin</a></li>
            </ul>
        </div>
        <!-- end social media -->
	</header>
</div>      
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
<div class="clearfix"></div>	
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