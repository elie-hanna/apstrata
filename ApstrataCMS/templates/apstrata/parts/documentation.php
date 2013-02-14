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
	
</script>

<script>

	dojo.addOnLoad(function() {
		
		var lastSelected = '';
			
		/*
		 * Connect the toggleSelected function to all the links in
		 * order to manage the link clicked event
		 */
		var menuItems = dojo.query("a[category='menuItem']")
		for (var i = 0; i < menuItems.length; i++) {						
			dojo.connect(menuItems[i], "onclick", function(event) {				
				toggleSelected(event.target);
			});
		}
		
		var imageItems = dojo.query("a[category='imageItem']")
		for (var i = 0; i < imageItems.length; i++) {						
			dojo.connect(imageItems[i], "onclick", function(event) {				
				toggleSelected(event.target);
			});
		}
			
		/*
		 * this function factors out the logic to toggle the selected element on the menu				 
		 */
		toggleSelected = function(newLinkNode) {
			if (lastSelected != '') {	
				var matches = dojo.query("*[id='" + lastSelected.id + "']");		
				for (var i = 0; i < matches.length; i++) {						
					dojo.toggleClass(matches[i], "selected");
				}
			}					

			var matches = dojo.query("*[id='" + newLinkNode.id + "']");		
			for (var i = 0; i < matches.length; i++) {						
				dojo.toggleClass(matches[i], "selected");
			}

			lastSelected = newLinkNode;
		}
	});

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
							
							$urlPrefix = '';
							if (substr($link->address, 0, 7) != 'http://' && substr($link->address, 0, 8) != 'https://') {
								$urlPrefix = $GLOBALS["config"]["urlPrefix"];
							}
							
							echo '<li><a category="menuItem" id="' . $link->key . '" href="' . $urlPrefix . $link->address . '" target="' . $link->target . '">' . $link->title . '</a></li>';
							
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
	    <div class="title"><span>((</span>Apstrata tools</div>
	    <div class="info mrgB20">
			We have created tools and docs for you to have an easy start with us. The wiki contains all what you might need. Getting started guides help you get going and the SDKs make your life easier.                    
		</div>

    	<?php
			foreach ($firstQuery->documents as $item) {		
				
				$item = (object)$item;
				
				$urlPrefix = '';
				if (substr($item->address, 0, 7) != 'http://' && substr($item->address, 0, 8) != 'https://') {
					$urlPrefix = $GLOBALS["config"]["urlPrefix"];
				}
				
				if (!isset($item->parent)) {
		?>	
		
			<!-- begin documentation -->
				<div category="imageItem" id="<?php echo $item->key ?>" class="documentation" onclick="toggleSelected(this);window.open('<?php echo $urlPrefix . $item->address ?>', '<?php echo $item->target ?>');">
					
			
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
    
