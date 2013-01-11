<?php
	
	$title='';
	$section1='';
		
	if (isset($page["title"])) $title=$page["title"];
	if (isset($page["section1"])) $section1=$page["section1"];
?>

<!-- begin side menu -->
        <div class="side-menu">                    	
        	<h1>documentation</h1>
            <!-- begin navigation -->
            <div class="navigation">
            	<div class="top"></div>
                <div class="middle">
                    <ul>
                        <li><a id="wiki" href="http://wiki.apstrata.com" target="_blank">the wiki</a></li>
                        <li><a id="touchCloud" href="" class="selected">get started with touch cloud</a>
                        	<ul class="submenu">
                        		<li><a id="ios" href="http://wiki.apstrata.com/display/doc/iOS+SDK" target="_blank">iOS</a></li>
                        		<li><a id="android" href="http://wiki.apstrata.com/display/doc/Android+SDK" target="_blank">android</a></li>
                        		<li><a id="js" href="http://wiki.apstrata.com/display/doc/Javascript+SDK" target="_blank">javascript</a></li>
                        		<li><a id="rest" href="http://wiki.apstrata.com/display/doc/REST+API+Reference" target="_blank">rest api</a></li>
                            </ul>
                        </li>
                        <li><a href="">SDKs</a>
                        	<ul class="submenu">
                        		<li><a id="iosDownload"  href="http://code.google.com/p/apstrata/downloads/detail?name=apstrata-iOS-sdk12212012.zip&can=2&q=" target="_blank">downnload iOS SDK</a></li>
                        		<li><a id="androidDownload" href="http://code.google.com/p/apstrata/downloads/detail?name=apstrata-android-sdk20121116.zip&can=2&q=" target="_blank">downnload android SDK</a></li>
                        		<li><a id="jsDownload" href="http://code.google.com/p/apstrata/downloads/detail?name=Apstrata-JS-HTML5-SDK11232012.zip&can=2&q=" target="_blank">downnload javascript SDK</a></li>
                            </ul>
                        </li>
                        <li><a id="tutorials" href="http://wiki.apstrata.com/display/doc/Tutorials" target="_blank">tutorials</a></li>
                        <li><a id="blog" href="http://blog.apstrata.com" target="_blank">blog</a></li>
                    </ul>
            	</div>
                <div class="bottom"></div>
            </div>
            <!-- end navigation -->
        </div>
        <!-- end side menu -->
    
    <!-- begin editorial -->
    <div class="editorial">
    	<div class="title"><span>((</span><?php echo $title; ?></div>
        <?php print html_entity_decode($section1); ?> 
        
    </div>
    <!-- end editorial -->
    
 <script>

	dojo.addOnLoad(function() {
		
		var title = "documentationLink";
		var linkNode = dojo.byId(title);
		if (linkNode) {
			dojo.addClass(linkNode, "selected");
		};
		
		var lastSelected = dojo.byId("touchCloud");
			
		/*
		 * Connect the toggleSelected function to all the links in
		 * order to manage the link clicked event
		 */
		var allLinks = dojo.query("a");
		for (var i = 0; i < allLinks.length; i++) {						
			dojo.connect(allLinks[i], "onclick", function(event) {				
				toggleSelected(event.target);
			});
		}
	
		/*
		 * this function factors out the logic to toggle the selected element on the menu				 
		 */
		var toggleSelected = function(newLinkNode) {					
			dojo.toggleClass(lastSelected, "selected");					
			dojo.toggleClass(newLinkNode, "selected");
			lastSelected = newLinkNode;
		}
	});

</script>