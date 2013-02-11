<?php
	$page = $cms->getPage("siteMap");	
	if (isset($page["firstQuery"])) $firstQuery= (object)($page["firstQuery"]);
	if (isset($page["secondQuery"])) $secondQuery= (object)($page["secondQuery"]);
?>

<!-- begin footer -->
    <div class="footer-wrap">
     	<footer>
     		
			<!-- begin social media -->
	        <div class="social-media">
            	<h3>Let's talk</h3>
                <p>Follow Apstrata on</p>
	            <ul>
	                <li class="facebook"><a href="https://www.facebook.com/Apstrata" target="_blank">facebook</a></li>
	                <li class="twitter"><a href="https://twitter.com/apstrata" target="_blank">twitter</a></li>
	                <li class="linkedin"><a href="http://www.linkedin.com/company/apstrata" target="_blank">linkedin</a></li>
	            </ul>
	        </div>
	        <!-- end social media -->
     		
     		<form action="http://apstrata.us5.list-manage1.com/subscribe/post?u=e47d89e2bf16064cf52d8c9ae&amp;id=d603e02565" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" target="_blank" novalidate>
        	<div class="newsletter">
            	<h3>We'd like to stay in touch!</h3> 
                <p>Subscribe to our monthly newsletter for great articles and cool features.</p>
                <div class="textfield">
         			<input type="text" value="enter your email" name="EMAIL" id="mce-EMAIL" required>
         		</div>
       			<div class="btn"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe"></div>				
            </div>
            </form>
            
            <div class="clearfix"></div>
            <div class="site-map">
            
	            <?php
	            	$prevLinkParent = '';
					$sectionOpen = false;
					$ulOpen = false;
					$counter = 0;
									
					foreach ($firstQuery->documents as $link) {		
						$link = (object)$link;
						
						$counter = $counter + 1;
						
						if ($link->address == "#") {
							if ($sectionOpen == true) {
								echo '</ul>';
								echo '</section>';
								$sectionOpen = false;
							}
							
							if ($ulOpen == true) {
								echo '</ul>';
								$ulOpen = false;
							}
							
							echo '<section>';
							echo '<div class="title">' . $link->title . '</div>';	
							echo '<ul>';
							$sectionOpen = true;
							$prevLinkParent = '';
							$counter = 1;
						} else {
							if (isset($link->parent)){							
								$prevLinkParent = $link->parent;
								if ($counter > 3) {
									echo '</ul>';
									echo '<ul>';
									$counter = 1;
								}
							} else {
								if ($prevLinkParent != '') {
									if ($sectionOpen == true) {
										echo '</ul>';
										echo '</section>';
										$sectionOpen = false;
									}
									
									if ($ulOpen == true) {
										echo '</ul>';
										$ulOpen = false;
									}
									
									$counter = 1;
									
									echo '<ul>';
									$ulOpen = true;							
								} else if ($counter > 3) {
									echo '</ul>';
									echo '<ul>';
									$counter = 1;									
								}
								
								$prevLinkParent = '';
							}
						
							echo '<li><a id="' . $link->key . '" href="' . $link->address . '" target="' . $link->target . '">' . $link->title . '</a></li>';
							
						}
						
					}	
					
					if ($sectionOpen == true) {
						echo '</ul>';
						echo '</section>';
					}
					
					if ($ulOpen == true) {
						echo '</ul>';
					}
					
				?>
					
            </div>          

			<div class="clearfix"></div>
			<div class="copyright">
                <p>&copy; All Rights Reverved to Apstrata</p>
    			<div id="social">
					<ul class="social-bookmarks">			
						<li><script src="//platform.linkedin.com/in.js" type="text/javascript"></script>
							<script type="IN/Share" data-url="http://www.apstrata.com" data-counter="right"></script></li>
						<li><div class="g-plusone" data-size="medium" data-href="http://www.apstrata.com"></div></li>
						<li><iframe src="//www.facebook.com/plugins/like.php?href=http://www.apstrata.com&amp;send=false&amp;layout=button_count&amp;width=450&amp;show_faces=true&amp;action=like&amp;colorscheme=light&amp;font&amp;height=80" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:100px; height:21px;" allowTransparency="true"></iframe></li>
						<script type="text/javascript">gapi.plusone.go();</script>
					</ul>
				</div>                
            </div>
    	</footer>
	</div>
<!-- end footer -->  	        	