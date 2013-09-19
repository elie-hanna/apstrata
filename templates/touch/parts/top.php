<!--<div class='sideButton'><a href='http://wiki.apstrata.com/display/doc/Apstrata+CMS' target='_googleCode'>fork this site from google code</a></div>-->
<div class="header-wrap">
	<header>
		<div id="logo">
			<a href="<?php print $GLOBALS["config"]["baseUrl"]; ?>" id='logo'>
				<img src="<?php print $GLOBALS["config"]["baseUrl"] ?>/themes/touch/images/logo.png" alt="Touch Cloud" title="Touch Cloud" />
			</a>
		</div>
		<!-- begin credentials-->
        <div id="credentials">
                <ul>
                    <li class="login"><a href=<?php echo $config["baseUrl"] . "/" . $config["urlPrefix"] . "dashboard"; ?>>Login</a></li>
                    <li class="logout" style="display: none;"><a href="#">Log out</a></li>
                    <li><a href=<?php echo $config["baseUrl"] . "/" . $config["urlPrefix"] . "register"; ?>>Signup</a></li>
                </ul>
        </div>
		<!-- begin social media -->
        <div class="social-media">
            <ul>
                <li class="facebook"><a href="https://www.facebook.com/TouchCloudLB" target="_blank">facebook</a></li>
                <li class="twitter"><a href="https://twitter.com/#!/touchlebanon" target="_blank">twitter</a></li>
                <li class="youtube"><a href="http://www.youtube.com/touchlebanon" target="_blank">youtube</a></li>
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