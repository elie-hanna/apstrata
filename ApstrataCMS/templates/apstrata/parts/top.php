<!--<div class='sideButton'><a href='http://wiki.apstrata.com/display/doc/Apstrata+CMS' target='_googleCode'>fork this site from google code</a></div>-->
<div class="header-wrap">
	<header>
		<div id="logo">
			<a href="<?php print $GLOBALS["config"]["baseUrl"] . "/" . $GLOBALS["config"]["urlPrefix"] . "home"; ?>" id='logo'>
				<img src="<?php print $GLOBALS["config"]["baseUrl"] ?>/themes/apstrata/images/logo.png" alt="Apstrata" title="Apstrata" />
			</a>
		</div>
		<!-- begin credentials-->
        <div id="credentials">
                <ul>
                    <li class="login" style="display: none;"><a href=<?php echo $config["baseUrl"] . "/" . $config["urlPrefix"] . "dashboard"; ?>>Login</a></li>
                    <li class="dashboard" style="display: none;"><a href=<?php echo $config["baseUrl"] . "/" . $config["urlPrefix"] . "dashboard"; ?>>Dashboard</a></li>
                    <li><a href=<?php echo $config["baseUrl"] . "/" . $config["urlPrefix"] . "register"; ?>>Signup</a></li>
                </ul>
        </div>        
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
				    	echo "class='home'";
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


	
