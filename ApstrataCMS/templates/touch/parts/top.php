<!--<div class='sideButton'><a href='http://wiki.apstrata.com/display/doc/Apstrata+CMS' target='_googleCode'>fork this site from google code</a></div>-->
<div class="header-wrap">
	<header>
		<div id="logo">
			<a href="<?php print $GLOBALS["config"]["baseUrl"]."/page.php?pageId=home"; ?>" id='logo'>
				<img src="themes/touch/images/logo.png" alt="Touch Cloud" title="Touch Cloud" />
			</a>
		</div>
		<!-- begin credentials-->
        <div id="credentials">
                <ul>
                    <li class="login"><a href=<?php echo $config["baseUrl"]."/page.php?pageId=dashboard"; ?>>Login</a></li>
                    <li><a href=<?php echo $config["baseUrl"]."/page.php?pageId=register"; ?>>Signup</a></li>
                </ul>
        </div>
		<!-- begin social media -->
        <div class="social-media">
            <ul>
                <li class="facebook"><a href="#">facebook</a></li>
                <li class="twitter"><a href="#">twitter</a></li>
                <li class="linkedin"><a href="#">linkedin</a></li>
                <li class="youtube"><a href="#">youtube</a></li>
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
					
					$link = $cms->getLink($menuItem)			
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