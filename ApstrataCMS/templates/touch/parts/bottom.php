<!-- begin footer -->
    <div class="footer-wrap">
     	<footer>
        	<div class="newsletter">
            	<h3>We'd like to stay in touch!</h3>
                <p>Subscribe to our monthly newsletter for great articles and cool features.</p>
                <div class="textfield"><input type="text" value="enter your email" /></div>
                <div class="btn"><input type="submit" /></div>
            </div>
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
            	<p>Powered by <a href="http://www.apstrata.com" target="_blank"><img src="images/apstrata.png" alt="Apstrata" title="Apstrata" /></a></p>
                <p>&copy; All Rights Reverved to Touch Cloud</p>
            </div>
    	</footer>
	</div>
<!-- end footer -->  	        	