<?php
	
	$title='';
	$section1='';
		
	if (isset($page["title"])) $title=$page["title"];
	if (isset($page["section1"])) $section1=$page["section1"];
	
	if (isset($page["firstQuery"])) $firstQuery= (object)($page["firstQuery"]);
	if (isset($page["secondQuery"])) $secondQuery= (object)($page["secondQuery"]);
?>

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

        <?php
		foreach ($secondQuery->documents as $pageItem) {		
			$pageItem = (object)$pageItem;
			print html_entity_decode($pageItem->section1);
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