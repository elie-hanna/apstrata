<!-- begin footer -->
    <div class="footer-wrap">
     	<footer>
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
            	$links = $cms->getLinks();  
            	$closedUl = false;            	
            	foreach ($links as $link) {
            		
            		$link = (object)$link;             		        		
            		if (count($link->children) > 0) {
            			
            			echo "<section class='title'>";
                		echo "<div class='title'>" . $link->title . "</div>";
                    	echo "<ul>";
            			foreach ($link->children as $subLink) {
            				
            				$subLink = (object)$subLink;
            				echo "<li><a href='" . $subLink->address . "' target='" . $subLink->type ."' >" . $subLink->title . "</a></li>";
            			}
            			
            			echo "</ul>";
            			echo "</section>";
            		}else {
            			
            			$iterator = 0;
            			if ($iterator % 3 === 0) {
            				echo "<ul>";
            				$iterator = $iterator + 1;
            			}
                	
                		echo "<li><a href='" . $link->address . "' target='" . $link->type . "'>" . $link->title . "</a></li>";
                		if ($iterator % 3 === 0) {
            				echo "</ul>";
            				$closedUl = true;
            			}                		
            		} 
            	} 
            	
            	if (!$closedUl) {
            		echo "</ul>";
            	}             
            ?>
            </div>
			<div class="clearfix"></div>
			<div class="copyright">
            	<p>Powered by <a href="http://www.apstrata.com" target="_blank"><img src="themes/touch/images/apstrata.png" alt="Apstrata" title="Apstrata" /></a></p>
                <p>&copy; All Rights Reverved to Touch Cloud</p>
            </div>
    	</footer>
	</div>
<!-- end footer -->  	        	