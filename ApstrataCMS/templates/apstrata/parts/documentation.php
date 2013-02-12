<?php
	
	$title='';
	$section1='';
		
	if (isset($page["title"])) $title=$page["title"];
	if (isset($page["section1"])) $section1=$page["section1"];
	
	if (isset($page["firstQuery"])) $firstQuery= (object)($page["firstQuery"]);
	if (isset($page["secondQuery"])) $secondQuery= (object)($page["secondQuery"]);
?>

<script>
    dojo.require("apstrata.sdk.Connection");
	var connectionData = {
			credentials: {
				key: '<?php print $GLOBALS["config"]["apstrataKey"]; ?>'								
			},
			serviceURL: '<?php print $GLOBALS["config"]["apstrataServiceURL"]; ?>',
			defaultStore: '<?php print $GLOBALS["config"]["contentStore"]; ?>',
			timeout: parseInt('<?php print $GLOBALS["config"]["apstrataConnectionTimeout"]; ?>')
		}
		
	var connection = new apstrata.sdk.Connection(connectionData);
	
	var title = "<?php echo strtolower($title); ?>Link";
	var linkNode = dojo.byId(title);
	if (linkNode) {
		dojo.addClass(linkNode, "selected");
	};
	
</script>


<h1 class="marB20"><?php print $title; ?></h1>	

<!-- begin side menu -->
        <div class="side-menu">                    	
            <!-- begin navigation -->
            <div class="navigation">
            	<div class="top"></div>
            	
            	
            	<div class="middle">
            		<ul>
		            	<?php
		            	$prevLinkKey = '';
		            	$prevLinkParent = '';
						foreach ($firstQuery->documents as $link) {		
							$link = (object)$link;
							if (isset($link->parent)) {
								if ($link->parent == $prevLinkKey) {
									echo '<ul class="submenu">';	
								} else if ($link->parent != $prevLinkParent){
									echo '</ul>';
								}
								$prevLinkParent = $link->parent;
							} else if ($prevLinkParent != ''){
								$prevLinkParent = '';
								echo '</ul>';
							}
							$prevLinkKey = $link->key;
							
							echo '<li><a id="' . $link->key . '" href="' . $link->address . '" target="' . $link->target . '">' . $link->title . '</a></li>';
							
						}						
						?>	
					</ul>
				</div>
            	
                <div class="bottom"></div>
            </div>
            <!-- end navigation -->
        </div>
        <!-- end side menu -->
    
    <!-- begin editorial -->
    <div class="editorial">
	    <div class="title"><span>((</span>Touch cloud tools</div>
	    <div class="info mrgB20">
			We have created tools and docs for you to have an easy start with us. The wiki contains all what you might need. Getting started guides help you get going and the SDKs make your life easier.                    
		</div>

    	<?php
			foreach ($firstQuery->documents as $item) {		
				
				$item = (object)$item;
				
				if (!isset($item->parent)) {
		?>	
		
			<!-- begin documentation -->
			<?php
				if (!isset($item->target) || $item->target == "_none") {
			?>
					<div class="documentation" onclick="location.href='<?php echo $item->address ?>';">
					
			<?php
				} else {
			?>
			
					<div class="documentation" onclick="window.open('<?php echo $item->address ?>');">
			
			<?php
				} 
			?>
			    
			    <script> 
			        // Build the URL to the image file
			    	var params = {
						"apsdb.fieldName": "regularIcon",
						"apsdb.fileName": "<?php echo $item->regularIcon ?>",
						"apsdb.store": "apstrata",
						"apsdb.documentKey": "<?php echo $item->key ?>"
					};
			      
			    	var imageUrl = connection.sign("GetFile", dojo.objectToQuery(params)).url;           
			    </script>
			    <?php 
			       if (isset($item->regularIcon)) {
			       		echo "<div class='image'><img id='" . $item->regularIcon . "'/></div>";
					}
				?>
				
				<h2><?php echo $item->title ?></h2>
				<div class="info"><?php echo $item->description ?></div>
				
				<?php
			       print html_entity_decode($item->section1);
			     ?>
			     <script>
			        <?php echo "dojo.byId('" . $item->regularIcon . "').src = imageUrl"; ?>
			     </script>
			</div>
			<!-- end documentation -->
			
		<?php
				}
			}
		?>	
        
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